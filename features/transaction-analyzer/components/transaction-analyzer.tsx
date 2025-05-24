'use client';

import React, { useRef, useCallback } from 'react';
import { AnalysisForm } from './analysis-form';
import { AnalysisOutput } from './analysis-output';

export const TransactionAnalyzer = React.memo(function TransactionAnalyzer() {
  const resultRef = useRef<HTMLDivElement>(null);

  const scrollToResult = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto space-y-6">
      <AnalysisForm onAnalysisSuccess={scrollToResult} />
      <div ref={resultRef}>
        <AnalysisOutput />
      </div>
    </div>
  );
});
