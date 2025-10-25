'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if user is loaded and present, and we are on the dedicated /auth page
    if (!loading && user && pathname === '/auth') {
      router.push('/profile');
    }
  }, [user, loading, router, pathname]);

  const handleAuthSuccess = () => {
    // If we are on the root page, the parent component will re-render.
    // If we are on /auth, we should redirect.
    if (pathname === '/auth') {
      router.push('/profile');
    }
    // No action needed for '/' as the parent component will handle the view change
  };

  if (loading && pathname === '/auth') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This prevents a flash of the auth page before redirecting on the /auth route
  if (user && pathname === '/auth') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
