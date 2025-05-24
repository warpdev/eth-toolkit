import { HeroSection } from '@/components/home/hero-section';
import { ToolsGrid } from '@/components/home/tools-grid';
import { Features } from '@/components/home/features';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Decode calldata, encode function calls, and streamline your Ethereum development workflow with our comprehensive toolkit.',
  openGraph: {
    title: 'Ethereum Developer Toolkit - Essential Tools for Smart Contract Development',
    description:
      'Decode calldata, encode function calls, and streamline your Ethereum development workflow.',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <HeroSection />
      <ToolsGrid />
      <Features />
    </main>
  );
}
