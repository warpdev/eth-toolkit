import { HeroSection } from '@/components/home/hero-section';
import { ToolsGrid } from '@/components/home/tools-grid';
import { Features } from '@/components/home/features';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ToolsGrid />
      <Features />
    </main>
  );
}
