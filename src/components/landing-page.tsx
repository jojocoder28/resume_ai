'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Zap, FileText, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  
  const featureList = [
      {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: 'Instant Optimization',
        description: 'Get your resume tailored for any job in seconds, not hours.'
      },
      {
        icon: <Bot className="h-6 w-6 text-primary" />,
        title: 'AI-Powered Cover Letters',
        description: 'Generate persuasive, personalized cover letters that stand out.'
      },
      {
        icon: <FileText className="h-6 w-6 text-primary" />,
        title: 'Multiple Download Formats',
        description: 'Export your documents in PDF, DOCX, LaTeX, or plain text.'
      },
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                  AI-Powered Job Applications
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                  Land Your Dream Job, Faster.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Stop manually tailoring your resume and writing cover letters. ResumeAI does it for you, optimizing your application for any job in seconds.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href={user ? "/tool" : "/auth"}>
                      Get Started for Free
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="https://images.unsplash.com/photo-1675334758735-5f989ff8237f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzYxMjcyNDU3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  width="600"
                  height="400"
                  alt="Hero Illustration"
                  className="rounded-xl shadow-2xl"
                  data-ai-hint="abstract technology"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">How It Works</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Three simple steps to a perfectly tailored job application.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4 font-bold text-2xl font-headline">1</div>
                  <CardTitle>Upload Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Provide your current resume and paste the job description for the role you want.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4 font-bold text-2xl font-headline">2</div>
                  <CardTitle>Let AI Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Our AI analyzes the job role and rewrites your resume and cover letter to match.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4 font-bold text-2xl font-headline">3</div>
                  <CardTitle>Apply with Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Download your perfectly tailored documents and apply for your dream job.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                The Ultimate Advantage in Your Job Hunt
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our features are designed to get your application past the bots and into human hands.
              </p>
            </div>
            <div className="mx-auto w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
              {featureList.map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 text-center">
                    {feature.icon}
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Ready to Get Hired?</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl mt-4">
              Stop wasting time and start your journey to a new career today.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href={user ? "/tool" : "/auth"}>
                  Try ResumeAI Now
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}