'use client';

import React from 'react';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FunctionParameter } from '@/lib/types';
import { getPlaceholderForType } from '@/lib/utils';

interface TextAreaParameterFieldProps {
  param: FunctionParameter;
  index: number;
  value: string;
  onValueChange: (name: string, value: string) => void;
}

export function TextAreaParameterField({
  param,
  index,
  value,
  onValueChange,
}: TextAreaParameterFieldProps) {
  const paramName = param.name || `param${index}`;
  const placeholder = getPlaceholderForType(param.type);

  return (
    <div className="space-y-2">
      <Label htmlFor={paramName} className="font-medium">
        {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
      </Label>
      <Textarea
        id={paramName}
        value={value}
        onChange={(e) => onValueChange(paramName, e.target.value)}
        placeholder={placeholder}
        className="font-mono"
      />
    </div>
  );
}
