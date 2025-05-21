"use client";

import React from "react";
import { FormatArg, getArgAsString } from "./parameter-formatters";
import { CopyButton } from "@/components/shared/copy-button";

interface RawArgItemProps {
  arg: unknown;
  index: number;
}

export const RawArgItem = React.memo(function RawArgItem({
  arg,
  index
}: RawArgItemProps) {
  return (
    <div className="p-3 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
      <div className="font-medium text-sm text-muted-foreground">
        Arg {index + 1}:
      </div>
      <div className="relative group font-mono text-sm">
        <div className="pr-8">
          <FormatArg arg={arg} />
        </div>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton 
            text={getArgAsString(arg)} 
            tooltipText="Copy argument value" 
            successMessage="Argument value copied!"
          />
        </div>
      </div>
    </div>
  );
});