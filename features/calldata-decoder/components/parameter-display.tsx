"use client";

import React from "react";
import { ParsedParameter } from "../lib/types";
import { CopyButton } from "./copy-button";
import { formatEther } from "viem";

interface ParameterDisplayProps {
  parameters: ParsedParameter[];
  parseError?: string | null;
  args?: unknown[];
}

// Formatter for BigInt values in JSON.stringify
const bigIntReplacer = (_: string, value: unknown): unknown => 
  typeof value === 'bigint' ? value.toString() : value;

// Helper to get the string representation of an argument for copying
const getArgAsString = (arg: unknown): string => {
  if (arg === null || arg === undefined) {
    return "null";
  }

  // Specifically handle arrays
  if (Array.isArray(arg)) {
    try {
      return JSON.stringify(arg, bigIntReplacer, 2);
    } catch {
      return String(arg);
    }
  }

  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, bigIntReplacer, 2);
    } catch {
      return String(arg);
    }
  }

  return String(arg);
};

// Helper to check if a value is likely an ETH amount in Wei
const isLikelyWeiValue = (value: unknown, type?: string): boolean => {
  // Skip array types
  if (type && type.includes('[]')) {
    return false;
  }
  
  // Check parameter type hints
  if (type && (type.includes('uint256') || type.includes('uint128'))) {
    return true;
  }
  
  // Check if it's a bigint with significant size (at least 1e15 wei = 0.001 ETH)
  if (typeof value === 'bigint' && value >= 1000000000000000n) {
    return true;
  }
  
  // Check if it's a string representation of a large number
  if (typeof value === 'string' && /^\d+$/.test(value) && value.length >= 15) {
    return true;
  }
  
  return false;
};

// Helper to format arguments in a readable way
const formatArg = (arg: unknown, type?: string): React.ReactNode => {
  if (arg === null || arg === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }

  // Array handling - must come before object check since arrays are objects
  if (Array.isArray(arg)) {
    // For arrays that might contain ETH values
    if (type && (type.includes('uint256[]') || type.includes('uint128[]'))) {
      return (
        <div className="space-y-2">
          {arg.map((item, i) => (
            <div key={i} className="flex flex-col">
              {typeof item === 'bigint' && isLikelyWeiValue(item, 'uint256') ? (
                <>
                  <span>{item.toString()}</span>
                  <span className="text-xs text-muted-foreground">({formatEther(item)} ETH)</span>
                </>
              ) : (
                <span>{typeof item === 'bigint' ? item.toString() : String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Generic array handling
    try {
      return (
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(arg, bigIntReplacer, 2)}
        </pre>
      );
    } catch {
      return <span>{String(arg)}</span>;
    }
  }

  // Check if this is likely an ETH value in Wei
  if (isLikelyWeiValue(arg, type)) {
    try {
      const wei = typeof arg === 'string' ? BigInt(arg) : arg as bigint;
      const eth = formatEther(wei);
      
      return (
        <div className="flex flex-col">
          <span>{wei.toString()}</span>
          <span className="text-xs text-muted-foreground">({eth} ETH)</span>
        </div>
      );
    } catch (e) {
      // Fallback to regular formatting if conversion fails
      if (typeof arg === 'bigint') {
        return <span>{arg.toString()}</span>;
      }
    }
  }

  if (typeof arg === 'bigint') {
    return <span>{arg.toString()}</span>;
  }

  if (typeof arg === 'boolean') {
    return <span>{arg ? 'true' : 'false'}</span>;
  }
  
  // Regular object handling
  if (typeof arg === 'object') {
    try {
      return (
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(arg, bigIntReplacer, 2)}
        </pre>
      );
    } catch {
      return <span>{String(arg)}</span>;
    }
  }

  // For raw calldata in signature mode
  if (typeof arg === 'string' && arg.match(/^[0-9a-fA-F]*$/)) {
    return (
      <div className="font-mono break-all">
        <span className="text-sm font-medium text-muted-foreground mr-2">Raw Calldata:</span>
        {arg}
      </div>
    );
  }

  return <span className="break-all">{String(arg)}</span>;
};

export const ParameterDisplay = React.memo(function ParameterDisplay({
  parameters,
  parseError,
  args
}: ParameterDisplayProps) {
  // Parsed parameters display
  if (parameters && parameters.length > 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Function Parameters</h3>
        <div className="border rounded-md divide-y">
          {parameters.map((param, index) => (
            <div key={index} className="p-3 grid grid-cols-[1fr_1fr] gap-4">
              <div className="space-y-1">
                <div className="font-medium text-sm">
                  {param.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {param.type}
                </div>
              </div>
              <div className="relative overflow-auto group font-mono text-sm">
                <div className="pr-8">{formatArg(param.value, param.type)}</div>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton 
                    text={getArgAsString(param.value)} 
                    tooltipText="Copy parameter value" 
                    successMessage="Parameter value copied!"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } 
  
  // Show raw arguments as a fallback if parameter parsing fails
  if (parseError && args && args.length > 0) {
    return (
      <>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Function Parameters</h3>
          <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
            <div className="text-destructive/80">{parseError}</div>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium">Raw Function Arguments</h3>
          <div className="border rounded-md divide-y">
            {args.map((arg, index) => (
              <div key={index} className="p-3 grid grid-cols-[auto_1fr] gap-4">
                <div className="font-medium text-sm text-muted-foreground">
                  Arg {index + 1}:
                </div>
                <div className="relative group font-mono text-sm">
                  <div className="pr-8">{formatArg(arg)}</div>
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton 
                      text={getArgAsString(arg)} 
                      tooltipText="Copy argument value" 
                      successMessage="Argument value copied!"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  
  // No parameters or error state
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Function Parameters</h3>
      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
        {parseError ? (
          <div className="text-destructive/80">{parseError}</div>
        ) : (
          <>No parameters could be parsed</>
        )}
      </div>
    </div>
  );
});