import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/header';
import { ResumeBuilderProvider } from '@/contexts/ResumeBuilderContext';

export const metadata: Metadata = {
  title: 'ResumeAI',
  description: 'AI-Powered Job Application Tailor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <AuthProvider>
          <ResumeBuilderProvider>
            <div className="flex flex-col min-h-dvh bg-background">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster />
          </ResumeBuilderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
