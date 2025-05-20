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

export function ParameterInputs() {
  const abi = useAtomValue(abiAtom);
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const [functionInputs, setFunctionInputs] = useAtom(functionInputsAtom);
  
  // If no function is selected
  if (!abi || !selectedFunction) {
    return null;
  }
  
  // Get function parameters from ABI
  const functionParams = generateInputFieldsFromAbi(abi, selectedFunction);
  
  // If function has no parameters
  if (functionParams.length === 0) {
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
  
  // Handle parameter input change
  const handleInputChange = useCallback((name: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setFunctionInputs]);
  
  // Handle checkbox (boolean) change
  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: checked.toString()
    }));
  }, [setFunctionInputs]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {functionParams.map((param, index) => {
            const paramName = param.name || `param${index}`;
            const inputType = getInputTypeForParameterType(param.type);
            const placeholder = getPlaceholderForType(param.type);
            const value = functionInputs[paramName] || "";
            
            // Determine input field based on parameter type
            if (inputType === 'checkbox') {
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={paramName}
                    checked={value === 'true'}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(paramName, checked === true)
                    }
                  />
                  <Label htmlFor={paramName} className="font-medium">
                    {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
                  </Label>
                </div>
              );
            }
            
            if (param.type === 'string' && value.length > 50) {
              return (
                <div key={index} className="space-y-2">
                  <Label htmlFor={paramName} className="font-medium">
                    {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
                  </Label>
                  <Textarea
                    id={paramName}
                    value={value}
                    onChange={(e) => handleInputChange(paramName, e.target.value)}
                    placeholder={placeholder}
                    className="font-mono"
                  />
                </div>
              );
            }
            
            return (
              <div key={index} className="space-y-2">
                <Label htmlFor={paramName} className="font-medium">
                  {paramName} <span className="text-muted-foreground text-sm">({param.type})</span>
                </Label>
                <Input
                  id={paramName}
                  type={inputType}
                  value={value}
                  onChange={(e) => handleInputChange(paramName, e.target.value)}
                  placeholder={placeholder}
                  className="font-mono"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}