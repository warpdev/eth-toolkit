'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import type { Hash, Transaction } from 'viem';
import {
  transactionHashAtom,
  analysisOptionsAtom,
  analysisStatusAtom,
  analysisErrorAtom,
  analysisResultAtom,
  hasValidHashAtom,
} from '@/features/transaction-analyzer/atoms/transaction-atoms';
import type { TransactionAnalysisResult } from '@/lib/types/transaction-types';
import { publicClient } from '@/lib/config/viem-client';
import { normalizeError, ErrorType } from '@/lib/utils';
import { decodeCalldataWithSignatureLookup } from '@/lib/utils/calldata-processing';
import {
  analyzeGas,
  analyzeTransactionFailure,
  extractBasicEventInfo,
} from '../lib/transaction-analysis-utils';

/**
 * Hook for analyzing Ethereum transactions
 */
export function useTransactionAnalysis() {
  const transactionHash = useAtomValue(transactionHashAtom);
  const analysisOptions = useAtomValue(analysisOptionsAtom);
  const hasValidHash = useAtomValue(hasValidHashAtom);

  const setAnalysisStatus = useSetAtom(analysisStatusAtom);
  const setAnalysisError = useSetAtom(analysisErrorAtom);
  const setAnalysisResult = useSetAtom(analysisResultAtom);

  /**
   * Validate transaction hash input
   */
  const validateTransactionHash = useCallback((): boolean => {
    if (!transactionHash) {
      setAnalysisError('Transaction hash is required');
      return false;
    }

    if (!hasValidHash) {
      setAnalysisError(
        'Invalid transaction hash format. Must be a 66-character hex string starting with 0x'
      );
      return false;
    }

    return true;
  }, [transactionHash, hasValidHash, setAnalysisError]);

  /**
   * Fetch transaction data from the blockchain
   */
  const fetchTransactionData = useCallback(async (hash: Hash) => {
    const [transaction, receipt] = await Promise.all([
      publicClient.getTransaction({ hash }),
      publicClient.getTransactionReceipt({ hash }),
    ]);

    return { transaction, receipt };
  }, []);

  /**
   * Get block context information
   */
  const getBlockContext = useCallback(async (blockHash: Hash, blockNumber: bigint) => {
    const latestBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const block = await publicClient.getBlock({ blockHash });

    return {
      blockNumber,
      blockHash,
      timestamp: block.timestamp,
      confirmations: latestBlock.number - blockNumber,
    };
  }, []);

  /**
   * Analyze transaction and generate comprehensive results
   */
  const analyzeTransaction = useCallback(async (): Promise<TransactionAnalysisResult | null> => {
    setAnalysisStatus('analyzing');
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // Validate input
      if (!validateTransactionHash()) {
        setAnalysisStatus('error');
        return null;
      }

      const hash = transactionHash as Hash;

      // Fetch transaction data
      const { transaction, receipt } = await fetchTransactionData(hash);

      // Get block context
      const blockContext = await getBlockContext(receipt.blockHash, receipt.blockNumber);

      // Get block for gas analysis
      const block = await publicClient.getBlock({ blockHash: receipt.blockHash });

      // Analyze gas usage
      const gasAnalysis = analysisOptions.includeGasAnalysis
        ? analyzeGas(transaction as Transaction, receipt, block)
        : {
            gasUsed: receipt.gasUsed,
            gasLimit: transaction.gas,
            gasPrice: transaction.gasPrice,
            gasEfficiency: 0,
            gasType: 'legacy' as const,
            estimatedCostEth: '0',
          };

      // Analyze failure if transaction reverted
      const failureAnalysis = analyzeTransactionFailure(transaction as Transaction, receipt);

      // Extract event logs
      const eventLogs = analysisOptions.includeEventLogs ? extractBasicEventInfo(receipt.logs) : [];

      // Calldata analysis (if enabled and has input data)
      let calldataAnalysis;
      if (analysisOptions.includeCalldata && transaction.input && transaction.input !== '0x') {
        try {
          calldataAnalysis = await decodeCalldataWithSignatureLookup(transaction.input);
        } catch (error) {
          console.error('Error analyzing calldata:', error);
          // Don't fail the entire analysis if calldata analysis fails
        }
      }

      const result: TransactionAnalysisResult = {
        hash,
        transaction: transaction as Transaction,
        receipt,
        gasAnalysis,
        eventLogs,
        failureAnalysis,
        calldataAnalysis,
        blockContext,
      };

      setAnalysisResult(result);
      setAnalysisStatus('success');
      return result;
    } catch (error) {
      const normalizedError = normalizeError(error, ErrorType.UNKNOWN_ERROR);
      setAnalysisError(normalizedError.message);
      setAnalysisStatus('error');
      return null;
    }
  }, [
    transactionHash,
    analysisOptions,
    validateTransactionHash,
    fetchTransactionData,
    getBlockContext,
    setAnalysisStatus,
    setAnalysisError,
    setAnalysisResult,
  ]);

  return {
    analyzeTransaction,
  };
}
