import { 
  isValidCalldata as commonIsValidCalldata, 
  normalizeCalldata as commonNormalizeCalldata,
  extractFunctionSelector as commonExtractFunctionSelector
} from './calldata-common';

/**
 * Validates if a string is a valid ethereum calldata
 * @param calldata String to validate
 * @returns Boolean indicating if the string is valid calldata
 */
export function isValidCalldata(calldata: string): boolean {
  return commonIsValidCalldata(calldata);
}

/**
 * Validates if a string is a valid Ethereum ABI
 * @param abiString String to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateAbi(abiString: string): { isValid: boolean; error?: string } {
  if (!abiString) {
    return { isValid: false, error: "ABI is empty" };
  }

  try {
    const parsed = JSON.parse(abiString);
    
    // Check if it's an array
    if (!Array.isArray(parsed)) {
      return { isValid: false, error: "ABI must be an array" };
    }
    
    // Check if it has at least one item
    if (parsed.length === 0) {
      return { isValid: false, error: "ABI array is empty" };
    }
    
    // Check if each item has required properties for function definitions
    // This is a simple check, not exhaustive
    for (const item of parsed) {
      if (item.type === "function" || !item.type) {
        if (!item.name && item.type !== "fallback" && item.type !== "receive") {
          return { isValid: false, error: "Function items must have a name property" };
        }
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON" 
    };
  }
}

/**
 * Normalizes calldata to ensure it has 0x prefix and is all lowercase
 * @param calldata Raw calldata string
 * @returns Normalized calldata string
 */
export function normalizeCalldata(calldata: string): string {
  return commonNormalizeCalldata(calldata);
}


/**
 * Extracts function selector from calldata
 * @param calldata Calldata string
 * @returns Function selector (first 4 bytes with 0x prefix)
 */
export function extractFunctionSelector(calldata: string): string {
  return commonExtractFunctionSelector(calldata);
}