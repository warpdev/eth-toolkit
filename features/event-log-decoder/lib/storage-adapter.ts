/**
 * Custom storage adapter for Event Log History with BigInt support
 */

import { createJSONStorage } from 'jotai/utils';
import type { EventLogHistoryItem } from '@/lib/types/event-log-types';

/**
 * Fields that are known to contain BigInt values in the event log data structure
 */
const BIGINT_FIELDS = [
  'blockNumber',
  'value',
  'gasUsed',
  'gasPrice',
  'effectiveGasPrice',
  'cumulativeGasUsed',
  'gasLimit',
  'maxFeePerGas',
  'maxPriorityFeePerGas',
  'nonce',
  'blockTimestamp',
  'difficulty',
  'totalDifficulty',
];

/**
 * Custom storage for Event Log History with BigInt serialization support
 */
export const eventLogHistoryStorage = createJSONStorage<EventLogHistoryItem[]>(() => localStorage, {
  reviver: (key, value) => {
    // Only convert known BigInt fields from string to BigInt
    if (BIGINT_FIELDS.includes(key) && typeof value === 'string' && /^\d+$/.test(value)) {
      try {
        return BigInt(value);
      } catch (error) {
        console.warn(`Failed to convert ${key} to BigInt:`, value, error);
        return value;
      }
    }
    return value;
  },
  replacer: (_key, value) => {
    // Convert BigInt to string for JSON serialization
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  },
});
