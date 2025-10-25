
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAuthSuccess = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center bg-background p-4 md:p-0">
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setActiveTab('signup')}
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <SignupForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
