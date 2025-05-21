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
  const parts = param.trim().split(' ');
  
  const type = parts[0];
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
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2);
    return `[${getPlaceholderForType(baseType)}, ...]`;
  }
  
  const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
  if (fixedArrayMatch) {
    const [, baseType, size] = fixedArrayMatch;
    const placeholders = Array(Number(size)).fill(getPlaceholderForType(baseType));
    return `[${placeholders.join(', ')}]`;
  }
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

/**
 * Extract parameter information from function signature and decoded args
 * 
 * @param signature - Function signature (e.g. "transfer(address to,uint256 amount)")
 * @param decodedData - Decoded function data from viem
 * @returns Array of parsed parameters with types and values
 */
export function extractParametersFromSignature(
  signature: string, 
  decodedData: any
): ParsedParameter[] {
  try {
    // Get the parameter section from the signature
    const paramSection = extractParameterSection(signature);
    
    if (!paramSection || paramSection.length === 0) {
      return []; // No parameters
    }
    
    // Handle empty args
    if (!decodedData.args || decodedData.args.length === 0) {
      return [];
    }
    
    // Split parameter section into individual parameters
    const paramParts = paramSection.split(',');
    
    return paramParts.map((param, index) => {
      // Parse parameter to get name and type
      const { name, type } = parseParameter(param, index);
      
      // Map the decoded value to the parameter
      const value = decodedData.args && index < decodedData.args.length ? decodedData.args[index] : undefined;
      
      return { name, type, value };
    });
  } catch (error) {
    console.error("Error extracting parameters:", error);
    return [];
  }
}