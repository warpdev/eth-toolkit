'use client';

import React from 'react';
import { formatGwei } from 'viem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { GasAnalysis } from '@/lib/types/transaction-types';
import { getGasOptimizationSuggestions } from '@/features/transaction-analyzer/lib/transaction-analysis-utils';
import { GAS_THRESHOLDS } from '@/features/transaction-analyzer/lib/constants';

interface GasAnalysisDisplayProps {
  gasAnalysis: GasAnalysis;
}

export const GasAnalysisDisplay = React.memo(function GasAnalysisDisplay({
  gasAnalysis,
}: GasAnalysisDisplayProps) {
  const suggestions = getGasOptimizationSuggestions(gasAnalysis);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency > GAS_THRESHOLDS.OUT_OF_GAS) return 'text-red-600 bg-red-50';
    if (efficiency > GAS_THRESHOLDS.HIGH_USAGE) return 'text-orange-600 bg-orange-50';
    if (efficiency > GAS_THRESHOLDS.MEDIUM_USAGE) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Gas Analysis
          <span
            className={`rounded px-2 py-1 text-xs ${getEfficiencyColor(gasAnalysis.gasEfficiency)}`}
          >
            {gasAnalysis.gasEfficiency.toFixed(1)}% Used
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gas Usage */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-muted-foreground text-sm font-medium">Gas Used</label>
            <div className="mt-1 font-mono text-lg">{gasAnalysis.gasUsed.toLocaleString()}</div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Gas Limit</label>
            <div className="mt-1 font-mono text-lg">{gasAnalysis.gasLimit.toLocaleString()}</div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">Efficiency</label>
            <div className="mt-1 font-mono text-lg">{gasAnalysis.gasEfficiency.toFixed(1)}%</div>
          </div>
        </div>

        {/* Gas Price Information */}
        <div className="space-y-3">
          <h4 className="font-medium">Gas Pricing ({gasAnalysis.gasType.toUpperCase()})</h4>

          {gasAnalysis.gasType === 'eip1559' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">Max Fee Per Gas</label>
                <div className="mt-1 font-mono text-sm">
                  {gasAnalysis.maxFeePerGas ? formatGwei(gasAnalysis.maxFeePerGas) : 'N/A'} Gwei
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Max Priority Fee
                </label>
                <div className="mt-1 font-mono text-sm">
                  {gasAnalysis.maxPriorityFeePerGas
                    ? formatGwei(gasAnalysis.maxPriorityFeePerGas)
                    : 'N/A'}{' '}
                  Gwei
                </div>
              </div>

              {gasAnalysis.baseFee && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Base Fee</label>
                  <div className="mt-1 font-mono text-sm">
                    {formatGwei(gasAnalysis.baseFee)} Gwei
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-muted-foreground text-sm font-medium">Gas Price</label>
              <div className="mt-1 font-mono text-sm">
                {gasAnalysis.gasPrice ? formatGwei(gasAnalysis.gasPrice) : 'N/A'} Gwei
              </div>
            </div>
          )}
        </div>

        {/* Cost Information */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">Transaction Cost</label>
          <div className="mt-1 font-mono text-lg">
            {gasAnalysis.estimatedCostEth} ETH
            {gasAnalysis.estimatedCostUsd && (
              <span className="text-muted-foreground ml-2 text-sm">
                (~${gasAnalysis.estimatedCostUsd} USD)
              </span>
            )}
          </div>
        </div>

        {/* Visual Gas Usage Bar */}
        <div>
          <label className="text-muted-foreground text-sm font-medium">
            Gas Usage Visualization
          </label>
          <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
            <div
              className={`h-3 rounded-full transition-all ${
                gasAnalysis.gasEfficiency > 95
                  ? 'bg-red-500'
                  : gasAnalysis.gasEfficiency > 80
                    ? 'bg-orange-500'
                    : gasAnalysis.gasEfficiency > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
              }`}
              style={{ width: `${gasAnalysis.gasEfficiency}%` }}
            />
          </div>
          <div className="text-muted-foreground mt-1 flex justify-between text-xs">
            <span>0</span>
            <span>{gasAnalysis.gasEfficiency.toFixed(1)}% used</span>
            <span>100%</span>
          </div>
        </div>

        {/* Optimization Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Optimization Suggestions
            </label>
            <ul className="mt-2 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="rounded border-l-4 border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"
                >
                  💡 {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
