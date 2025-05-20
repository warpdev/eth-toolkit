import { Abi, decodeFunctionData } from "viem";
import { DecodedFunction, DecodedFunctionWithSignatures } from "./types";
import { fetchFunctionSignatures, findBestSignatureMatch, createTemporaryAbiFromSignature } from "./signature-utils";
import { extractParametersFromSignature } from "./parameter-utils";

/**
 * Parse ABI from string
 * 
 * @param abiString - ABI JSON string
 * @returns Parsed ABI or null if invalid
 */
export function parseAbiFromString(abiString: string): Abi | null {
  try {
    const parsedAbi = JSON.parse(abiString) as Abi;
    return parsedAbi;
  } catch (error) {
    console.error("Error parsing ABI:", error);
    return null;
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
    // Extract just the function selector if full calldata is provided
    const functionSelector = calldata.startsWith("0x") 
      ? calldata.slice(0, 10) 
      : `0x${calldata.slice(0, 8)}`;
      
    // Extract the full calldata
    const fullCalldata = calldata.startsWith("0x") 
      ? calldata 
      : `0x${calldata}`;

    // Attempt to decode using viem
    const decoded = decodeFunctionData({
      abi,
      data: fullCalldata,
    });

    return {
      functionName: decoded.functionName,
      functionSig: functionSelector,
      args: decoded.args || [],
    };
  } catch (error) {
    console.error("Error decoding calldata:", error);
    return {
      functionName: "Unknown Function",
      functionSig: calldata.slice(0, 10),
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
    // Extract just the function selector
    const functionSelector = calldata.startsWith("0x") 
      ? calldata.slice(0, 10) 
      : `0x${calldata.slice(0, 8)}`;
    
    // Normalize the full calldata
    const fullCalldata = calldata.startsWith("0x") 
      ? calldata 
      : `0x${calldata}`;
      
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
      const decodedData = decodeFunctionData({
        abi: tempAbi,
        data: fullCalldata,
      });
      
      // Use the decoded args
      args = decodedData.args || [];
      
      // Extract parameter information
      parsedParameters = extractParametersFromSignature(bestSignature, decodedData);
    } catch (decodeError) {
      console.warn("Error decoding parameters:", decodeError);
      // Fallback to showing raw parameters if decoding fails
      const rawParams = calldata.length > 10 ? calldata.slice(10) : "";
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
      functionSig: calldata.slice(0, 10),
      args: [],
      error: error instanceof Error ? error.message : "Unknown error decoding calldata",
    };
  }
}