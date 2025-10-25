'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '../auth/page';
import { ResumeBuilder } from '@/components/feature/resume-builder';

export const maxDuration = 120;

function CreateResumePage() {
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
    <div className="container mx-auto px-4 py-12">
        <ResumeBuilder />
    </div>
  );
}

export default function CreatePage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <CreateResumePage />
      </Suspense>
    );
  }
