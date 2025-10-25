'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ResumeOptimizerSection } from '@/components/feature/resume-optimizer-section';
import AuthPage from '../auth/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

function ResumeOptimizerPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('optimize');
  const router = useRouter();

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
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'create') {
        router.push('/create');
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="optimize">Optimize Existing Resume</TabsTrigger>
                <TabsTrigger value="create">Create From Scratch</TabsTrigger>
            </TabsList>
            <TabsContent value="optimize">
                <ResumeOptimizerSection />
            </TabsContent>
            {/* The content for 'create' is handled by navigation */}
        </Tabs>
    </div>
  );
}

export default function ToolPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeOptimizerPage />
    </Suspense>
  );
}
