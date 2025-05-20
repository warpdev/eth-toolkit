"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FunctionSignatureProps {
  signature: string;
}

export function FunctionSignature({ signature }: FunctionSignatureProps) {
  return (
    <div className="inline-flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-bold text-primary bg-primary/20">{signature}</span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Function Signature (4 bytes)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}