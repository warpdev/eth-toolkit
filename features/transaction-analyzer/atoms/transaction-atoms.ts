'use client';

import { atom } from 'jotai';
import type {
  TransactionAnalysisOptions,
  TransactionAnalysisResult,
  TransactionAnalysisStatus,
} from '@/lib/types/transaction-types';

// Input state atoms
export const transactionHashAtom = atom<string>('');

export const analysisOptionsAtom = atom<TransactionAnalysisOptions>({
  includeGasAnalysis: true,
  includeEventLogs: true,
  includeCalldata: true,
  includeStateChanges: false,
});

// Processing state atoms
export const analysisStatusAtom = atom<TransactionAnalysisStatus>('idle');

export const analysisErrorAtom = atom<string | null>(null);

// Result state atoms
export const analysisResultAtom = atom<TransactionAnalysisResult | null>(null);

// Derived atoms
export const isAnalyzingAtom = atom<boolean>((get) => get(analysisStatusAtom) === 'analyzing');

export const hasValidHashAtom = atom<boolean>((get) => {
  const hash = get(transactionHashAtom);
  return hash.length === 66 && hash.startsWith('0x');
});

export const canAnalyzeAtom = atom<boolean>((get) => {
  const hasValidHash = get(hasValidHashAtom);
  const isAnalyzing = get(isAnalyzingAtom);
  return hasValidHash && !isAnalyzing;
});
