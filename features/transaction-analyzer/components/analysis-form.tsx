'use client';

import React, { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import { useErrorToast } from '@/hooks/use-error-toast';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  transactionHashAtom,
  analysisOptionsAtom,
  analysisStatusAtom,
  analysisErrorAtom,
  canAnalyzeAtom,
} from '@/features/transaction-analyzer/atoms/transaction-atoms';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTransactionAnalysis } from '@/features/transaction-analyzer/hooks/use-transaction-analysis';

interface AnalysisFormProps {
  onAnalysisSuccess?: () => void;
}

export const AnalysisForm = React.memo(function AnalysisForm({
  onAnalysisSuccess,
}: AnalysisFormProps) {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const [analysisOptions, setAnalysisOptions] = useAtom(analysisOptionsAtom);
  const analysisStatus = useAtomValue(analysisStatusAtom);
  const canAnalyze = useAtomValue(canAnalyzeAtom);

  const { analyzeTransaction } = useTransactionAnalysis();

  // Watch for analysis errors and show toast
  useErrorToast({ errorAtom: analysisErrorAtom, title: 'Analysis Error' });

  const handleAnalyze = useCallback(async () => {
    const result = await analyzeTransaction();
    if (result) {
      // Show success toast
      const successToastOptions = {
        description: `Successfully analyzed transaction ${result.hash.slice(0, 10)}...`,
        duration: 3000,
      };
      toast.success('Transaction Analyzed', successToastOptions);

      // Scroll to the result section
      if (onAnalysisSuccess) {
        // Small delay to ensure result is rendered
        setTimeout(() => {
          onAnalysisSuccess();
        }, 100);
      }
    }
  }, [analyzeTransaction, onAnalysisSuccess]);

  const handleHashChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTransactionHash(e.target.value);
    },
    [setTransactionHash]
  );

  const handleHashKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && canAnalyze) {
        e.preventDefault();
        handleAnalyze();
      }
    },
    [canAnalyze, handleAnalyze]
  );

  const handleOptionChange = useCallback(
    (option: keyof typeof analysisOptions, checked: boolean) => {
      setAnalysisOptions((prev) => ({ ...prev, [option]: checked }));
    },
    [setAnalysisOptions]
  );

  const isAnalyzing = analysisStatus === 'analyzing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Analyzer</CardTitle>
        <CardDescription>
          Analyze Ethereum transactions to get detailed information about gas usage, event logs,
          potential failures, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="transaction-hash">Transaction Hash</Label>
          <Input
            id="transaction-hash"
            type="text"
            placeholder="0x..."
            value={transactionHash}
            onChange={handleHashChange}
            onKeyDown={handleHashKeyDown}
            className="font-mono"
          />
          <p className="text-muted-foreground text-sm">
            Enter a valid Ethereum transaction hash (66 characters starting with 0x)
          </p>
        </div>

        <div className="space-y-4">
          <Label>Analysis Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gas-analysis"
                checked={analysisOptions.includeGasAnalysis}
                onCheckedChange={(checked) =>
                  handleOptionChange('includeGasAnalysis', checked as boolean)
                }
              />
              <Label htmlFor="gas-analysis" className="text-sm">
                Gas Analysis
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="event-logs"
                checked={analysisOptions.includeEventLogs}
                onCheckedChange={(checked) =>
                  handleOptionChange('includeEventLogs', checked as boolean)
                }
              />
              <Label htmlFor="event-logs" className="text-sm">
                Event Logs
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="calldata-analysis"
                checked={analysisOptions.includeCalldata}
                onCheckedChange={(checked) =>
                  handleOptionChange('includeCalldata', checked as boolean)
                }
              />
              <Label htmlFor="calldata-analysis" className="text-sm">
                Calldata Analysis
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="state-changes"
                checked={analysisOptions.includeStateChanges}
                onCheckedChange={(checked) =>
                  handleOptionChange('includeStateChanges', checked as boolean)
                }
                disabled // TODO: Implement state change analysis
              />
              <Label htmlFor="state-changes" className="text-muted-foreground text-sm">
                State Changes (Coming Soon)
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <LoadingButton
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          disabled={!canAnalyze}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing Transaction...' : 'Analyze Transaction'}
        </LoadingButton>
      </CardFooter>
    </Card>
  );
});
