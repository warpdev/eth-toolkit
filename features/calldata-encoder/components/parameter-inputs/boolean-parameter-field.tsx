'use client';

import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FunctionParameter } from '@/lib/types';

interface BooleanParameterFieldProps {
  param: FunctionParameter;
  index: number;
  value: string;
  onValueChange: (name: string, value: string) => void;
}

export function BooleanParameterField({
  param,
  index,
  value,
  onValueChange,
}: BooleanParameterFieldProps) {
  const paramName = param.name || `param${index}`;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={paramName}
        checked={value === 'true'}
        onCheckedChange={(checked) => onValueChange(paramName, checked === true ? 'true' : 'false')}
      />
      <Label htmlFor={paramName} className="font-medium">
        {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
      </Label>
    </div>
  );
}
