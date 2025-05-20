'use client';

import { Abi, encodeFunctionData, parseAbi } from 'viem';
import { EncodedFunction, FunctionInfo, FunctionParameter } from './types';

/**
 * Check if the parsed JSON is a valid Abi
 */
function isValidAbi(obj: unknown): obj is Abi {
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj)) {
    return false;
  }

  // Basic validation - check each entry has at least type property
  return obj.every(
    (item) => item && typeof item === 'object' && 'type' in item && typeof item.type === 'string'
  );
}

/**
 * Parse ABI from string with type validation
 */
export function parseAbiFromString(abiString: string): Abi | null {
  if (!abiString) return null;

  try {
    // First, check if the string is a valid JSON
    const parsed = JSON.parse(abiString);

    // Validate the parsed object is a proper ABI structure
    if (isValidAbi(parsed)) {
      return parsed;
    } else {
      console.error('Invalid ABI structure');
      return null;
    }
  } catch (error) {
    console.error('Error parsing ABI string:', error);
    return null;
  }
}

/**
 * Encode calldata using a provided ABI and inputs
 */
export async function encodeCalldataWithAbi(
  abi: Abi,
  functionName: string,
  args: unknown[]
): Promise<string | { error: string }> {
  try {
    const data = encodeFunctionData({
      abi,
      functionName,
      args,
    });

    return data;
  } catch (error) {
    console.error('Error encoding calldata:', error);
    return {
      error: error instanceof Error ? error.message : "Unknown error encoding calldata"
    };
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
    typeof (input as any).type === 'string'
  );
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
        ? input.components.filter(isValidFunctionInput)
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
 * Validate and transform inputs based on the parameter type
 */
export function transformInputForType(value: string, type: string): unknown {
  // Handle arrays
  if (type.endsWith('[]')) {
    try {
      const arrayValues = JSON.parse(value);
      if (Array.isArray(arrayValues)) {
        const baseType = type.slice(0, -2);
        return arrayValues.map((val) => transformInputForType(String(val), baseType));
      }
    } catch (e) {
      throw new Error(`Invalid array format for type ${type}`);
    }
  }

  // Handle basic types
  if (type.startsWith('uint') || type.startsWith('int')) {
    // Convert to BigInt for all integer types
    try {
      return BigInt(value);
    } catch (e) {
      throw new Error(`Invalid integer value for type ${type}`);
    }
  }

  if (type === 'bool') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1';
  }

  if (type === 'address') {
    // Simple validation for Ethereum address
    if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
      throw new Error('Invalid Ethereum address format');
    }
    return value;
  }

  if (type.startsWith('bytes')) {
    // For fixed-length bytes
    if (type !== 'bytes' && !/^0x[0-9a-fA-F]*$/.test(value)) {
      throw new Error(`Invalid hex format for type ${type}`);
    }
    return value;
  }

  // Default for other types (string, etc.)
  return value;
}

/**
 * Transform a record of inputs to the correct types based on function parameters
 */
export function transformInputsForEncoding(
  inputsRecord: Record<string, string>,
  functionInputs: FunctionParameter[]
): unknown[] {
  return functionInputs.map((param) => {
    const inputValue = inputsRecord[param.name] || '';
    return transformInputForType(inputValue, param.type);
  });
}
