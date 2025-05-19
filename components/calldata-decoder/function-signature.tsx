"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FunctionSignatureProps {
  signature: string;
}

export function FunctionSignature({ signature }: FunctionSignatureProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="bg-primary/20 text-primary font-bold">{signature}</span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Function Signature (4 bytes)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}