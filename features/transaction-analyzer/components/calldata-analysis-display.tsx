'use client';

import React from 'react';
import { CalldataResultDisplay } from '@/components/shared/calldata-result-display';
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
    <CalldataResultDisplay
      calldata={transactionInput}
      isDecoding={false}
      decodeError={null}
      decodedResult={calldataAnalysis}
      title="Calldata Analysis"
      showSignatureSelector={true}
      emptyStateMessage="No calldata to analyze"
      pendingStateMessage="Analyzing calldata..."
    />
  );
});
