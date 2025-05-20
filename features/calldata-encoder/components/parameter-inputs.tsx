"use client";

import React, { useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { abiAtom, selectedFunctionAtom, functionInputsAtom } from "../atoms/encoder-atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { generateInputFieldsFromAbi, getPlaceholderForType, getInputTypeForParameterType } from "../lib/parameter-utils";
import { FunctionParameter } from "../lib/types";

// Interface for shared parameter input props
interface ParameterFieldProps {
  param: FunctionParameter;
  index: number;
  value: string;
  onValueChange: (name: string, value: string) => void;
}

// Component for boolean/checkbox type inputs
function BooleanParameterField({ param, index, value, onValueChange }: ParameterFieldProps) {
  const paramName = param.name || `param${index}`;
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={paramName}
        checked={value === 'true'}
        onCheckedChange={(checked) => 
          onValueChange(paramName, checked === true ? 'true' : 'false')
        }
      />
      <Label htmlFor={paramName} className="font-medium">
        {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
      </Label>
    </div>
  );
}

// Component for long text inputs
function TextAreaParameterField({ param, index, value, onValueChange }: ParameterFieldProps) {
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

// Component for standard inputs (text, number, etc)
function StandardParameterField({ param, index, value, onValueChange }: ParameterFieldProps) {
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

// Empty parameters notice component
function EmptyParametersNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This function does not require any parameters.</p>
      </CardContent>
    </Card>
  );
}

// Main parameter inputs component
export const ParameterInputs = React.memo(function ParameterInputs() {
  const abi = useAtomValue(abiAtom);
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const [functionInputs, setFunctionInputs] = useAtom(functionInputsAtom);
  
  // If no function is selected
  if (!abi || !selectedFunction) {
    return null;
  }
  
  // Get function parameters from ABI using memoization
  const functionParams = useMemo(() => 
    generateInputFieldsFromAbi(abi, selectedFunction),
    [abi, selectedFunction]
  );
  
  // If function has no parameters
  if (functionParams.length === 0) {
    return <EmptyParametersNotice />;
  }
  
  // Handle parameter input change
  const handleValueChange = useCallback((name: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setFunctionInputs]);
  
  // Create memoized parameter field rendering logic
  const renderParameterFields = useMemo(() => {
    return functionParams.map((param, index) => {
      const paramName = param.name || `param${index}`;
      const inputType = getInputTypeForParameterType(param.type);
      const value = functionInputs[paramName] || "";
      
      // Render appropriate field based on parameter type
      if (inputType === 'checkbox') {
        return (
          <BooleanParameterField 
            key={index}
            param={param}
            index={index}
            value={value}
            onValueChange={handleValueChange}
          />
        );
      }
      
      if (param.type === 'string' && value.length > 50) {
        return (
          <TextAreaParameterField 
            key={index}
            param={param}
            index={index}
            value={value}
            onValueChange={handleValueChange}
          />
        );
      }
      
      return (
        <StandardParameterField 
          key={index}
          param={param}
          index={index}
          value={value}
          onValueChange={handleValueChange}
        />
      );
    });
  }, [functionParams, functionInputs, handleValueChange]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderParameterFields}
        </div>
      </CardContent>
    </Card>
  );
});