"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { 
  calldataAtom, 
  isDecodingAtom, 
  decodeErrorAtom 
} from "@/lib/atoms/calldata-atoms";
import { decodedResultAtom, selectedSignatureIndexAtom } from "@/lib/atoms/decoder-result-atom";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveSignatureSelection } from "@/lib/storage/abi-storage";
import { useParseParameters } from "@/lib/hooks/use-parse-parameters";

export function DecoderOutput() {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const decodedResult = useAtomValue(decodedResultAtom);
  const [selectedIndex, setSelectedIndex] = useAtom(selectedSignatureIndexAtom);
  
  // Use our custom hook for parameter parsing
  const { parsedParameters, selectedSignature, parseError } = useParseParameters();

  // Helper to format arguments in a readable way
  const formatArg = (arg: unknown, index: number): React.ReactNode => {
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
      } catch (e) {
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

  // The parameter parsing logic is now handled by the useParseParameters hook

  // Handler for signature selection
  const handleSignatureChange = async (value: string) => {
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
  };

  // Get the current function signature is now handled by the useParseParameters hook
  // We use the selectedSignature value directly

  // Get the function name from the current signature
  const getCurrentFunctionName = () => {
    if (selectedSignature) {
      return selectedSignature.split("(")[0];
    }
    
    return decodedResult?.functionName || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Decoded Output</CardTitle>
      </CardHeader>
      <CardContent>
        {isDecoding ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : decodeError ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <h3 className="font-medium">Error Decoding Calldata</h3>
            <p className="text-sm mt-1">{decodeError}</p>
          </div>
        ) : !calldata ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>Enter calldata to see the decoded result</p>
          </div>
        ) : !decodedResult ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>Click "Decode Calldata" to decode</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Function signature selector */}
            {decodedResult.possibleSignatures && decodedResult.possibleSignatures.length > 1 && (
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
            )}
            
            {/* Single function signature (no alternatives) */}
            {(!decodedResult.possibleSignatures || decodedResult.possibleSignatures.length <= 1) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Function Signature</h3>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {selectedSignature || decodedResult.functionSig}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Function Name</h3>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {getCurrentFunctionName()}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Function Parameters</h3>
              {parsedParameters && parsedParameters.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {parsedParameters.map((param, index) => (
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
                        {formatArg(param.value, index)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  {parseError ? (
                    <div className="text-destructive/80">{parseError}</div>
                  ) : (
                    "No parameters could be parsed"
                  )}
                </div>
              )}
            </div>
            
            {/* Show raw arguments as a fallback if parameter parsing fails */}
            {parsedParameters.length === 0 && decodedResult.args && decodedResult.args.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Raw Function Arguments</h3>
                <div className="border rounded-md divide-y">
                  {decodedResult.args.map((arg, index) => (
                    <div key={index} className="p-3 grid grid-cols-[auto_1fr] gap-4">
                      <div className="font-medium text-sm text-muted-foreground">
                        Arg {index + 1}:
                      </div>
                      <div className="font-mono text-sm">
                        {formatArg(arg, index)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Raw Calldata</h3>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                {calldata}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}