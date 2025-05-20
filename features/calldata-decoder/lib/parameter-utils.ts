import { DecodeFunctionDataReturnType } from "viem";
import { ParsedParameter } from "./types";

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
 * Extract parameter information from function signature and decoded args
 * 
 * @param signature - Function signature (e.g. "transfer(address to,uint256 amount)")
 * @param decodedData - Decoded function data from viem
 * @returns Array of parsed parameters with types and values
 */
export function extractParametersFromSignature(
  signature: string, 
  decodedData: DecodeFunctionDataReturnType
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

/**
 * Analyzes parameter type and estimates its encoded length in bytes
 * 
 * @param paramType - Ethereum parameter type (e.g., "uint256", "string")
 * @returns Estimated length in bytes
 */
export function estimateParameterEncodedLength(paramType: string): number {
  // Dynamic types (strings, bytes, arrays) take 32 bytes for offset pointer,
  // plus variable length for the actual data
  if (paramType === 'string' || paramType === 'bytes' || paramType.endsWith('[]')) {
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