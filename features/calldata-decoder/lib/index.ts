/**
 * Re-export all decoder utilities for easier imports
 */

// Types (imported from shared types)
export type {
  DecodedFunction,
  DecodedFunctionWithSignatures,
  ParsedParameter,
  FunctionSignature
} from "@/lib/types";

// Decoding utilities
export * from "./decoding-utils";

// Signature utilities
export * from "./signature-utils";

// Parameter utilities (imported from shared utils)
export {
  extractParameterSection,
  parseParameter,
  estimateParameterEncodedLength,
  estimateParametersEncodedLength,
  extractParametersFromSignature
} from "@/lib/utils";

// If any other files need migration in the future, this makes it easier
// They can simply import from "@/lib/decoder" instead of specific files