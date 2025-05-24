'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TransactionFailureAnalysis } from '@/lib/types/transaction-types';
import { GAS_THRESHOLDS } from '@/features/transaction-analyzer/lib/constants';

interface FailureAnalysisDisplayProps {
  analysis: TransactionFailureAnalysis;
}

export const FailureAnalysisDisplay = React.memo(function FailureAnalysisDisplay({
  analysis,
}: FailureAnalysisDisplayProps) {
  if (!analysis.failed) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <span className="text-xl">⚠️</span>
          Transaction Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Failure Reason */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">Reason</label>
          <div className="mt-1 text-sm font-medium text-red-700">
            {analysis.reason || 'Transaction reverted'}
          </div>
        </div>

        {/* Gas Usage */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">Gas Used</label>
          <div className="mt-1 text-sm">
            {analysis.gasUsedPercent.toFixed(1)}% of gas limit
            {analysis.gasUsedPercent > GAS_THRESHOLDS.OUT_OF_GAS && (
              <span className="ml-2 text-red-600">(Likely out of gas)</span>
            )}
          </div>
        </div>

        {/* Revert Data */}
        {analysis.revertData && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">Revert Data</label>
            <code className="mt-1 block rounded bg-red-100 px-2 py-1 font-mono text-xs break-all text-red-800">
              {analysis.revertData}
            </code>
          </div>
        )}

        {/* Possible Causes */}
        {analysis.possibleCauses.length > 0 && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">Possible Causes</label>
            <ul className="mt-2 space-y-1">
              {analysis.possibleCauses.map((cause, index) => (
                <li
                  key={index}
                  className="rounded border-l-4 border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700"
                >
                  • {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debugging Tips */}
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <h4 className="mb-2 text-sm font-medium text-yellow-800">Debugging Tips</h4>
          <ul className="space-y-1 text-sm text-yellow-700">
            <li>• Check the contract&apos;s source code for require/assert statements</li>
            <li>• Verify function parameters and access permissions</li>
            <li>• Use a block explorer to view detailed error messages</li>
            <li>• Try simulating the transaction with tools like Tenderly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});
