'use client';

import React from 'react';
import { formatEther } from 'viem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/shared/copy-button';
import type { TransactionAnalysisResult } from '@/lib/types/transaction-types';
import {
  categorizeTransaction,
  analyzeTransactionTiming,
} from '@/features/transaction-analyzer/lib/transaction-analysis-utils';

interface TransactionOverviewProps {
  result: TransactionAnalysisResult;
}

export const TransactionOverview = React.memo(function TransactionOverview({
  result,
}: TransactionOverviewProps) {
  const { transaction, receipt, blockContext } = result;

  const categories = categorizeTransaction(transaction);
  const timing = analyzeTransactionTiming(blockContext.timestamp);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reverted':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction Overview
          <span className={`rounded border px-2 py-1 text-xs ${getStatusColor(receipt.status)}`}>
            {receipt.status === 'success' ? 'Success' : 'Failed'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-muted-foreground text-sm font-medium">Hash</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">{result.hash}</code>
              <CopyButton text={result.hash} />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Block</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm">#{blockContext.blockNumber.toString()}</span>
              <span className="text-muted-foreground text-xs">
                ({blockContext.confirmations.toString()} confirmations)
              </span>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">From</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                {transaction.from}
              </code>
              <CopyButton text={transaction.from} />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">To</label>
            <div className="mt-1 flex items-center gap-2">
              {transaction.to ? (
                <>
                  <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                    {transaction.to}
                  </code>
                  <CopyButton text={transaction.to} />
                </>
              ) : (
                <span className="text-muted-foreground text-sm italic">Contract Creation</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Value</label>
            <div className="mt-1 text-sm">
              {transaction.value > 0n ? (
                <span>{formatEther(transaction.value)} ETH</span>
              ) : (
                <span className="text-muted-foreground">0 ETH</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Timestamp</label>
            <div className="mt-1 text-sm">
              <span>{new Date(Number(blockContext.timestamp) * 1000).toLocaleString()}</span>
              <div className="text-muted-foreground text-xs">{timing.ageDescription}</div>
            </div>
          </div>
        </div>

        {/* Transaction Categories */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">Type</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {categories.map((category, index) => (
              <span
                key={index}
                className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Input Data */}
        {transaction.input && transaction.input !== '0x' && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Input Data ({(transaction.input.length - 2) / 2} bytes)
            </label>
            <div className="mt-1">
              <code className="bg-muted block rounded px-2 py-1 font-mono text-xs break-all">
                {transaction.input.length > 100
                  ? `${transaction.input.slice(0, 100)}...`
                  : transaction.input}
              </code>
              <CopyButton text={transaction.input} className="mt-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
