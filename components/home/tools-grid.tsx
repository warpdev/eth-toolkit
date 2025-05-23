'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { TOOLS, type Tool } from '@/lib/config/tools';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
}

function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const isComingSoon = tool.status === 'coming-soon';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl',
        isComingSoon && 'opacity-75'
      )}
    >
      <CardHeader className="pt-8 pb-4">
        <div className="bg-primary/10 text-primary mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="flex items-center justify-between">
          {tool.title}
          {isComingSoon && (
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-normal">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          )}
        </CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        {!isComingSoon ? (
          <Link href={tool.href} className="block">
            <Button className="group-hover:bg-primary group-hover:text-primary-foreground h-12 w-full text-base">
              Open Tool
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        ) : (
          <Button className="h-12 w-full text-base" disabled>
            Coming Soon
          </Button>
        )}
      </CardContent>
      {tool.shortcut && !isComingSoon && (
        <div className="bg-muted text-muted-foreground absolute top-2 right-2 rounded px-1.5 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100">
          {tool.shortcut}
        </div>
      )}
    </Card>
  );
}

export function ToolsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Available Tools</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Powerful utilities designed to make Ethereum development faster and more efficient
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
