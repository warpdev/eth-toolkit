/**
 * Shared utilities for handling Ethereum parameter types and values
 */

import { Abi } from "viem";
import { FunctionParameter, ParsedParameter } from "../types";

/**
 * Extract parameter section from function signature
 * 
 * @param signature - Function signature (e.g. "transfer(address to,uint256 amount)")
 * @returns The parameter section of the signature or empty string if none
 */
export function extractParameterSection(signature: string): string {
  try {
    // Get the parameter section from the signature
    return signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
  } catch (error) {
    console.error("Error extracting parameter section:", error);
    return '';
  }
}

/**
 * Parse a single parameter string into name and type
 * 
 * @param param - Parameter string (e.g. "address to" or "uint256")
 * @param index - Index of the parameter for fallback naming
 * @returns Object with parameter name and type
 */
export function parseParameter(param: string, index: number): { name: string; type: string } {
  // Split parameter into type and name parts
  const parts = param.trim().split(' ');
  
  // Extract type and name
  const type = parts[0];
  // Use the name if available, otherwise use the index
  const name = parts.length > 1 ? parts[1] : `param${index}`;
  
  return { name, type };
}

/**
 * Generate parameter definitions from an ABI and function name
 * 
 * @param abi - Contract ABI
 * @param functionName - The name of the function to generate parameters for
 * @returns Array of parameter objects with name, type, and optional components
 */
export function generateParametersFromAbi(
  abi: Abi, 
  functionName: string
): FunctionParameter[] {
  if (!abi || !Array.isArray(abi) || !functionName) return [];
  
  // Find the function in the ABI
  const functionAbi = abi.find(
    (item) => item.type === 'function' && item.name === functionName
  );
  
  if (!functionAbi || !functionAbi.inputs) return [];
  
  // Map the inputs to our parameter interface
  return functionAbi.inputs.map((input: any) => ({
    name: input.name || `param${input.type}`,
    type: input.type,
    components: input.components as FunctionParameter[] | undefined
  }));
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
 * Analyzes parameter type and estimates its encoded length in bytes
 * 
 * @param paramType - Ethereum parameter type (e.g., "uint256", "string")
 * @returns Estimated length in bytes
 */
export function estimateParameterEncodedLength(paramType: string): number {
  // Dynamic types (strings, bytes, arrays) take 32 bytes for offset pointer,
  // plus variable length for the actual data
  if (isDynamicType(paramType)) {
    return 32; // Just the offset
  } 
  
  // Fixed-size types are padded to 32 bytes in Ethereum encoding
  return 32;
}

/**
 * Estimates the total encoded length of parameters based on their types
 * 
 * @param paramTypes - Array of Ethereum parameter types
 * @returns Estimated total length in bytes
 */
export function estimateParametersEncodedLength(paramTypes: string[]): number {
  return paramTypes.reduce((total, type) => {
    return total + estimateParameterEncodedLength(type);
  }, 0);
}

/**
 * Generate a placeholder value based on the parameter type
 */
export function getPlaceholderForType(type: string): string {
  // Handle arrays
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2);
    return `[${getPlaceholderForType(baseType)}, ...]`;
  }
  
  // Handle fixed-size arrays like uint256[3]
  const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
  if (fixedArrayMatch) {
    const [, baseType, size] = fixedArrayMatch;
    const placeholders = Array(Number(size)).fill(getPlaceholderForType(baseType));
    return `[${placeholders.join(', ')}]`;
  }
  
  // Handle common types
  if (type.startsWith('uint') || type.startsWith('int')) {
    return '0';
  }
  
  if (type === 'bool') {
    return 'true or false';
  }
  
  if (type === 'address') {
    return '0x0000000000000000000000000000000000000000';
  }
  
  if (type.startsWith('bytes')) {
    return '0x00';
  }
  
  if (type === 'string') {
    return 'text';
  }
  
  // For complex types or unknowns
  return `<${type}>`;
}

/**
 * Determine if the parameter type needs a specialized input component
 */
export function getInputTypeForParameterType(type: string): string {
  if (type === 'bool') {
    return 'checkbox';
  }
  
  if (type.startsWith('uint') || type.startsWith('int')) {
    return 'number';
  }
  
  if (type === 'string' || type === 'address' || type.startsWith('bytes')) {
    return 'text';
  }
  
  // For arrays and complex types
  return 'text';
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
    } catch {
      throw new Error(`Invalid array format for type ${type}`);
    }
  }

  // Handle basic types
  if (type.startsWith('uint') || type.startsWith('int')) {
    // Convert to BigInt for all integer types
    try {
      return BigInt(value);
    } catch {
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

/**
 * Create parsed parameters from raw values and function parameters
 */
export function createParsedParameters(
  rawValues: unknown[],
  functionInputs: FunctionParameter[]
): ParsedParameter[] {
  return functionInputs.map((input, index) => {
    return {
      name: input.name || `param${index}`,
      type: input.type,
      value: rawValues[index],
    };
  });
}