"use client";

import React, { useMemo } from "react";
import { useAtomValue } from "jotai";
import { 
  calldataAtom, 
  isDecodingAtom, 
  decodeErrorAtom 
} from "@/features/calldata-decoder/atoms/calldata-atoms";
import { decodedResultAtom } from "@/features/calldata-decoder/atoms/decoder-result-atom";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorCodedCalldata } from "./color-coded-calldata";
import { FunctionSignatureSelector } from "./function-signature-selector";
import { ParameterDisplay } from "./parameter-display";
import { CopyButton } from "./copy-button";
import { useParseParameters } from "@/features/calldata-decoder/hooks/use-parse-parameters";

// Extracted skeleton component to prevent recreation on each render
const SkeletonGroup = React.memo(function SkeletonGroup() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-16 w-3/4" />
    </div>
  );
});

export const DecoderOutput = React.memo(function DecoderOutput() {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const decodedResult = useAtomValue(decodedResultAtom);
  
  // Use our custom hook for parameter parsing
  const { parsedParameters, selectedSignature, parseError } = useParseParameters();

  // Get the function name from the current signature - memoized to prevent recalculation
  const currentFunctionName = useMemo(() => {
    if (selectedSignature) {
      return selectedSignature.split("(")[0];
    }
    
    return decodedResult?.functionName || "";
  }, [selectedSignature, decodedResult?.functionName]);

  // Render different states based on current decoding status
  const renderContent = () => {
    if (isDecoding) {
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Decoding calldata...</p>
          </div>
          <SkeletonGroup />
        </div>
      );
    }
    
    if (decodeError) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-medium">Error Decoding Calldata</h3>
          <p className="text-sm mt-1">{decodeError}</p>
        </div>
      );
    }
    
    if (!calldata) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>Enter calldata to see the decoded result</p>
        </div>
      );
    }
    
    if (!decodedResult) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>Click &quot;Decode Calldata&quot; to decode</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Function signature selector */}
        <FunctionSignatureSelector 
          decodedResult={decodedResult} 
          calldata={calldata} 
        />
        
        {/* Function name */}
        <div className="space-y-2">
          <h3 className="flex items-center justify-between text-sm font-medium">
            <span>Function Name</span>
            {currentFunctionName && (
              <CopyButton
                text={currentFunctionName}
                tooltipText="Copy function name"
                successMessage="Function name copied!"
              />
            )}
          </h3>
          <div className="p-3 bg-muted rounded-md font-mono text-sm">
            {currentFunctionName}
          </div>
        </div>
        
        {/* Function parameters */}
        <ParameterDisplay 
          parameters={parsedParameters} 
          parseError={parseError}
          args={decodedResult.args}
        />
        
        {/* Raw calldata */}
        <div className="space-y-2">
          <h3 className="flex items-center justify-between text-sm font-medium">
            <span>Raw Calldata</span>
            {calldata && (
              <CopyButton 
                text={calldata} 
                tooltipText="Copy raw calldata" 
                successMessage="Raw calldata copied!"
              />
            )}
          </h3>
          <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
            {calldata && <ColorCodedCalldata 
              calldata={calldata} 
              parsedParameters={parsedParameters}
            />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Decoded Output</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
});