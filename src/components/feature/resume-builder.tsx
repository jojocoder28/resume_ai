'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Clipboard, Download, FileType, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResumeBuilder, PersonalInfoSchema, SummarySchema, ExperienceSchema, EducationSchema, SkillsSchema, type PersonalInfoData, type SummaryData, type ExperienceData, type EducationData, type SkillsData } from '@/contexts/ResumeBuilderContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { buildResume } from '@/app/actions';
import showdown from 'showdown';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { classicTemplateImage, modernTemplateImage } from '@/lib/placeholder-images';

type Template = 'classic' | 'modern';

const steps = [
    { id: 'template', title: 'Choose a Template' },
    { id: 'personal', title: 'Personal Information' },
    { id: 'summary', title: 'Professional Summary' },
    { id: 'experience', title: 'Work Experience' },
    { id: 'education', title: 'Education' },
    { id: 'skills', title: 'Skills & Finish' },
];

export function ResumeBuilder() {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <TemplateStep onNext={nextStep} />;
            case 1: return <PersonalInfoStep onNext={nextStep} onPrev={prevStep} />;
            case 2: return <SummaryStep onNext={nextStep} onPrev={prevStep} />;
            case 3: return <ExperienceStep onNext={nextStep} onPrev={prevStep} />;
            case 4: return <EducationStep onNext={nextStep} onPrev={prevStep} />;
            case 5: return <SkillsStep onNext={onNext} onPrev={prevStep} />;
            case 6: return <FinishStep onPrev={prevStep} />;
            default: return null;
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Resume Builder</CardTitle>
                <CardDescription>
                    {currentStep < steps.length ? `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}` : 'Your Resume is Ready!'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderStep()}
            </CardContent>
        </Card>
    );
}

function TemplateStep({ onNext }: { onNext: () => void }) {
    const { formData, updateTemplate } = useResumeBuilder();
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(formData.template);

    const handleNext = () => {
        updateTemplate(selectedTemplate);
        onNext();
    };

    return (
        <div className="space-y-6">
            <RadioGroup
                value={selectedTemplate}
                onValueChange={(value: string) => setSelectedTemplate(value as Template)}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <Label
                    htmlFor="classic-template"
                    className={cn(
                        "block cursor-pointer rounded-lg border-2 p-4 transition-all",
                        selectedTemplate === 'classic' ? 'border-primary shadow-md' : 'border-border'
                    )}
                >
                    <RadioGroupItem value="classic" id="classic-template" className="sr-only" />
                    <Image
                        src={classicTemplateImage.imageUrl}
                        alt="Classic Resume Template"
                        width={400}
                        height={565}
                        className="w-full rounded-md object-cover aspect-[2/2.8]"
                        data-ai-hint={classicTemplateImage.imageHint}
                    />
                    <h3 className="mt-4 text-lg font-semibold text-center">Classic</h3>
                </Label>
                <Label
                    htmlFor="modern-template"
                    className={cn(
                        "block cursor-pointer rounded-lg border-2 p-4 transition-all",
                        selectedTemplate === 'modern' ? 'border-primary shadow-md' : 'border-border'
                    )}
                >
                    <RadioGroupItem value="modern" id="modern-template" className="sr-only" />
                    <Image
                        src={modernTemplateImage.imageUrl}
                        alt="Modern Resume Template"
                        width={400}
                        height={565}
                        className="w-full rounded-md object-cover aspect-[2/2.8]"
                        data-ai-hint={modernTemplateImage.imageHint}
                    />
                    <h3 className="mt-4 text-lg font-semibold text-center">Modern</h3>
                </Label>
            </RadioGroup>
            <div className="flex justify-end">
                <Button onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </div>
    );
}


function PersonalInfoStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { formData, updatePersonalInfo } = useResumeBuilder();
    const form = useForm<PersonalInfoData>({
        resolver: zodResolver(PersonalInfoSchema),
        defaultValues: formData.personalInfo,
    });

    const onSubmit = (data: PersonalInfoData) => {
        updatePersonalInfo(data);
        onNext();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="linkedin" render={({ field }) => (
                        <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Portfolio/Website URL</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="submit">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </form>
        </Form>
    );
}

function SummaryStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { formData, updateSummary } = useResumeBuilder();
    const form = useForm<SummaryData>({
        resolver: zodResolver(SummarySchema),
        defaultValues: formData.summary,
    });

    const onSubmit = (data: SummaryData) => {
        updateSummary(data);
        onNext();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Professional Summary</FormLabel>
                        <FormControl><Textarea rows={6} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="submit">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </form>
        </Form>
    );
}

function ExperienceStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { formData, addExperience, updateExperience, removeExperience } = useResumeBuilder();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const form = useForm<ExperienceData>({
        resolver: zodResolver(ExperienceSchema),
        defaultValues: { title: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' }
    });
    
    const { handleSubmit, control, reset } = form;

    const onAddOrUpdate = (data: ExperienceData) => {
        if (editingIndex !== null) {
            updateExperience(editingIndex, data);
            setEditingIndex(null);
        } else {
            addExperience(data);
        }
        reset({ title: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        reset(formData.experience[index]);
    };
    
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Work Experience</h3>
            <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                    <Card key={exp.id} className="p-4 bg-secondary">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{exp.title} at {exp.company}</p>
                                <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>Remove</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onAddOrUpdate)} className="space-y-4 p-4 border rounded-md">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="company" render={({ field }) => (
                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="startDate" render={({ field }) => (
                            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="text" placeholder='YYYY-MM' {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="endDate" render={({ field }) => (
                            <FormItem><FormLabel>End Date (leave blank if current)</FormLabel><FormControl><Input type="text" placeholder='YYYY-MM' {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={control} name="responsibilities" render={({ field }) => (
                        <FormItem><FormLabel>Responsibilities (one per line)</FormLabel><FormControl><Textarea rows={4} {...field} placeholder="Describe your key responsibilities and achievements..."/></FormControl><FormMessage /></FormItem>
                     )} />
                    <Button type="submit">{editingIndex !== null ? 'Update Experience' : 'Add Experience'}</Button>
                </form>
            </Form>

            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                <Button type="button" onClick={onNext}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </div>
    );
}

function EducationStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { formData, addEducation, updateEducation, removeEducation } = useResumeBuilder();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const form = useForm<EducationData>({
        resolver: zodResolver(EducationSchema),
        defaultValues: { school: '', degree: '', location: '', startDate: '', endDate: '' }
    });
    
    const { handleSubmit, control, reset } = form;

    const onAddOrUpdate = (data: EducationData) => {
        if (editingIndex !== null) {
            updateEducation(editingIndex, data);
            setEditingIndex(null);
        } else {
            addEducation(data);
        }
        reset({ school: '', degree: '', location: '', startDate: '', endDate: '' });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        reset(formData.education[index]);
    };
    
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Education</h3>
            <div className="space-y-4">
                {formData.education.map((edu, index) => (
                    <Card key={edu.id} className="p-4 bg-secondary">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{edu.degree} at {edu.school}</p>
                                <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate || 'Present'}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>Remove</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onAddOrUpdate)} className="space-y-4 p-4 border rounded-md">
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={control} name="school" render={({ field }) => (
                            <FormItem><FormLabel>School/University</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="degree" render={({ field }) => (
                            <FormItem><FormLabel>Degree/Field of Study</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="startDate" render={({ field }) => (
                            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="text" placeholder='YYYY-MM' {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="endDate" render={({ field }) => (
                            <FormItem><FormLabel>End Date (or expected)</FormLabel><FormControl><Input type="text" placeholder='YYYY-MM' {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <Button type="submit">{editingIndex !== null ? 'Update Education' : 'Add Education'}</Button>
                </form>
            </Form>

            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                <Button type="button" onClick={onNext}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </div>
    );
}

function SkillsStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { formData, updateSkills } = useResumeBuilder();
    const [currentSkill, setCurrentSkill] = useState('');
    const [skills, setSkills] = useState(formData.skills.skills);

    const handleAddSkill = () => {
        if (currentSkill && !skills.includes(currentSkill)) {
            const newSkills = [...skills, currentSkill];
            setSkills(newSkills);
            setCurrentSkill('');
        }
    };
    
    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleFinish = () => {
        updateSkills({ skills });
        onNext();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor='skills-input'>Skills</Label>
                <div className="flex gap-2">
                    <Input 
                        id='skills-input'
                        value={currentSkill}
                        onChange={e => setCurrentSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., React, Project Management"
                    />
                    <Button type="button" onClick={handleAddSkill}>Add Skill</Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 p-4 border rounded-md min-h-[80px]">
                {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-2">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3"/>
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                <Button onClick={handleFinish} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Build My Resume
                </Button>
            </div>
        </div>
    );
}


function FinishStep({ onPrev }: { onPrev: () => void }) {
    const { formData } = useResumeBuilder();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<{resumeMarkdown: string, resumeLatex: string} | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const converter = new showdown.Converter();

    useEffect(() => {
        const handleSubmit = async () => {
            setLoading(true);
            setError(null);
            
            const resumeInput = {
                template: formData.template,
                personalInfo: formData.personalInfo,
                summary: formData.summary.summary,
                experience: formData.experience.map(e => ({...e, responsibilities: e.responsibilities.split('\n').filter(r => r.trim() !== '')})),
                education: formData.education,
                skills: formData.skills.skills,
            }
    
        const response = await buildResume(resumeInput);
        if (response.success) {
            setResults(response.data);
        } else {
            setError(response.error);
        }
            setLoading(false);
        };
        handleSubmit();
    }, [formData])
    

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
          title: 'Copied to Clipboard',
          description: `Your ${type} has been copied.`,
        });
      };

    const downloadAsPdf = (text: string, filename: string) => {
        const doc = new jsPDF();
        const cleanText = text.replace(/<[^>]*>/g, '');
        doc.setFont('Helvetica');
        doc.setFontSize(10);
        
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let y = margin;
        const lines = doc.splitTextToSize(cleanText, 180);

        lines.forEach((line: string) => {
            if (y + 10 > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += 7;
        });

        doc.save(filename);
    };

    const downloadAsTex = (text: string, filename: string) => {
        const blob = new Blob([text], { type: 'application/x-latex;charset=utf-8' });
        saveAs(blob, filename);
    };

    const openInOverleaf = (latexCode: string) => {
        const form = document.createElement('form');
        form.method = 'post';
        form.action = 'https://www.overleaf.com/docs';
        form.target = '_blank';
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'snip';
        input.value = latexCode;
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    if (loading) {
        return (
            <div className="text-center p-8">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Building Your Resume...</h2>
                <p className="text-muted-foreground">The AI is crafting your professional story.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-destructive-foreground bg-destructive rounded-md">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
                <Button variant="outline" onClick={onPrev} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit</Button>
            </div>
        )
    }
    
    if(results){
        const resumeHtml = converter.makeHtml(results.resumeMarkdown);
        return (
            <div>
                 <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <Button type="button" variant="outline" onClick={onPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit</Button>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openInOverleaf(results.resumeLatex)}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Preview on Overleaf
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(results.resumeMarkdown, 'resume')}>
                        <Clipboard className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadAsPdf(results.resumeMarkdown, 'resume.pdf')}>
                        <FileType className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadAsTex(results.resumeLatex, 'resume.tex')}>
                        <Download className="mr-2 h-4 w-4" /> .TEX
                        </Button>
                    </div>
                  </div>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md" dangerouslySetInnerHTML={{ __html: resumeHtml }} />
            </div>
        )
    }

    return null;
}
