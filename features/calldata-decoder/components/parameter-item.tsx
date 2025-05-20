"use client";

import React from "react";
import { ParsedParameter } from "../lib/types";
import { CopyButton } from "./copy-button";
import { FormatArg, getArgAsString } from "./parameter-formatters";

interface ParameterItemProps {
  parameter: ParsedParameter;
  index: number;
}

export const ParameterItem = React.memo(function ParameterItem({
  parameter,
  index
}: ParameterItemProps) {
  return (
    <div className="p-3 grid grid-cols-[1fr_1fr] gap-4">
      <div className="space-y-1">
        <div className="font-medium text-sm">
          {parameter.name}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {parameter.type}
        </div>
      </div>
      <div className="relative overflow-auto group font-mono text-sm">
        <div className="pr-8">
          <FormatArg arg={parameter.value} type={parameter.type} />
        </div>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton 
            text={getArgAsString(parameter.value)} 
            tooltipText="Copy parameter value" 
            successMessage="Parameter value copied!"
          />
        </div>
      </div>
    </div>
  );
});