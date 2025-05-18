"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { 
  calldataAtom, 
  isDecodingAtom, 
  decodeErrorAtom 
} from "@/lib/atoms/calldata-atoms";
import { decodedResultAtom } from "@/lib/atoms/decoder-result-atom";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";

export function DecoderOutput() {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const decodedResult = useAtomValue(decodedResultAtom);

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

    // Special handling for alternative signatures (from 4bytes API)
    if (typeof arg === 'object' && arg !== null && 'alternativeSignatures' in arg) {
      const alternativeSignatures = (arg as any).alternativeSignatures;
      if (Array.isArray(alternativeSignatures) && alternativeSignatures.length > 0) {
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Alternative Function Signatures</h4>
            <ul className="space-y-1">
              {alternativeSignatures.map((sig: string, i: number) => (
                <li key={i} className="text-sm font-mono">{sig}</li>
              ))}
            </ul>
          </div>
        );
      }
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Function Signature</h3>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                {decodedResult.functionSig}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Function Name</h3>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {decodedResult.functionName}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Function Arguments</h3>
              {decodedResult.args && decodedResult.args.length > 0 ? (
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
              ) : (
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  No arguments
                </div>
              )}
            </div>
            
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