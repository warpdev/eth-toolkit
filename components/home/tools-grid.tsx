import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { TOOLS, type Tool } from '@/lib/config/tools';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = React.memo(function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const isComingSoon = tool.status === 'coming-soon';

  const cardContent = (
    <Card
      className={cn(
        'group relative flex h-full cursor-pointer flex-col overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl',
        isComingSoon && 'cursor-not-allowed opacity-75'
      )}
    >
      <CardHeader className="flex-none pt-6 pb-3">
        <div className="bg-primary/10 text-primary mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl">
          <Icon className="h-7 w-7" />
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
      <CardContent className="flex flex-1 flex-col justify-end pb-6">
        <div className="group-hover:bg-primary group-hover:text-primary-foreground bg-secondary text-secondary-foreground flex h-11 w-full items-center justify-center rounded-md text-base font-medium transition-colors">
          {!isComingSoon ? (
            <>
              Open Tool
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          ) : (
            'Coming Soon'
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isComingSoon) {
    return (
      <Link href={tool.href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});

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
