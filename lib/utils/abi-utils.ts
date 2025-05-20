import { Abi } from "viem";

/**
 * Validates if the provided string is a valid ABI JSON
 */
export function validateAbiString(abiString: string): { isValid: boolean; error?: string } {
  if (!abiString || !abiString.trim()) {
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
    
    // Check if there are function definitions
    const hasFunctions = parsed.some(item => item.type === 'function');
    
    if (!hasFunctions) {
      return { isValid: false, error: "ABI does not contain any functions" };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: "Invalid JSON format: " + (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Parses ABI from string, with validation
 * 
 * @param abiString - ABI JSON string
 * @returns Parsed ABI or null if invalid
 */
export function parseAbiFromString(abiString: string): Abi | null {
  try {
    const validation = validateAbiString(abiString);
    if (!validation.isValid) {
      return null;
    }
    
    const parsedAbi = JSON.parse(abiString) as Abi;
    return parsedAbi;
  } catch (error) {
    console.error("Error parsing ABI:", error);
    return null;
  }
}

/**
 * Checks if the provided ABI has the specified function
 */
export function validateFunctionExists(abi: Abi, functionName: string): boolean {
  if (!abi || !Array.isArray(abi) || !functionName) return false;
  
  return abi.some(
    (item) => item.type === 'function' && item.name === functionName
  );
}

/**
 * Validates that all required inputs for a function are provided
 */
export function validateFunctionInputs(
  abi: Abi,
  functionName: string,
  inputs: Record<string, string>
): { valid: boolean; error?: string } {
  if (!abi || !Array.isArray(abi) || !functionName) {
    return { valid: false, error: "Invalid ABI or function name" };
  }
  
  // Find the function in the ABI
  const functionAbi = abi.find(
    (item) => item.type === 'function' && item.name === functionName
  );
  
  if (!functionAbi) {
    return { valid: false, error: `Function ${functionName} not found in ABI` };
  }
  
  // Check required inputs
  for (const input of functionAbi.inputs || []) {
    const paramName = input.name;
    
    // Skip if the parameter has no name (rare but possible)
    if (!paramName) continue;
    
    // Check if the input exists and is not empty
    if (!inputs[paramName] && inputs[paramName] !== '0' && inputs[paramName] !== 'false') {
      return { 
        valid: false, 
        error: `Missing required parameter: ${paramName} (${input.type})` 
      };
    }
  }
  
  return { valid: true };
}