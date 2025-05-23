import { Abi } from 'viem';
import { FunctionInfo, AbiValidationResult } from '../types/calldata-types';
import { saveABI, loadABI } from '../storage/abi-storage';
import { toast } from 'sonner';

/**
 * Safely parse ABI from string with error handling
 *
 * @param abiString - ABI JSON string
 * @returns Object with parsed ABI, success status, and optional error message
 */
export function safeParseAbi(abiString: string): {
  abi: Abi | null;
  success: boolean;
  error?: string;
} {
  try {
    const validation = validateAbiString(abiString);
    if (!validation.isValid) {
      return { abi: null, success: false, error: validation.error };
    }

    const parsedAbi = JSON.parse(abiString) as Abi;
    return { abi: parsedAbi, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON format';
    return { abi: null, success: false, error: message };
  }
}

/**
 * Save ABI with validation and error handling
 *
 * @param name - Name for the ABI
 * @param abiString - ABI JSON string
 * @returns Promise resolving to success status and optional ID or error
 */
export async function saveAbiWithValidation(
  name: string,
  abiString: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate ABI format first
    const parseResult = safeParseAbi(abiString);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error };
    }

    // Save to storage
    const id = await saveABI(name, abiString);
    return { success: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save ABI';
    return { success: false, error: message };
  }
}

/**
 * Load ABI with error handling
 *
 * @param id - ABI ID
 * @returns Promise resolving to loaded ABI data or error
 */
export async function loadAbiWithValidation(
  id: string
): Promise<{ success: boolean; abi?: string; name?: string; error?: string }> {
  try {
    const abiRecord = await loadABI(id);
    if (!abiRecord) {
      return { success: false, error: 'ABI not found' };
    }

    // Validate loaded ABI
    const parseResult = safeParseAbi(abiRecord.abi);
    if (!parseResult.success) {
      return { success: false, error: 'Loaded ABI is invalid' };
    }

    return { success: true, abi: abiRecord.abi, name: abiRecord.name };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load ABI';
    return { success: false, error: message };
  }
}

/**
 * Show appropriate toast message for ABI operations
 *
 * @param operation - Operation type (parse, save, load)
 * @param success - Whether operation was successful
 * @param details - Additional details for the toast message
 */
export function showAbiOperationToast(
  operation: 'parse' | 'save' | 'load',
  success: boolean,
  details?: { name?: string; error?: string }
): void {
  const messages = {
    parse: {
      success: 'ABI parsed successfully',
      error: 'Failed to parse ABI',
    },
    save: {
      success: details?.name ? `ABI saved as "${details.name}"` : 'ABI saved successfully',
      error: 'Failed to save ABI',
    },
    load: {
      success: details?.name ? `Loaded ABI: ${details.name}` : 'ABI loaded successfully',
      error: 'Failed to load ABI',
    },
  };

  const message = messages[operation][success ? 'success' : 'error'];
  const description = !success && details?.error ? details.error : undefined;

  if (success) {
    toast.success(message, { duration: 3000 });
  } else {
    toast.error(message, { description, duration: 5000 });
  }
}

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
