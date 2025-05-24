'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/shared/copy-button';
import type { TransactionAnalysisResult } from '@/lib/types/transaction-types';

interface CalldataAnalysisDisplayProps {
  calldataAnalysis: TransactionAnalysisResult['calldataAnalysis'];
  transactionInput: string;
}

export const CalldataAnalysisDisplay = React.memo(function CalldataAnalysisDisplay({
  calldataAnalysis,
  transactionInput,
}: CalldataAnalysisDisplayProps) {
  if (!calldataAnalysis || !transactionInput || transactionInput === '0x') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calldata Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Function Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-muted-foreground text-sm font-medium">Function Name</label>
            <div className="mt-1 font-mono text-lg">
              {calldataAnalysis.functionName || 'Unknown'}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Function Signature</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                {calldataAnalysis.signature || 'N/A'}
              </code>
              {calldataAnalysis.signature && <CopyButton text={calldataAnalysis.signature} />}
            </div>
          </div>
        </div>

        {/* Raw Calldata */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">
            Raw Calldata ({(transactionInput.length - 2) / 2} bytes)
          </label>
          <div className="mt-1">
            <div className="bg-muted rounded-md p-3">
              <code className="font-mono text-xs break-all">{transactionInput}</code>
            </div>
            <CopyButton text={transactionInput} className="mt-2" />
          </div>
        </div>

        {/* Function Arguments */}
        {calldataAnalysis.args && calldataAnalysis.args.length > 0 && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Function Arguments ({calldataAnalysis.args.length})
            </label>
            <div className="mt-2 space-y-2">
              {calldataAnalysis.args.map((arg, index) => (
                <div key={index} className="rounded-md border bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Argument {index}</span>
                    <span className="text-muted-foreground text-xs">Type: {typeof arg}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded border bg-white px-2 py-1 font-mono text-sm break-all">
                      {typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)}
                    </code>
                    <CopyButton text={String(arg)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calldata Breakdown */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">Calldata Breakdown</label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20 text-xs font-medium">Selector:</span>
              <code className="rounded border bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">
                {transactionInput.slice(0, 10)}
              </code>
              <CopyButton text={transactionInput.slice(0, 10)} />
            </div>

            {transactionInput.length > 10 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20 text-xs font-medium">Data:</span>
                <code className="flex-1 rounded border bg-gray-50 px-2 py-1 font-mono text-xs break-all">
                  {transactionInput.slice(10, 50)}...
                </code>
                <CopyButton text={transactionInput.slice(10)} />
              </div>
            )}
          </div>
        </div>

        {/* Analysis Notes */}
        {calldataAnalysis.functionName === 'Unknown Function' && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <h4 className="mb-1 text-sm font-medium text-yellow-800">Analysis Note</h4>
            <p className="text-sm text-yellow-700">
              The function signature could not be identified. This might be:
            </p>
            <ul className="mt-1 ml-4 list-disc text-sm text-yellow-700">
              <li>A custom function not in the 4bytes database</li>
              <li>An internal function call</li>
              <li>Malformed calldata</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
