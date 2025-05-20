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
  const withPrefix = cleanCalldata.startsWith("0x") 
    ? cleanCalldata 
    : `0x${cleanCalldata}`;
    
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
  return normalized.length > 10 ? normalized.slice(10) : "";
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

  // Clean input
  const cleanCalldata = calldata.trim();

  // Check if it starts with 0x
  const hasPrefix = cleanCalldata.startsWith("0x");
  const calldataWithoutPrefix = hasPrefix ? cleanCalldata.slice(2) : cleanCalldata;

  // Check if it's valid hex
  const isHex = /^[0-9a-fA-F]*$/.test(calldataWithoutPrefix);
  
  // Check if it has at least 4 bytes for the function selector (8 chars)
  const hasMinLength = calldataWithoutPrefix.length >= 8;

  // Check if it has the correct length (should be even length for bytes)
  const hasEvenLength = calldataWithoutPrefix.length % 2 === 0;

  return isHex && hasMinLength && hasEvenLength;
}