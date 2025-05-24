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

/**
 * Parse raw parameter values from calldata based on expected parameter types
 *
 * @param calldata Full calldata string
 * @param paramTypes Array of parameter types
 * @returns Array of parsed parameter values
 */
export function parseRawParametersFromCalldata(calldata: string, paramTypes: string[]): unknown[] {
  try {
    const parametersHex = extractCalldataParameters(calldata);
    if (!parametersHex || paramTypes.length === 0) {
      return [];
    }

    const results: unknown[] = [];
    let offset = 0;

    for (const paramType of paramTypes) {
      if (offset + 64 > parametersHex.length) {
        // Not enough data for this parameter, return hex value
        results.push(`0x${parametersHex.slice(offset)}`);
        break;
      }

      const paramHex = parametersHex.slice(offset, offset + 64);
      const paramValue = parseParameterFromHex(paramHex, paramType);
      results.push(paramValue);
      
      offset += 64; // Each parameter is 32 bytes (64 hex chars)
    }

    return results;
  } catch (error) {
    console.error('Error parsing raw parameters:', error);
    return [];
  }
}

/**
 * Parse a single parameter from hex string based on its type
 *
 * @param hex 64-character hex string (32 bytes)
 * @param type Parameter type (e.g., 'address', 'uint256')
 * @returns Parsed value
 */
function parseParameterFromHex(hex: string, type: string): unknown {
  try {
    if (type === 'address') {
      // Address is stored in the last 20 bytes (40 hex chars)
      return `0x${hex.slice(-40)}`;
    }

    if (type.startsWith('uint') || type.startsWith('int')) {
      // Convert hex to BigInt for integer types
      return BigInt(`0x${hex}`);
    }

    if (type === 'bool') {
      // Boolean is true if last byte is non-zero
      return BigInt(`0x${hex}`) !== 0n;
    }

    if (type.startsWith('bytes')) {
      // For bytes types, return the hex value
      return `0x${hex}`;
    }

    // For unknown types, return the raw hex
    return `0x${hex}`;
  } catch {
    // If parsing fails, return the raw hex
    return `0x${hex}`;
  }
}
