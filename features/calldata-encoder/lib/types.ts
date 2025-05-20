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