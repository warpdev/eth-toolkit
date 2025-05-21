import { Abi, decodeFunctionData } from "viem";
import { 
  DecodedFunction, 
  DecodedFunctionWithSignatures, 
  ParsedParameter
} from "@/lib/types";
import {
  normalizeCalldata,
  extractFunctionSelector,
  extractCalldataParameters,
  extractParametersFromSignature
} from "@/lib/utils";
import { fetchFunctionSignatures, findBestSignatureMatch, createTemporaryAbiFromSignature } from "./signature-utils";

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
): Promise<DecodedFunctionWithSignatures> {
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
    const result: DecodedFunctionWithSignatures = {
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
    let parsedParameters: ParsedParameter[] = [];
    
    try {
      // Try to decode the calldata using the temporary ABI
      const decodedData = decodeFunctionData({
        abi: tempAbi,
        data: fullCalldata as `0x${string}`,
      });
      
      // Use the decoded args
      args = decodedData.args ? [...decodedData.args] : [];
      
      // Extract parameter information
      parsedParameters = extractParametersFromSignature(bestSignature, decodedData);
    } catch (decodeError) {
      console.warn("Error decoding parameters:", decodeError);
      // Fallback to showing raw parameters if decoding fails
      const rawParams = extractCalldataParameters(calldata);
      args = [rawParams];
    }
    
    // Return the result with possible signatures and parsed parameters
    return {
      functionName,
      functionSig: bestSignature,
      args,
      possibleSignatures: signatures.map(sig => sig.textSignature),
      selectedSignatureIndex: index,
      parsedParameters
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