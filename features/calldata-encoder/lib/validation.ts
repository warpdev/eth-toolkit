/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/lib/utils/abi-utils.ts instead.
 */

import { 
  validateAbiString,
  validateFunctionExists,
  validateFunctionInputs
} from "@/lib/utils/abi-utils";

/**
 * Validates if the provided string is a valid ABI JSON
 * @deprecated Use validateAbiString from @/lib/utils/abi-utils.ts instead
 */
export function validateAbi(abiString: string) {
  const result = validateAbiString(abiString);
  return { valid: result.isValid, error: result.error };
}

// Re-export other validation functions
export { validateFunctionExists, validateFunctionInputs };