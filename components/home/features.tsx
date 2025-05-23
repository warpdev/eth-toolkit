'use client';

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
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'No ABI Required',
    description: 'Decode calldata without ABI using 4byte signature database',
  },
  {
    icon: Database,
    title: '4byte Signature Database',
    description: 'Access to millions of function signatures for instant decoding',
  },
  {
    icon: Type,
    title: 'Type-safe Input',
    description: 'Dynamic form generation with automatic type validation',
  },
  {
    icon: Save,
    title: 'Save Frequently Used ABIs',
    description: 'Store and quickly access your most used contract ABIs',
  },
  {
    icon: History,
    title: 'History Tracking',
    description: 'Keep track of your recent decoding and encoding operations',
  },
  {
    icon: ShieldCheck,
    title: 'Real-time Validation',
    description: 'Instant feedback on parameter types and calldata format',
  },
  {
    icon: FileDown,
    title: 'Export Ready',
    description: 'Copy calldata with one click for use in your transactions',
  },
  {
    icon: Layers,
    title: 'Multiple Decode Modes',
    description: 'Flexible decoding with or without ABI for any use case',
  },
];

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
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group bg-card relative rounded-lg border p-6 transition-all hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
