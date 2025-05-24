import type { Transaction, TransactionReceipt, Block, Log } from 'viem';
import { formatEther, formatGwei, isHex, hexToString } from 'viem';
import type {
  GasAnalysis,
  TransactionFailureAnalysis,
  DecodedEventLog,
} from '@/lib/types/transaction-types';
import { GAS_THRESHOLDS, ETH_USD_PRICE } from './constants';

/**
 * Analyze gas usage and costs for a transaction
 */
export function analyzeGas(
  transaction: Transaction,
  receipt: TransactionReceipt,
  block?: Block
): GasAnalysis {
  const gasUsed = receipt.gasUsed;
  const gasLimit = transaction.gas;
  const gasEfficiency = Number((gasUsed * 100n) / gasLimit);

  // Determine gas type and pricing
  const isEIP1559 = transaction.maxFeePerGas !== undefined && transaction.maxFeePerGas !== null;
  const gasType = isEIP1559 ? 'eip1559' : 'legacy';

  // Calculate actual gas price paid
  let effectiveGasPrice: bigint;
  if (isEIP1559) {
    // For EIP-1559, use the actual gas price from receipt or calculate
    effectiveGasPrice = receipt.effectiveGasPrice || transaction.gasPrice || 0n;
  } else {
    // For legacy transactions, use the gas price from transaction
    effectiveGasPrice = transaction.gasPrice || 0n;
  }

  // Calculate total cost in ETH
  const totalCostWei = gasUsed * effectiveGasPrice;
  const estimatedCostEth = formatEther(totalCostWei);

  // Calculate USD estimate
  const ethValue = parseFloat(estimatedCostEth);
  const estimatedCostUsd = (ethValue * ETH_USD_PRICE).toFixed(2);

  return {
    gasUsed,
    gasLimit,
    gasPrice: transaction.gasPrice,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    baseFee: block?.baseFeePerGas ?? undefined,
    gasEfficiency,
    gasType,
    estimatedCostEth,
    estimatedCostUsd,
  };
}

/**
 * Analyze transaction failure and provide insights
 */
export function analyzeTransactionFailure(
  transaction: Transaction,
  receipt: TransactionReceipt
): TransactionFailureAnalysis {
  const failed = receipt.status === 'reverted';
  const gasUsedPercent = Number((receipt.gasUsed * 100n) / transaction.gas);

  let reason: string | undefined;
  let possibleCauses: string[] = [];

  if (failed) {
    // Analyze common failure patterns
    if (gasUsedPercent > GAS_THRESHOLDS.OUT_OF_GAS) {
      reason = 'Out of gas';
      possibleCauses = [
        'Transaction ran out of gas',
        'Gas limit set too low',
        'Complex computation or infinite loop',
      ];
    } else if (gasUsedPercent < GAS_THRESHOLDS.EARLY_REVERT) {
      reason = 'Early revert';
      possibleCauses = [
        'Require statement failed',
        'Invalid function call',
        'Access control violation',
        'Invalid parameters',
      ];
    } else {
      reason = 'Transaction reverted';
      possibleCauses = [
        'Smart contract logic error',
        'Require condition not met',
        'Assertion failed',
        'Custom revert reason',
      ];
    }
  }

  return {
    failed,
    reason,
    revertData: extractRevertData(receipt),
    gasUsedPercent,
    possibleCauses,
  };
}

/**
 * Calculate gas price in different units for better understanding
 */
export function formatGasPrices(gasPrice: bigint) {
  return {
    wei: gasPrice.toString(),
    gwei: formatGwei(gasPrice),
    eth: formatEther(gasPrice),
  };
}

/**
 * Get gas optimization suggestions based on analysis
 */
export function getGasOptimizationSuggestions(gasAnalysis: GasAnalysis): string[] {
  const suggestions: string[] = [];

  if (gasAnalysis.gasEfficiency < GAS_THRESHOLDS.MEDIUM_USAGE) {
    suggestions.push(
      'Consider reducing gas limit - transaction used only ' +
        gasAnalysis.gasEfficiency.toFixed(1) +
        '% of allocated gas'
    );
  }

  if (gasAnalysis.gasEfficiency > GAS_THRESHOLDS.OUT_OF_GAS) {
    suggestions.push(
      'Increase gas limit - transaction used ' +
        gasAnalysis.gasEfficiency.toFixed(1) +
        '% of allocated gas'
    );
  }

  if (gasAnalysis.gasType === 'legacy') {
    suggestions.push('Consider using EIP-1559 transactions for better fee estimation');
  }

  if (gasAnalysis.maxFeePerGas && gasAnalysis.maxPriorityFeePerGas) {
    const maxFee = gasAnalysis.maxFeePerGas;
    const priorityFee = gasAnalysis.maxPriorityFeePerGas;

    if (priorityFee > maxFee / 2n) {
      suggestions.push('Priority fee seems high - consider reducing it for lower costs');
    }
  }

  return suggestions;
}

/**
 * Categorize transaction by its characteristics
 */
export function categorizeTransaction(transaction: Transaction): string[] {
  const categories: string[] = [];

  // Basic categories
  if (transaction.to === null) {
    categories.push('Contract Creation');
  } else {
    categories.push('Contract Call');
  }

  // Value transfer
  if (transaction.value > 0n) {
    categories.push('Value Transfer');
  }

  // Gas type
  if (transaction.maxFeePerGas) {
    categories.push('EIP-1559');
  } else {
    categories.push('Legacy');
  }

  // Data size categories
  const dataSize = transaction.input ? (transaction.input.length - 2) / 2 : 0;
  if (dataSize === 0) {
    categories.push('Simple Transfer');
  } else if (dataSize < 1000) {
    categories.push('Small Data');
  } else if (dataSize < 10000) {
    categories.push('Medium Data');
  } else {
    categories.push('Large Data');
  }

  return categories;
}

/**
 * Extract basic information from event logs
 */
export function extractBasicEventInfo(logs: readonly Log[]): DecodedEventLog[] {
  return logs.map((log, index) => ({
    address: log.address,
    topics: log.topics || [],
    data: log.data || '0x',
    logIndex: log.logIndex ?? index,
    removed: log.removed || false,
  }));
}

/**
 * Extract revert data from a failed transaction receipt
 */
function extractRevertData(receipt: TransactionReceipt): string | undefined {
  if (receipt.status !== 'reverted') {
    return undefined;
  }

  // Access revert reason through the receipt
  // In viem, the revert reason might be in different places
  const receiptAny = receipt as TransactionReceipt & {
    revertReason?: string;
    error?: string | { message?: string; data?: string };
    revertData?: string;
  };

  // Check for revert reason in common locations
  if (receiptAny.revertReason) {
    return receiptAny.revertReason;
  }

  // For some RPCs, error message might be in the logs or custom fields
  if (receiptAny.error) {
    if (typeof receiptAny.error === 'string') {
      return receiptAny.error;
    } else if (receiptAny.error.message) {
      return receiptAny.error.message;
    } else if (receiptAny.error.data && isHex(receiptAny.error.data)) {
      // Try to decode hex error data to string
      try {
        const decoded = hexToString(receiptAny.error.data);
        if (decoded && decoded.length > 0) {
          return decoded;
        }
      } catch {
        // If decoding fails, return raw hex
        return receiptAny.error.data;
      }
    }
  }

  // Look for any custom error data in the receipt
  if (receiptAny.revertData && isHex(receiptAny.revertData)) {
    return receiptAny.revertData;
  }

  return undefined;
}

/**
 * Calculate transaction timing information
 */
export function analyzeTransactionTiming(
  blockTimestamp: bigint,
  currentTimestamp: bigint = BigInt(Math.floor(Date.now() / 1000))
) {
  const ageSeconds = currentTimestamp - blockTimestamp;
  const ageMinutes = Number(ageSeconds) / 60;
  const ageHours = ageMinutes / 60;
  const ageDays = ageHours / 24;

  let ageDescription: string;
  if (ageDays >= 1) {
    ageDescription = `${ageDays.toFixed(1)} days ago`;
  } else if (ageHours >= 1) {
    ageDescription = `${ageHours.toFixed(1)} hours ago`;
  } else if (ageMinutes >= 1) {
    ageDescription = `${ageMinutes.toFixed(1)} minutes ago`;
  } else {
    ageDescription = `${Number(ageSeconds)} seconds ago`;
  }

  return {
    ageSeconds: Number(ageSeconds),
    ageDescription,
    timestamp: Number(blockTimestamp),
    currentTimestamp: Number(currentTimestamp),
  };
}
