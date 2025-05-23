'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { GitHubIcon } from '@/components/shared/icons';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="from-primary/5 to-primary/5 dark:from-primary/10 dark:to-primary/10 absolute inset-0 bg-gradient-to-br via-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Ethereum Developer
          <span className="from-primary to-primary/60 block bg-gradient-to-r bg-clip-text text-transparent">
            Toolkit
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg md:text-xl">
          Essential tools for smart contract development. Decode calldata, encode function calls,
          and streamline your Ethereum development workflow.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/calldata/decoder">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a
            href="https://github.com/your-repo/eth-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            <GitHubIcon className="h-4 w-4" />
            Star on GitHub
            <Star className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
