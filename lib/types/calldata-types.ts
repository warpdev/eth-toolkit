/**
 * Shared types for calldata operations across encoder and decoder
 */

/**
 * Interface for function parameter information
 */
export interface FunctionParameter {
  name: string;
  type: string;
  components?: FunctionParameter[];
}

/**
 * Interface for function information extracted from ABI
 */
export interface FunctionInfo {
  name: string;
  signature: string;
  inputs: FunctionParameter[];
}

/**
 * Interface for the decoded function result
 */
export interface DecodedFunction {
  functionName: string;
  functionSig: string;
  args: unknown[];
  error?: string;
}

/**
 * Interface for the encoded function result
 */
export interface EncodedFunction {
  functionName: string;
  functionSig: string;
  args: unknown[];
  encodedData: string;
}

/**
 * Enhanced interface for the decoded function result with possible signatures
 */
export interface DecodedFunctionWithSignatures extends DecodedFunction {
  possibleSignatures?: string[];
  selectedSignatureIndex?: number;
  parsedParameters?: ParsedParameter[];
}

/**
 * Interface for parsed parameter information
 */
export interface ParsedParameter {
  name: string;
  type: string;
  value: unknown;
}

/**
 * Interface for function signature result from 4bytes API
 */
export interface FunctionSignature {
  id: number;
  textSignature: string;
  hexSignature: string;
  createdAt: string;
}

/**
 * Interface for ABI validation result
 */
export interface AbiValidationResult {
  isValid: boolean;
  error?: string;
}
