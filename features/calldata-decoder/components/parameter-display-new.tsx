"use client";

import React from "react";
import { ParsedParameter } from "../lib/types";
import { ParameterItem } from "./parameter-item";
import { RawArgItem } from "./raw-arg-item";

interface ParameterDisplayProps {
  parameters: ParsedParameter[];
  parseError?: string | null;
  args?: unknown[];
}

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
            <ParameterItem key={index} parameter={param} index={index} />
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
              <RawArgItem key={index} arg={arg} index={index} />
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