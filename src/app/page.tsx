'use client';

import LandingPage from '@/components/landing-page';
import Footer from '@/components/layout/footer';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/feature/dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <>
        <Dashboard />
        <Footer />
      </>
    );
  }

  return (
    <>
      <LandingPage />
      <Footer />
    </>
  );
}
