'use client';

import React from 'react';
import { FormatArg, getArgAsString } from './parameter-formatters';
import { CopyButton } from '@/components/shared/copy-button';

interface RawArgItemProps {
  arg: unknown;
  index: number;
}

export const RawArgItem = React.memo(function RawArgItem({ arg, index }: RawArgItemProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-3 md:grid-cols-[auto_1fr]">
      <div className="text-muted-foreground text-sm font-medium">Arg {index + 1}:</div>
      <div className="group relative font-mono text-sm">
        <div className="pr-8">
          <FormatArg arg={arg} />
        </div>
        <div className="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton
            text={getArgAsString(arg)}
            tooltipText="Copy argument value"
            successMessage="Argument value copied!"
          />
        </div>
      </div>
    </div>
  );
});
