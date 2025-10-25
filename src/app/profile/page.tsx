'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfile from '@/components/auth/UserProfile';
import type { User } from '@/contexts/AuthContext';

// Set a higher timeout for this page to accommodate database queries.
export const maxDuration = 120;

function ProfilePageContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // ProtectedRoute will handle redirect if user is null
  return (
    <ProtectedRoute>
       {user && <UserProfile user={user} />}
    </ProtectedRoute>
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <ProfilePageContent />
      </Suspense>
    </div>
  );
}
