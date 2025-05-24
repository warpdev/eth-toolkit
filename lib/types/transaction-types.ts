import type { Hash, TransactionReceipt, Transaction } from 'viem';
import type { DecodedFunctionWithSignatures } from '@/lib/types';

/**
 * Transaction analysis options
 */
export interface TransactionAnalysisOptions {
  includeGasAnalysis: boolean;
  includeEventLogs: boolean;
  includeCalldata: boolean;
  includeStateChanges: boolean;
}

/**
 * Gas analysis result
 */
export interface GasAnalysis {
  gasUsed: bigint;
  gasLimit: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  baseFee?: bigint;
  gasEfficiency: number; // gasUsed / gasLimit as percentage
  gasType: 'legacy' | 'eip1559';
  estimatedCostEth: string;
  estimatedCostUsd?: string;
}

/**
 * Decoded event log with enhanced information
 */
export interface DecodedEventLog {
  address: Hash;
  topics: Hash[];
  data: string;
  eventName?: string;
  args?: Record<string, unknown>;
  signature?: string;
  logIndex: number;
  removed: boolean;
}

/**
 * Transaction failure analysis
 */
export interface TransactionFailureAnalysis {
  failed: boolean;
  reason?: string;
  revertData?: string;
  gasUsedPercent: number;
  possibleCauses: string[];
}

/**
 * Complete transaction analysis result
 */
export interface TransactionAnalysisResult {
  hash: Hash;
  transaction: Transaction;
  receipt: TransactionReceipt;
  gasAnalysis: GasAnalysis;
  eventLogs: DecodedEventLog[];
  failureAnalysis: TransactionFailureAnalysis;
  calldataAnalysis?: DecodedFunctionWithSignatures;
  blockContext: {
    blockNumber: bigint;
    blockHash: Hash;
    timestamp: bigint;
    confirmations: bigint;
  };
}

/**
 * Transaction analysis status
 */
export type TransactionAnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';
