"use client";

import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { 
  saveDecodingResult,
  getDecodingHistory, 
  deleteDecodingRecord, 
  clearDecodingHistory
} from '@/lib/storage/abi-storage';
import { decodingHistoryAtom, isHistoryPanelOpenAtom } from '../atoms/decoder-history-atom';
import { DecodedFunctionWithSignatures } from '../lib/types';

export function useDecodingHistory() {
  const [history, setHistory] = useAtom(decodingHistoryAtom);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useAtom(isHistoryPanelOpenAtom);

  const loadHistory = useCallback(async () => {
    const records = await getDecodingHistory(50);
    setHistory(records);
  }, [setHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = useCallback(async (calldata: string, result: DecodedFunctionWithSignatures) => {
    if (result.error || !result.functionName) {
      return null;
    }

    const id = await saveDecodingResult(calldata, result);
    await loadHistory();
    return id;
  }, [loadHistory]);

  const removeFromHistory = useCallback(async (id: string) => {
    await deleteDecodingRecord(id);
    await loadHistory();
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    await clearDecodingHistory();
    await loadHistory();
  }, [loadHistory]);

  const toggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(prev => !prev);
  }, [setIsHistoryPanelOpen]);

  return {
    history,
    isHistoryPanelOpen,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryPanel,
    refreshHistory: loadHistory
  };
}