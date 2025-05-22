// Export all utilities from the lib folder
export type { EncodedFunction, FunctionParameter, FunctionInfo } from '@/lib/types';
// Encoding utilities from shared utils
export { encodeCalldataWithAbi, createEncodedFunctionResult } from '@/lib/utils';

// Parameter utilities from shared utils
export {
  getPlaceholderForType,
  getInputTypeForParameterType,
  generateParametersFromAbi,
} from '@/lib/utils';

// Input transformation utilities from shared utils
export { transformInputForType, transformInputsForEncoding } from '@/lib/utils/calldata-processing';

// ABI validation from shared utils
export {
  validateAbiString,
  validateFunctionExists,
  validateFunctionInputs,
  extractFunctionsFromAbi,
  getFunctionFromAbi,
  getFunctionBySignature,
} from '@/lib/utils';
