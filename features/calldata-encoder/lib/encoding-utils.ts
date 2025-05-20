"use client";

import { Abi, encodeFunctionData, parseAbi } from "viem";
import { EncodedFunction, FunctionInfo, FunctionParameter } from "./types";

/**
 * Parse ABI from string
 */
export function parseAbiFromString(abiString: string): Abi | null {
  if (!abiString) return null;
  
  try {
    // First, check if the string is a valid JSON
    const parsed = JSON.parse(abiString);
    return parsed as Abi;
  } catch (error) {
    console.error("Error parsing ABI string:", error);
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
): Promise<string> {
  try {
    const data = encodeFunctionData({
      abi,
      functionName,
      args
    });
    
    return data;
  } catch (error) {
    console.error("Error encoding calldata:", error);
    throw error;
  }
}

/**
 * Extract all functions from an ABI
 */
export function extractFunctionsFromAbi(abi: Abi): FunctionInfo[] {
  if (!abi || !Array.isArray(abi)) return [];

  return abi
    .filter((item) => item.type === 'function')
    .map((func) => {
      const inputs = func.inputs || [];
      const signature = `${func.name}(${inputs.map(input => input.type).join(',')})`;
      
      return {
        name: func.name,
        signature,
        inputs: inputs.map(input => ({
          name: input.name,
          type: input.type,
          components: input.components
        }))
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
        return arrayValues.map(val => transformInputForType(String(val), baseType));
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
  return functionInputs.map(param => {
    const inputValue = inputsRecord[param.name] || '';
    return transformInputForType(inputValue, param.type);
  });
}