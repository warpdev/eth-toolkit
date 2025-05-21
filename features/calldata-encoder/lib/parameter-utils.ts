/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/lib/utils/parameter-utils.ts instead.
 */

import { Abi } from "viem";
import { FunctionParameter } from "./types";
import { 
  getPlaceholderForType as getPlaceholderFromShared,
  getInputTypeForParameterType as getInputTypeFromShared,
  generateParametersFromAbi
} from "@/lib/utils/parameter-utils";

/**
 * Generate input fields description based on function signature
 * @deprecated Use generateParametersFromAbi from @/lib/utils/parameter-utils.ts instead
 */
export function generateInputFieldsFromAbi(abi: Abi, functionName: string): FunctionParameter[] {
  return generateParametersFromAbi(abi, functionName);
}

/**
 * Generate a placeholder value based on the parameter type
 * @deprecated Use getPlaceholderForType from @/lib/utils/parameter-utils.ts instead
 */
export function getPlaceholderForType(type: string): string {
  return getPlaceholderFromShared(type);
}

/**
 * Determine if the parameter type needs a specialized input component
 * @deprecated Use getInputTypeForParameterType from @/lib/utils/parameter-utils.ts instead
 */
export function getInputTypeForParameterType(type: string): string {
  return getInputTypeFromShared(type);
}