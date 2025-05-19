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
 * Interface for function signature result
 */
export interface FunctionSignature {
  id: number;
  textSignature: string;
  hexSignature: string;
  createdAt: string;
}