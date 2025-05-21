/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/lib/utils/calldata-processing.ts instead.
 */

import { DecodedFunctionWithSignatures } from "@/lib/types";
import { decodeCalldataWithAbi } from "@/lib/utils/calldata-processing";
import {
  normalizeCalldata,
  extractFunctionSelector,
  extractCalldataParameters
} from "@/lib/utils";
import { fetchFunctionSignatures, findBestSignatureMatch, createTemporaryAbiFromSignature } from "./signature-utils";

// Re-export the common decoding function
export { decodeCalldataWithAbi };

/**
 * Decode calldata using the 4bytes API for function signature lookup
 * 
 * @param calldata - The calldata hex string to decode
 * @returns The decoded function data or an error
 */
export async function decodeCalldataWithSignatureLookup(
  calldata: string
): Promise<DecodedFunctionWithSignatures> {
  try {
    // Extract function selector and normalize calldata
    const functionSelector = extractFunctionSelector(calldata);
    const fullCalldata = normalizeCalldata(calldata);
      
    // Lookup the function signatures
    const signatures = await fetchFunctionSignatures(functionSelector);
    
    if (signatures.length === 0) {
      return {
        functionName: "Unknown Function",
        functionSig: functionSelector,
        args: [],
        error: "Function signature not found in 4bytes database",
      };
    }
    
    // Find the best matching signature
    const { bestSignature, index } = await findBestSignatureMatch(
      signatures, 
      functionSelector,
      calldata
    );
    
    // Extract function name from the best signature
    const functionName = bestSignature.split("(")[0];
    
    // Create a temporary ABI from the best signature to decode parameters
    const tempAbi = createTemporaryAbiFromSignature(bestSignature);
    
    let args: unknown[] = [];
    let parsedParameters = [];
    
    try {
      // Try to decode the calldata using the temporary ABI
      const decodedData = await decodeCalldataWithAbi(calldata, tempAbi);
      
      // Use the decoded args
      args = decodedData.args || [];
      
      // Further parameter processing can be done here if needed
    } catch (decodeError) {
      console.warn("Error decoding parameters:", decodeError);
      // Fallback to showing raw parameters if decoding fails
      const rawParams = extractCalldataParameters(calldata);
      args = [rawParams];
    }
    
    // Return the result with possible signatures
    return {
      functionName,
      functionSig: bestSignature,
      args,
      possibleSignatures: signatures.map(sig => sig.textSignature),
      selectedSignatureIndex: index
    };
  } catch (error) {
    console.error("Error decoding with signature lookup:", error);
    return {
      functionName: "Unknown Function",
      functionSig: extractFunctionSelector(calldata),
      args: [],
      error: error instanceof Error ? error.message : "Unknown error decoding calldata",
    };
  }
}