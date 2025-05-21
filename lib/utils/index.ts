import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Re-export utility functions
export * from "./abi-utils";
export * from "./calldata-utils";
export * from "./error-utils";
export * from "./signature-utils";

// Export from parameter-utils except those duplicated in calldata-processing
export {
  getPlaceholderForType,
  getInputTypeForParameterType,
  generateParametersFromAbi,
  extractParameterSection,
  parseParameter,
  estimateParameterEncodedLength,
  estimateParametersEncodedLength,
  extractParametersFromSignature
} from "./parameter-utils";

// Export from calldata-processing, including the duplicated functions
export * from "./calldata-processing";

/**
 * Utility for combining Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copying is done
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}