"use client";

import React from "react";
import { ParsedParameter } from "@/lib/decoder/calldata-utils";

interface ParameterDisplayProps {
  parameters: ParsedParameter[];
  parseError?: string | null;
  args?: unknown[];
}

// Helper to format arguments in a readable way
const formatArg = (arg: unknown): React.ReactNode => {
  if (arg === null || arg === undefined) {
    return <span className="text-muted-foreground">null</span>;
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
          {JSON.stringify(arg, (_, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2
          )}
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
              <div className="font-mono text-sm overflow-auto">
                {formatArg(param.value)}
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
                <div className="font-mono text-sm">
                  {formatArg(arg)}
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