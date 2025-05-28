/**
 * Shared parameter formatting utilities
 */

import { formatEther } from 'viem';
import { VALIDATION, DISPLAY_CONFIG } from '@/features/event-log-decoder/lib/constants';

/**
 * BigInt replacer for JSON.stringify
 */
export const bigIntReplacer = (_key: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

/**
 * Format hex strings (addresses, hashes, etc.) with truncation
 */
export function formatHexString(value: string): string {
  if (!value.startsWith('0x')) return value;

  if (value.length === VALIDATION.ADDRESS_LENGTH) {
    // Address formatting
    return `${value.slice(0, DISPLAY_CONFIG.TRUNCATE_PREFIX_LENGTH)}...${value.slice(-DISPLAY_CONFIG.TRUNCATE_SUFFIX_LENGTH)}`;
  } else if (value.length > VALIDATION.MIN_HEX_LENGTH) {
    // Other hex strings
    return `${value.slice(0, DISPLAY_CONFIG.TRUNCATE_PREFIX_LENGTH)}...${value.slice(-DISPLAY_CONFIG.TRUNCATE_SUFFIX_LENGTH)}`;
  }

  return value;
}

/**
 * Check if a value is likely an ETH amount in Wei
 */
export function isLikelyWeiValue(value: unknown, type?: string): boolean {
  // Skip array types
  if (type && type.includes('[]')) {
    return false;
  }

  // Check parameter type hints
  if (type && (type.includes('uint256') || type.includes('uint128'))) {
    return true;
  }

  // Check if it's a bigint with significant size (at least 1e15 wei = 0.001 ETH)
  if (typeof value === 'bigint' && value >= 1000000000000000n) {
    return true;
  }

  // Check if it's a string representation of a large number
  if (typeof value === 'string' && /^\d+$/.test(value) && value.length >= 15) {
    return true;
  }

  return false;
}

/**
 * Format any value for display, handling special cases
 */
export function formatValue(value: unknown, type?: string): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Handle hex strings
  if (typeof value === 'string' && value.startsWith('0x')) {
    return formatHexString(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return `[${value.map((v) => formatValue(v, type)).join(', ')}]`;
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, bigIntReplacer, 2);
    } catch {
      return String(value);
    }
  }

  // Default string representation
  return String(value);
}

/**
 * Format Wei value with ETH conversion
 */
export function formatWeiValue(value: bigint | string): { wei: string; eth: string } {
  try {
    const wei = typeof value === 'string' ? BigInt(value) : value;
    const eth = formatEther(wei);
    return { wei: wei.toString(), eth };
  } catch {
    // Fallback if conversion fails
    return {
      wei: typeof value === 'bigint' ? value.toString() : String(value),
      eth: 'N/A',
    };
  }
}

/**
 * Get string representation of an argument for copying
 */
export function getArgAsString(arg: unknown): string {
  if (arg === null || arg === undefined) {
    return 'null';
  }

  // Specifically handle arrays and objects with BigInt support
  if (Array.isArray(arg) || (typeof arg === 'object' && arg !== null)) {
    try {
      return JSON.stringify(arg, bigIntReplacer, 2);
    } catch {
      return String(arg);
    }
  }

  return String(arg);
}

/**
 * Serialize data with BigInt support
 */
export function serializeWithBigInt<T>(data: T): string {
  return JSON.stringify(data, bigIntReplacer, 2);
}

/**
 * Create a serializable version of data by converting BigInts to strings
 */
export function makeSerializable<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return data.toString() as T;
  }

  if (Array.isArray(data)) {
    return data.map(makeSerializable) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = makeSerializable(value);
    }
    return result as T;
  }

  return data;
}
