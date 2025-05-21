'use client';

import React from 'react';
import { ParsedParameter } from '../lib/types';
import { CopyButton } from '@/components/shared/copy-button';
import { FormatArg, getArgAsString } from './parameter-formatters';

interface ParameterItemProps {
  parameter: ParsedParameter;
  index: number;
}

export const ParameterItem = React.memo(function ParameterItem({
  parameter,
  index,
}: ParameterItemProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 p-3">
      <div className="space-y-1">
        <div className="text-sm font-medium">{parameter.name}</div>
        <div className="text-muted-foreground font-mono text-xs">{parameter.type}</div>
      </div>
      <div className="group relative font-mono text-sm">
        <div className="pr-8 break-all">
          <FormatArg arg={parameter.value} type={parameter.type} />
        </div>
        <div className="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton
            text={getArgAsString(parameter.value)}
            tooltipText="Copy parameter value"
            successMessage="Parameter value copied!"
          />
        </div>
      </div>
    </div>
  );
});
