'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import {
  transactionHashAtom,
  analysisStatusAtom,
  analysisErrorAtom,
  analysisResultAtom,
} from '@/features/transaction-analyzer/atoms/transaction-atoms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverview } from './transaction-overview';
import { GasAnalysisDisplay } from './gas-analysis-display';
import { EventLogsDisplay } from './event-logs-display';
import { FailureAnalysisDisplay } from './failure-analysis-display';
import { CalldataAnalysisDisplay } from './calldata-analysis-display';

// Extracted skeleton component to prevent recreation on each render
const SkeletonGroup = React.memo(function SkeletonGroup() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
});

export const AnalysisOutput = React.memo(function AnalysisOutput() {
  const transactionHash = useAtomValue(transactionHashAtom);
  const analysisStatus = useAtomValue(analysisStatusAtom);
  const analysisError = useAtomValue(analysisErrorAtom);
  const analysisResult = useAtomValue(analysisResultAtom);

  // Render different states based on current analysis status
  const renderContent = () => {
    if (analysisStatus === 'analyzing') {
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
            <p className="text-sm font-medium">Analyzing transaction...</p>
          </div>
          <SkeletonGroup />
        </div>
      );
    }

    if (analysisError) {
      return (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          <h3 className="font-medium">Error Analyzing Transaction</h3>
          <p className="mt-1 text-sm">{analysisError}</p>
        </div>
      );
    }

    if (!transactionHash) {
      return (
        <div className="text-muted-foreground p-8 text-center">
          <p>Enter a transaction hash to see the analysis result</p>
        </div>
      );
    }

    if (!analysisResult) {
      return (
        <div className="text-muted-foreground p-8 text-center">
          <p>Click &quot;Analyze Transaction&quot; to start the analysis</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <TransactionOverview result={analysisResult} />

        {analysisResult.failureAnalysis.failed && (
          <FailureAnalysisDisplay analysis={analysisResult.failureAnalysis} />
        )}

        <GasAnalysisDisplay gasAnalysis={analysisResult.gasAnalysis} />

        {analysisResult.calldataAnalysis && (
          <CalldataAnalysisDisplay
            calldataAnalysis={analysisResult.calldataAnalysis}
            transactionInput={analysisResult.transaction.input}
          />
        )}

        {analysisResult.eventLogs.length > 0 && (
          <EventLogsDisplay logs={analysisResult.eventLogs} />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
});
