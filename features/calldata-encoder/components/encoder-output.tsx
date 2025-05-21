"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { encodedCalldataAtom, selectedFunctionAtom, abiAtom } from "../atoms/encoder-atoms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";
import { useFunctionSelector } from "../hooks/use-function-selector";

export function EncoderOutput() {
  const encodedCalldata = useAtomValue(encodedCalldataAtom);
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const abi = useAtomValue(abiAtom);
  
  const { getFunctionInfo } = useFunctionSelector();
  
  if (!encodedCalldata) {
    return null;
  }
  
  // Get function signature
  const functionInfo = selectedFunction ? getFunctionInfo(selectedFunction) : undefined;
  
  // Prepare calldata segments for display
  const segments = [];
  
  if (encodedCalldata.length >= 10) {
    // Function selector (first 4 bytes / 10 chars including 0x)
    segments.push({
      value: encodedCalldata.substring(0, 10),
      type: 'selector',
      label: 'Function Selector'
    });
    
    // Parameter data
    if (encodedCalldata.length > 10) {
      segments.push({
        value: encodedCalldata.substring(10),
        type: 'parameters',
        label: 'Parameters'
      });
    }
  } else {
    // Just in case it's a malformed calldata
    segments.push({
      value: encodedCalldata,
      type: 'raw',
      label: 'Raw Data'
    });
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Encoded Calldata</CardTitle>
        <CopyButton 
          text={encodedCalldata} 
          tooltipText="Copy calldata" 
          size="default"
          successMessage="Calldata copied to clipboard!"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Function information */}
        {functionInfo && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Function</h3>
            <div className="p-3 bg-muted rounded-md font-mono text-sm">
              {functionInfo.signature}
            </div>
          </div>
        )}
        
        {/* Full calldata */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Full Calldata</h3>
          <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
            {encodedCalldata}
          </div>
        </div>
        
        {/* Calldata segments */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Calldata Segments</h3>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="space-y-1">
                <div className="text-xs text-muted-foreground">{segment.label}</div>
                <div className={cn(
                  "p-3 rounded-md font-mono text-sm break-all",
                  segment.type === 'selector' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "",
                  segment.type === 'parameters' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "",
                  segment.type === 'raw' ? "bg-muted" : ""
                )}>
                  {segment.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}