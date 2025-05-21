/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/lib/utils/abi-utils.ts and @/lib/utils/calldata-utils.ts instead.
 */

import { 
  validateAbiString
} from "@/lib/utils/abi-utils";

import {
  normalizeCalldata,
  extractFunctionSelector,
  isValidCalldata
} from "@/lib/utils/calldata-utils";

/**
 * Validates if a string is a valid ethereum calldata
 * @deprecated Use isValidCalldata from @/lib/utils/calldata-utils.ts instead
 */
export { isValidCalldata };

/**
 * Validates if a string is a valid Ethereum ABI
 * @deprecated Use validateAbiString from @/lib/utils/abi-utils.ts instead
 */
export function validateAbi(abiString: string) {
  const result = validateAbiString(abiString);
  return { isValid: result.isValid, error: result.error };
}

/**
 * Normalizes calldata to ensure it has 0x prefix and is all lowercase
 * @deprecated Use normalizeCalldata from @/lib/utils/calldata-utils.ts instead
 */
export { normalizeCalldata };

/**
 * Extracts function selector from calldata
 * @deprecated Use extractFunctionSelector from @/lib/utils/calldata-utils.ts instead
 */
export { extractFunctionSelector };