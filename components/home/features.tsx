import * as React from 'react';
import {
  Sparkles,
  Database,
  Type,
  Save,
  History,
  ShieldCheck,
  FileDown,
  Layers,
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 'no-abi',
    icon: Sparkles,
    title: 'No ABI Required',
    description: 'Decode calldata without ABI using 4byte signature database',
  },
  {
    id: '4byte-db',
    icon: Database,
    title: '4byte Signature Database',
    description: 'Access to millions of function signatures for instant decoding',
  },
  {
    id: 'type-safe',
    icon: Type,
    title: 'Type-safe Input',
    description: 'Dynamic form generation with automatic type validation',
  },
  {
    id: 'save-abi',
    icon: Save,
    title: 'Save Frequently Used ABIs',
    description: 'Store and quickly access your most used contract ABIs',
  },
  {
    id: 'history',
    icon: History,
    title: 'History Tracking',
    description: 'Keep track of your recent decoding and encoding operations',
  },
  {
    id: 'validation',
    icon: ShieldCheck,
    title: 'Real-time Validation',
    description: 'Instant feedback on parameter types and calldata format',
  },
  {
    id: 'export',
    icon: FileDown,
    title: 'Export Ready',
    description: 'Copy calldata with one click for use in your transactions',
  },
  {
    id: 'decode-modes',
    icon: Layers,
    title: 'Multiple Decode Modes',
    description: 'Flexible decoding with or without ABI for any use case',
  },
];

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = React.memo(function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div className="group bg-card relative rounded-lg border p-6 transition-all hover:shadow-md">
      <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground text-sm">{feature.description}</p>
    </div>
  );
});

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold">Why Use Our Toolkit?</h2>
        <p className="text-muted-foreground text-lg">
          Powerful features designed for Ethereum developers
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}
