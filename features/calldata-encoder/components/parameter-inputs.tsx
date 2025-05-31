'use client';

import React, { useCallback, useMemo } from 'react';

import { useAtom, useAtomValue } from 'jotai';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunctionParameter } from '@/lib/types';
import { generateParametersFromAbi, getInputTypeForParameterType } from '@/lib/utils';

import { abiAtom, selectedFunctionAtom, functionInputsAtom } from '../atoms/calldata-atoms';
import {
  BooleanParameterField,
  EmptyParametersNotice,
  StandardParameterField,
  TextAreaParameterField,
} from './parameter-inputs/index';

// Constants
const TEXTAREA_THRESHOLD = 50;

// Interface for shared parameter input props
interface ParameterFieldProps {
  param: FunctionParameter;
  index: number;
  value: string;
  onValueChange: (name: string, value: string) => void;
}

// Main parameter inputs component
export const ParameterInputs = React.memo(function ParameterInputs() {
  const abi = useAtomValue(abiAtom);
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const [functionInputs, setFunctionInputs] = useAtom(functionInputsAtom);

  // Get function parameters from ABI using memoization - always call this hook
  const functionParams = useMemo(
    () => (abi && selectedFunction ? generateParametersFromAbi(abi, selectedFunction) : []),
    [abi, selectedFunction]
  );

  // Handle parameter input change - always call this hook
  const handleValueChange = useCallback(
    (name: string, value: string) => {
      setFunctionInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setFunctionInputs]
  );

  // Create memoized parameter field rendering logic - always call this hook
  const renderParameterFields = useMemo(() => {
    if (!abi || !selectedFunction || functionParams.length === 0) {
      return [];
    }

    return functionParams.map((param, index) => {
      const paramName = param.name || `param${index}`;
      const inputType = getInputTypeForParameterType(param.type);
      const value = functionInputs[paramName] || '';

      const fieldProps: ParameterFieldProps = {
        param,
        index,
        value,
        onValueChange: handleValueChange,
      };

      // Render appropriate field based on parameter type
      if (inputType === 'checkbox') {
        return <BooleanParameterField key={index} {...fieldProps} />;
      }

      if (param.type === 'string' && value.length > TEXTAREA_THRESHOLD) {
        return <TextAreaParameterField key={index} {...fieldProps} />;
      }

      return <StandardParameterField key={index} {...fieldProps} />;
    });
  }, [abi, selectedFunction, functionParams, functionInputs, handleValueChange]);

  // Return early after all hooks are called
  if (!abi || !selectedFunction) {
    return null;
  }

  // If function has no parameters, show notice (after all hooks are called)
  if (functionParams.length === 0) {
    return <EmptyParametersNotice />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{renderParameterFields}</div>
      </CardContent>
    </Card>
  );
});
