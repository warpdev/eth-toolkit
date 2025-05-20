"use client";

import React, { useCallback } from "react";
import { useAtom } from "jotai";
import { selectedSignatureIndexAtom } from "@/lib/atoms/decoder-result-atom";
import { DecodedFunctionWithSignatures } from "@/lib/decoder/types";
import { saveSignatureSelection } from "@/lib/storage/abi-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FunctionSignatureSelectorProps {
  decodedResult: DecodedFunctionWithSignatures;
  calldata: string;
}

export const FunctionSignatureSelector = React.memo(function FunctionSignatureSelector({
  decodedResult,
  calldata
}: FunctionSignatureSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useAtom(selectedSignatureIndexAtom);

  // Handler for signature selection
  const handleSignatureChange = useCallback(async (value: string) => {
    // Parse the index from the value
    const index = parseInt(value, 10);
    
    if (
      decodedResult && 
      decodedResult.possibleSignatures && 
      !isNaN(index) && 
      index >= 0 && 
      index < decodedResult.possibleSignatures.length
    ) {
      // Update selected index (will trigger parameter parsing in hook)
      setSelectedIndex(index);
      
      // Save this choice to IndexedDB for future reference
      if (calldata) {
        const functionSelector = calldata.startsWith("0x") 
          ? calldata.slice(0, 10) 
          : `0x${calldata.slice(0, 8)}`;
        
        try {
          // Get the selected signature
          const selectedSig = decodedResult.possibleSignatures[index];
          
          // Save to IndexedDB
          await saveSignatureSelection(
            functionSelector,
            selectedSig
          );
        } catch (error) {
          console.error("Error saving signature selection:", error);
        }
      }
    }
  }, [decodedResult, calldata, setSelectedIndex]);

  // If there's only one or no signatures, don't show the selector
  if (!decodedResult.possibleSignatures || decodedResult.possibleSignatures.length <= 1) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Function Signature</h3>
        <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
          {decodedResult.possibleSignatures?.[0] || decodedResult.functionSig}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Function Signature</h3>
        <div className="text-sm text-muted-foreground">
          {decodedResult.possibleSignatures.length} possible signatures found
        </div>
      </div>
      
      <Select 
        value={selectedIndex.toString()} 
        onValueChange={handleSignatureChange}
      >
        <SelectTrigger className="w-full font-mono text-sm">
          <SelectValue placeholder="Select a function signature" />
        </SelectTrigger>
        <SelectContent>
          {decodedResult.possibleSignatures.map((sig, index) => (
            <SelectItem 
              key={index} 
              value={index.toString()} 
              className="font-mono text-sm"
            >
              {sig}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});