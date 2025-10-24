'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { processApplication, type ProcessedData } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Sparkles, Clipboard, Download, Loader2, ArrowLeft, FileText, Briefcase } from 'lucide-react';

const formSchema = z.object({
  resume: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'Your resume is required.')
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, 'Max file size is 5MB.')
    .refine(
      (files) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(files?.[0]?.type),
      'Only .pdf, .doc, and .docx formats are supported.'
    ),
  jobDescription: z.string().min(5, 'Job description must be at least 5 characters.'),
});

type ViewState = 'form' | 'loading' | 'results';

export function ResumeOptimizerSection() {
  const [view, setView] = useState<ViewState>('form');
  const [results, setResults] = useState<ProcessedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setView('loading');
    const file = values.resume[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const response = await processApplication(dataUri, values.jobDescription);

      if (response.success) {
        setResults(response.data);
        setView('results');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error,
        });
        setView('form');
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to read the resume file.',
      });
      setView('form');
    };
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: `Your ${type} has been copied.`,
    });
  };

  const downloadAsTxt = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleStartOver = () => {
    form.reset();
    setResults(null);
    setFileName('');
    setView('form');
  };

  if (view === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-headline font-semibold mb-2">Analyzing your application...</h2>
            <p className="text-muted-foreground">Our AI is working its magic to tailor your resume and cover letter. This may take a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'results' && results) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={handleStartOver} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Start Over
        </Button>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-2">
              <Sparkles className="text-primary" /> Your Tailored Application
            </CardTitle>
            <CardDescription>Here are your AI-optimized documents and key skills analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resume">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="resume">Optimized Resume</TabsTrigger>
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                <TabsTrigger value="skills">Key Skills</TabsTrigger>
              </TabsList>
              <div className="mt-4 p-4 border rounded-md min-h-[400px] bg-background">
                <TabsContent value="resume">
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(results.optimizedResume, 'resume')}>
                      <Clipboard className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsTxt(results.optimizedResume, 'optimized-resume.txt')}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap font-body text-sm">{results.optimizedResume}</pre>
                </TabsContent>
                <TabsContent value="cover-letter">
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(results.coverLetter, 'cover letter')}>
                      <Clipboard className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsTxt(results.coverLetter, 'cover-letter.txt')}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap font-body text-sm">{results.coverLetter}</pre>
                </TabsContent>
                <TabsContent value="skills">
                  <h3 className="font-semibold text-lg mb-4">Key Skills Identified from Job Description</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Land Your Dream Job, Faster.</h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          Upload your resume and the job description. Our AI will rewrite your resume and generate a personalized cover letter to beat the applicant tracking systems.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create Your Application</CardTitle>
          <CardDescription>Provide your documents and let our AI do the heavy lifting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-lg font-semibold"><FileText /> Your Resume</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <label
                            htmlFor="resume-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 5MB)</p>
                            </div>
                            {fileName && <p className="text-sm text-foreground font-medium">{fileName}</p>}
                          </label>
                          <Input
                            id="resume-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              setFileName(e.target.files?.[0]?.name || '');
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-lg font-semibold"><Briefcase /> Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full job description here..."
                          className="resize-none flex-grow h-64"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={view === 'loading'} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {view === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Optimize My Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
