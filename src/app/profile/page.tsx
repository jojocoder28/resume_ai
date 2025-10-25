import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/auth/UserProfile';
import { Suspense } from 'react';

async function Profile() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  return <UserProfile user={user} />;
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
       <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
       }>
        <Profile />
      </Suspense>
    </div>
  );
}
