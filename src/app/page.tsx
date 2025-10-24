import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ResumeOptimizerSection } from '@/components/feature/resume-optimizer-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <ResumeOptimizerSection />
      </main>
      <Footer />
    </div>
  );
}
