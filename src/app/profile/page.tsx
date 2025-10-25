'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <UserProfile />
      </div>
    </div>
  );
}