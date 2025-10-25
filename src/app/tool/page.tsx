'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ResumeOptimizerSection } from '@/components/feature/resume-optimizer-section';
import AuthPage from '../auth/page';

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
    </>
  );
}

export default function ToolPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeOptimizerPage />
    </Suspense>
  );
}
