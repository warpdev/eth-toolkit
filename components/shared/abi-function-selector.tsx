'use client';

import React, { useCallback, useMemo } from 'react';

import { Abi } from 'viem';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FunctionInfo } from '@/lib/types';
import { extractFunctionsFromAbi } from '@/lib/utils';

interface AbiFunctionSelectorProps {
  abi: Abi | null;
  selectedFunction: string | null;
  onFunctionSelect: (functionName: string) => void;
  title?: string;
  placeholder?: string;
  showSignatures?: boolean;
}

export const AbiFunctionSelector = React.memo(function AbiFunctionSelector({
  abi,
  selectedFunction,
  onFunctionSelect,
  title = 'Select Function',
  placeholder = 'Select a function',
  showSignatures = true,
}: AbiFunctionSelectorProps) {
  // Extract functions from ABI
  const availableFunctions = useMemo(() => {
    return abi ? extractFunctionsFromAbi(abi) : [];
  }, [abi]);

  // Group functions by name to handle overloads
  const functionsByName = useMemo(() => {
    const grouped: Record<string, FunctionInfo[]> = {};
    availableFunctions.forEach((func) => {
      if (!grouped[func.name]) {
        grouped[func.name] = [];
      }
      grouped[func.name].push(func);
    });
    return grouped;
  }, [availableFunctions]);

  // Check if a function is overloaded
  const isOverloadedFunction = useCallback(
    (funcName: string) => {
      return functionsByName[funcName]?.length > 1;
    },
    [functionsByName]
  );

  // Handle function selection
  const handleFunctionSelect = useCallback(
    (value: string) => {
      onFunctionSelect(value);
    },
    [onFunctionSelect]
  );

  // Memoize select options to prevent unnecessary re-renders
  const selectOptions = useMemo(
    () =>
      Object.entries(functionsByName).map(([funcName, functions]) => (
        <SelectGroup key={funcName}>
          {functions.length > 1 && (
            <SelectLabel>
              {funcName} ({functions.length} overloads)
            </SelectLabel>
          )}
          {functions.map((func, index) => {
            // Use signature for overloaded functions, name for unique functions
            const itemValue = isOverloadedFunction(func.name) ? func.signature : func.name;
            return (
              <SelectItem key={`${func.name}-${index}`} value={itemValue} title={func.signature}>
                {isOverloadedFunction(func.name)
                  ? `${func.name}(${func.inputs.map((i) => i.type).join(', ')})`
                  : func.name}
              </SelectItem>
            );
          })}
        </SelectGroup>
      )),
    [functionsByName, isOverloadedFunction]
  );

  // Memoize selected function signature display
  const selectedFunctionSignatures = useMemo(() => {
    if (!selectedFunction || !showSignatures) return null;

    // Find the selected function by either signature or name
    const selectedFunc = availableFunctions.find(
      (func) => func.signature === selectedFunction || func.name === selectedFunction
    );
    if (!selectedFunc) return null;

    return (
      <div className="text-muted-foreground mt-2 text-sm">
        <div className="font-mono">{selectedFunc.signature}</div>
      </div>
    );
  }, [selectedFunction, availableFunctions, showSignatures]);

  // If no ABI is loaded
  if (!abi || availableFunctions.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        Please upload or select a valid ABI to see available functions.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="function-select">Contract Function</Label>
            <Select value={selectedFunction || undefined} onValueChange={handleFunctionSelect}>
              <SelectTrigger id="function-select" className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>{selectOptions}</SelectContent>
            </Select>
          </div>

          {selectedFunctionSignatures}
        </div>
      </CardContent>
    </Card>
  );
});
