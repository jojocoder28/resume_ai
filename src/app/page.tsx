'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/footer';
import { ResumeOptimizerSection } from '@/components/feature/resume-optimizer-section';
import AuthPage from './auth/page';

function ResumeOptimizerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <ResumeOptimizerSection />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeOptimizerPage />
    </Suspense>
  );
}
