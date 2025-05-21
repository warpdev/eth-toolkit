/**
 * Shared utilities for processing Ethereum calldata (encoding and decoding)
 */

import { Abi, encodeFunctionData, decodeFunctionData } from 'viem';
import { 
  EncodedFunction, 
  DecodedFunction,
  DecodedFunctionWithSignatures,
  FunctionInfo, 
  FunctionParameter,
  ParsedParameter
} from '@/lib/types';
import { 
  normalizeCalldata,
  extractFunctionSelector,
  extractCalldataParameters
} from './calldata-utils';
import { parseAbiFromString } from './abi-utils';

/**
 * Encode calldata using a provided ABI and inputs
 * 
 * @param abi - Contract ABI
 * @param functionName - Name of the function to encode
 * @param args - Function arguments
 * @returns Encoded calldata or error object
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
 * Decode calldata using a provided ABI
 * 
 * @param calldata - The calldata hex string to decode
 * @param abi - The contract ABI to use for decoding
 * @returns The decoded function data or an error
 */
export async function decodeCalldataWithAbi(
  calldata: string, 
  abi: Abi
): Promise<DecodedFunction> {
  try {
    // Extract function selector and normalize calldata
    const functionSelector = extractFunctionSelector(calldata);
    const fullCalldata = normalizeCalldata(calldata);

    // Attempt to decode using viem
    const decoded = decodeFunctionData({
      abi,
      data: fullCalldata as `0x${string}`,
    });

    // Create the result object
    const result: DecodedFunction = {
      functionName: decoded.functionName,
      functionSig: functionSelector,
      args: decoded.args ? [...decoded.args] : [],
    };

    return result;
  } catch (error) {
    console.error("Error decoding calldata:", error);
    return {
      functionName: "Unknown Function",
      functionSig: extractFunctionSelector(calldata),
      args: [],
      error: error instanceof Error ? error.message : "Unknown error decoding calldata",
    };
  }
}

/**
 * Validate and transform inputs based on the parameter type
 * 
 * @param value - String value to transform
 * @param type - Ethereum parameter type
 * @returns Transformed value for the given type
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
 * 
 * @param inputsRecord - Record of input values by parameter name
 * @param functionInputs - Array of function parameter definitions
 * @returns Array of transformed inputs
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
 * Creates a full EncodedFunction result from successful encoding
 * 
 * @param functionName - Name of the encoded function
 * @param signature - Function signature
 * @param args - Function arguments that were encoded
 * @param encodedData - Resulting encoded calldata
 * @returns EncodedFunction object with all details
 */
export function createEncodedFunctionResult(
  functionName: string,
  signature: string,
  args: unknown[],
  encodedData: string
): EncodedFunction {
  return {
    functionName,
    functionSig: signature,
    args,
    encodedData
  };
}