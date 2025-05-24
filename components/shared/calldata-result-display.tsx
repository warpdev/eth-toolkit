'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ColorCodedCalldata } from '@/features/calldata-decoder/components/color-coded-calldata';
import { FunctionSignatureSelector } from '@/features/calldata-decoder/components/function-signature-selector';
import { ParameterDisplay } from '@/features/calldata-decoder/components/parameter-display';
import { CopyButton } from '@/components/shared/copy-button';
import { useParseParameters } from '@/features/calldata-decoder/hooks/use-parse-parameters';
import type { DecodedFunctionWithSignatures } from '@/lib/types/calldata-types';

interface CalldataResultDisplayProps {
  calldata: string;
  isDecoding?: boolean;
  decodeError?: string | null;
  decodedResult?: DecodedFunctionWithSignatures | null;
  title?: string;
  showSignatureSelector?: boolean;
  emptyStateMessage?: string;
  pendingStateMessage?: string;
}

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

export const CalldataResultDisplay = React.memo(function CalldataResultDisplay({
  calldata,
  isDecoding = false,
  decodeError,
  decodedResult,
  title = 'Decoded Output',
  showSignatureSelector = true,
  emptyStateMessage = 'Enter calldata to see the decoded result',
  pendingStateMessage = 'Click "Decode Calldata" to decode',
}: CalldataResultDisplayProps) {
  // Use our custom hook for parameter parsing - this handles signature selection for calldata decoder
  const { parsedParameters: hookParsedParameters, selectedSignature, parseError } = useParseParameters();

  // For transaction analyzer, use the parsed parameters from decodedResult if available
  // For calldata decoder, use the hook's parsed parameters
  const parsedParameters = useMemo(() => {
    // If decodedResult has parsedParameters (from transaction analyzer), use those
    if (decodedResult?.parsedParameters && decodedResult.parsedParameters.length > 0) {
      return decodedResult.parsedParameters;
    }
    // Otherwise, use the hook's parameters (from calldata decoder)
    return hookParsedParameters;
  }, [decodedResult?.parsedParameters, hookParsedParameters]);

  // Get the function name from the current signature - memoized to prevent recalculation
  const currentFunctionName = useMemo(() => {
    if (selectedSignature) {
      return selectedSignature.split('(')[0];
    }

    return decodedResult?.functionName || '';
  }, [selectedSignature, decodedResult?.functionName]);

  // Render different states based on current decoding status
  const renderContent = () => {
    if (isDecoding) {
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
            <p className="text-sm font-medium">Decoding calldata...</p>
          </div>
          <SkeletonGroup />
        </div>
      );
    }

    if (decodeError) {
      return (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          <h3 className="font-medium">Error Decoding Calldata</h3>
          <p className="mt-1 text-sm">{decodeError}</p>
        </div>
      );
    }

    if (!calldata) {
      return (
        <div className="text-muted-foreground p-8 text-center">
          <p>{emptyStateMessage}</p>
        </div>
      );
    }

    if (!decodedResult) {
      return (
        <div className="text-muted-foreground p-8 text-center">
          <p>{pendingStateMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Function signature selector - only show if enabled and there are multiple signatures */}
        {showSignatureSelector && (
          <FunctionSignatureSelector decodedResult={decodedResult} calldata={calldata} />
        )}

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
          <div className="bg-muted rounded-md p-3 font-mono text-sm">{currentFunctionName}</div>
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
          <div className="bg-muted rounded-md p-3 font-mono text-sm break-all">
            {calldata && (
              <ColorCodedCalldata calldata={calldata} parsedParameters={parsedParameters} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
});