/**
 * Shared utility functions for calldata processing across encoder and decoder
 */

/**
 * Normalizes calldata to ensure it has 0x prefix and is all lowercase
 * 
 * @param calldata Raw calldata string
 * @returns Normalized calldata string
 */
export function normalizeCalldata(calldata: string): string {
  const cleanCalldata = calldata.trim();
  const withPrefix = cleanCalldata.startsWith("0x") 
    ? cleanCalldata 
    : `0x${cleanCalldata}`;
    
  return withPrefix.toLowerCase();
}

/**
 * Extracts function selector from calldata
 * 
 * @param calldata Calldata string
 * @returns Function selector (first 4 bytes with 0x prefix)
 */
export function extractFunctionSelector(calldata: string): string {
  const normalized = normalizeCalldata(calldata);
  return normalized.slice(0, 10);
}

/**
 * Extracts calldata without the function selector
 * 
 * @param calldata Full calldata string
 * @returns Calldata without the function selector
 */
export function extractCalldataParameters(calldata: string): string {
  const normalized = normalizeCalldata(calldata);
  return normalized.length > 10 ? normalized.slice(10) : "";
}

/**
 * Checks if a string is valid calldata
 * 
 * @param calldata String to validate
 * @returns Boolean indicating if the string is valid calldata
 */
export function isValidCalldata(calldata: string): boolean {
  if (!calldata) {
    return false;
  }

  // Clean input
  const cleanCalldata = calldata.trim();

  // Check if it starts with 0x
  const hasPrefix = cleanCalldata.startsWith("0x");
  const calldataWithoutPrefix = hasPrefix ? cleanCalldata.slice(2) : cleanCalldata;

  // Check if it's valid hex
  const isHex = /^[0-9a-fA-F]*$/.test(calldataWithoutPrefix);
  
  // Check if it has at least 4 bytes for the function selector (8 chars)
  const hasMinLength = calldataWithoutPrefix.length >= 8;

  // Check if it has the correct length (should be even length for bytes)
  const hasEvenLength = calldataWithoutPrefix.length % 2 === 0;

  return isHex && hasMinLength && hasEvenLength;
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