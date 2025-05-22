import { Abi } from 'viem';
import { FunctionInfo, AbiValidationResult } from '../types/calldata-types';

/**
 * Type guard for ABI function items
 */
function isAbiFunction(
  item: Abi[number]
): item is Extract<Abi[number], { type: 'function'; name: string; inputs: readonly unknown[] }> {
  return item.type === 'function' && typeof item.name === 'string' && Array.isArray(item.inputs);
}

/**
 * Type guard for ABI function inputs
 */
function isValidFunctionInput(
  input: unknown
): input is { name: string; type: string; components?: unknown[] } {
  return (
    typeof input === 'object' &&
    input !== null &&
    'name' in input &&
    'type' in input &&
    typeof (input as Record<string, unknown>).type === 'string'
  );
}

/**
 * Validates if the provided string is a valid ABI JSON
 *
 * @param abiString - ABI JSON string to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateAbiString(abiString: string): AbiValidationResult {
  if (!abiString || !abiString.trim()) {
    return { isValid: false, error: 'ABI is empty' };
  }

  try {
    const parsed = JSON.parse(abiString);

    // Check if it's an array
    if (!Array.isArray(parsed)) {
      return { isValid: false, error: 'ABI must be an array' };
    }

    // Check if it has at least one item
    if (parsed.length === 0) {
      return { isValid: false, error: 'ABI array is empty' };
    }

    // Check if there are function definitions
    const hasFunctions = parsed.some((item) => item.type === 'function');

    if (!hasFunctions) {
      return { isValid: false, error: 'ABI does not contain any functions' };
    }

    // Check if function items have required properties
    for (const item of parsed) {
      if (item.type === 'function' || !item.type) {
        if (!item.name && item.type !== 'fallback' && item.type !== 'receive') {
          return { isValid: false, error: 'Function items must have a name property' };
        }
      }
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid JSON format: ' + (error instanceof Error ? error.message : String(error)),
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
    console.error('Error parsing ABI:', error);
    return null;
  }
}

/**
 * Checks if the provided ABI has the specified function
 */
export function validateFunctionExists(abi: Abi, functionName: string): boolean {
  if (!abi || !Array.isArray(abi) || !functionName) return false;

  return abi.some((item) => item.type === 'function' && item.name === functionName);
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
    return { valid: false, error: 'Invalid ABI or function name' };
  }

  // Find the function in the ABI
  const functionAbi = abi.find((item) => item.type === 'function' && item.name === functionName);

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
        error: `Missing required parameter: ${paramName} (${input.type})`,
      };
    }
  }

  return { valid: true };
}

/**
 * Extract all functions from an ABI with proper type checking
 */
export function extractFunctionsFromAbi(abi: Abi): FunctionInfo[] {
  if (!abi || !Array.isArray(abi)) return [];

  return abi.filter(isAbiFunction).map((func) => {
    const inputs = func.inputs || [];

    // Safely map the inputs with validated types
    const validatedInputs = inputs.filter(isValidFunctionInput).map((input) => ({
      name: input.name,
      type: input.type,
      components: Array.isArray(input.components)
        ? input.components.filter(isValidFunctionInput).map((comp) => ({
            name: comp.name,
            type: comp.type,
            components: Array.isArray(comp.components)
              ? comp.components.filter(isValidFunctionInput).map((subComp) => ({
                  name: subComp.name,
                  type: subComp.type,
                }))
              : undefined,
          }))
        : undefined,
    }));

    const signature = `${func.name}(${validatedInputs.map((input) => input.type).join(',')})`;

    return {
      name: func.name,
      signature,
      inputs: validatedInputs,
    };
  });
}

/**
 * Get function details from ABI by name
 */
export function getFunctionFromAbi(abi: Abi, functionName: string): FunctionInfo | null {
  if (!abi || !Array.isArray(abi) || !functionName) return null;

  // Extract all functions
  const functions = extractFunctionsFromAbi(abi);

  // Find the specific function
  return functions.find((func) => func.name === functionName) || null;
}

/**
 * Get function details from ABI by signature
 */
export function getFunctionBySignature(abi: Abi, signature: string): FunctionInfo | null {
  if (!abi || !Array.isArray(abi) || !signature) return null;

  // Extract all functions
  const functions = extractFunctionsFromAbi(abi);

  // Find the specific function by signature
  return functions.find((func) => func.signature === signature) || null;
}
