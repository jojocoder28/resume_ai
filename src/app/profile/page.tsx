
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/auth/UserProfile';
import type { User } from '@/contexts/AuthContext';

// Set a higher timeout for this page to accommodate database queries.
export const maxDuration = 120;

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // If no user is found, redirect to the authentication page.
  if (!user) {
    redirect('/auth');
  }

  // We need to serialize the user object to pass it from a Server Component
  // to a Client Component. The `_id` and date fields from MongoDB are not
  // directly serializable.
  const plainUser: User = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    address: user.address,
    phone: user.phone,
    website: user.website,
    linkedin: user.linkedin,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <UserProfile user={plainUser} />
      </Suspense>
    </div>
  );
}
