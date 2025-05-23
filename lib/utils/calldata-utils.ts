/**
 * Shared utility functions for calldata processing across encoder and decoder
 */

/**
 * Normalizes calldata to ensure it has 0x prefix and is all lowercase
 *
 * @param calldata Raw calldata string
 * @returns Normalized calldata string
 */
export function normalizeCalldata(calldata: string): string {
  const cleanCalldata = calldata.trim();
  const withPrefix = cleanCalldata.startsWith('0x') ? cleanCalldata : `0x${cleanCalldata}`;

  return withPrefix.toLowerCase();
}

/**
 * Extracts function selector from calldata
 *
 * @param calldata Calldata string
 * @returns Function selector (first 4 bytes with 0x prefix)
 */
export function extractFunctionSelector(calldata: string): string {
  const normalized = normalizeCalldata(calldata);
  return normalized.slice(0, 10);
}

/**
 * Extracts calldata without the function selector
 *
 * @param calldata Full calldata string
 * @returns Calldata without the function selector
 */
export function extractCalldataParameters(calldata: string): string {
  const normalized = normalizeCalldata(calldata);
  return normalized.length > 10 ? normalized.slice(10) : '';
}

/**
 * Checks if a string is valid calldata
 *
 * @param calldata String to validate
 * @returns Boolean indicating if the string is valid calldata
 */
export function isValidCalldata(calldata: string): boolean {
  if (!calldata) {
    return false;
  }

  const cleanCalldata = calldata.trim();
  const hasPrefix = cleanCalldata.startsWith('0x');
  const calldataWithoutPrefix = hasPrefix ? cleanCalldata.slice(2) : cleanCalldata;

  const isHex = /^[0-9a-fA-F]*$/.test(calldataWithoutPrefix);
  const hasMinLength = calldataWithoutPrefix.length >= 8;
  const hasEvenLength = calldataWithoutPrefix.length % 2 === 0;

  return isHex && hasMinLength && hasEvenLength;
}

/**
 * Determines if a type is a dynamic Ethereum type
 *
 * @param type Ethereum type string (e.g., 'string', 'bytes', 'uint256[]')
 * @returns True if the type is dynamic
 */
export function isDynamicType(type: string): boolean {
  // Basic dynamic types
  if (type === 'string' || type === 'bytes') return true;

  // Arrays with dynamic length
  if (type.endsWith('[]')) return true;

  // Fixed length arrays are not dynamic themselves
  if (type.match(/\[\d+\]$/)) return false;

  return false;
}

