import { Abi } from "viem";
import { FunctionParameter } from "./types";

/**
 * Generate input fields description based on function signature
 */
export function generateInputFieldsFromAbi(abi: Abi, functionName: string): FunctionParameter[] {
  if (!abi || !Array.isArray(abi) || !functionName) return [];
  
  // Find the function in the ABI
  const functionAbi = abi.find(
    (item) => item.type === 'function' && item.name === functionName
  );
  
  if (!functionAbi || !functionAbi.inputs) return [];
  
  // Map the inputs to our FunctionParameter interface
  return functionAbi.inputs.map((input: any) => ({
    name: input.name || `param${input.type}`,
    type: input.type,
    components: input.components
  }));
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