'use client';

import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FunctionParameter } from '@/lib/types';
import { getInputTypeForParameterType, getPlaceholderForType } from '@/lib/utils';

interface StandardParameterFieldProps {
  param: FunctionParameter;
  index: number;
  value: string;
  onValueChange: (name: string, value: string) => void;
}

export function StandardParameterField({
  param,
  index,
  value,
  onValueChange,
}: StandardParameterFieldProps) {
  const paramName = param.name || `param${index}`;
  const inputType = getInputTypeForParameterType(param.type);
  const placeholder = getPlaceholderForType(param.type);

  return (
    <div className="space-y-2">
      <Label htmlFor={paramName} className="font-medium">
        {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
      </Label>
      <Input
        id={paramName}
        type={inputType}
        value={value}
        onChange={(e) => onValueChange(paramName, e.target.value)}
        placeholder={placeholder}
        className="font-mono"
      />
    </div>
  );
}
