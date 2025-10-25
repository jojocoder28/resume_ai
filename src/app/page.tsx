'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ResumeOptimizerSection } from '@/components/feature/resume-optimizer-section';
import AuthPage from './auth/page';

function ResumeOptimizerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <ResumeOptimizerSection />
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeOptimizerPage />
    </Suspense>
  );
}
