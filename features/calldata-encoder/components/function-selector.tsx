'use client';

import React, { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { selectedFunctionAtom, abiAtom, functionInputsAtom } from '../atoms/encoder-atoms';
import { useFunctionSelector } from '../hooks/use-function-selector';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const FunctionSelector = React.memo(function FunctionSelector() {
  const abi = useAtomValue(abiAtom);
  const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
  const setFunctionInputs = useSetAtom(functionInputsAtom);

  const { availableFunctions, functionsByName, isOverloadedFunction } = useFunctionSelector();

  const handleFunctionSelect = useCallback(
    (value: string) => {
      setSelectedFunction(value);

      // Reset inputs when function changes
      setFunctionInputs({});
    },
    [setSelectedFunction, setFunctionInputs]
  );

  // If no ABI is loaded
  if (!abi || availableFunctions.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        Please upload or select a valid ABI to see available functions.
      </div>
    );
  }

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
          {functions.map((func, index) => (
            <SelectItem key={`${func.name}-${index}`} value={func.name} title={func.signature}>
              {isOverloadedFunction(func.name)
                ? `${func.name}(${func.inputs.map((i) => i.type).join(', ')})`
                : func.name}
            </SelectItem>
          ))}
        </SelectGroup>
      )),
    [functionsByName, isOverloadedFunction]
  );

  // Memoize selected function signature display
  const selectedFunctionSignatures = useMemo(() => {
    if (!selectedFunction) return null;

    return (
      <div className="text-muted-foreground mt-2 text-sm">
        {functionsByName[selectedFunction]?.map((func, index) => (
          <div key={index} className="font-mono">
            {func.signature}
          </div>
        ))}
      </div>
    );
  }, [selectedFunction, functionsByName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Function</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="function-select">Contract Function</Label>
            <Select value={selectedFunction || undefined} onValueChange={handleFunctionSelect}>
              <SelectTrigger id="function-select" className="w-full">
                <SelectValue placeholder="Select a function" />
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
