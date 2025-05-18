import { Abi, decodeFunctionData, parseAbi } from "viem";

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
 * Interface for function signature result
 */
export interface FunctionSignature {
  id: number;
  textSignature: string;
  hexSignature: string;
  createdAt: string;
}

/**
 * Fetch function signature from 4bytes API
 * 
 * @param functionSelector - 4-byte function selector (e.g., 0x70a08231)
 * @returns Array of function signatures or empty array if not found
 */
export async function fetchFunctionSignatures(
  functionSelector: string
): Promise<FunctionSignature[]> {
  try {
    // Make sure we have a clean selector
    const selector = functionSelector.startsWith("0x") 
      ? functionSelector.slice(2, 10) 
      : functionSelector.slice(0, 8);
      
    // Call the 4bytes API
    const response = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=0x${selector}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we found signatures
    if (data.results && data.results.length > 0) {
      // Map to our interface
      return data.results.map((result: any) => ({
        id: result.id,
        textSignature: result.text_signature,
        hexSignature: result.hex_signature,
        createdAt: result.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching function signatures:", error);
    return [];
  }
}

/**
 * Fetch function signature from 4bytes API (simplified version)
 * 
 * @param functionSelector - 4-byte function selector (e.g., 0x70a08231)
 * @returns Function signature or null if not found
 */
export async function fetchFunctionSignature(
  functionSelector: string
): Promise<string | null> {
  const signatures = await fetchFunctionSignatures(functionSelector);
  return signatures.length > 0 ? signatures[0].textSignature : null;
}

/**
 * Decode calldata using the 4bytes API for function signature lookup
 * 
 * @param calldata - The calldata hex string to decode
 * @returns The decoded function data or an error
 */
export async function decodeCalldataWithSignatureLookup(
  calldata: string
): Promise<DecodedFunction> {
  try {
    // Extract just the function selector
    const functionSelector = calldata.startsWith("0x") 
      ? calldata.slice(0, 10) 
      : `0x${calldata.slice(0, 8)}`;
      
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
    
    // Get the first signature (most likely match)
    const primarySignature = signatures[0].textSignature;
    
    // Extract function name from the primary signature
    const functionName = primarySignature.split("(")[0];
    
    // For parameters, we can't fully decode without the full ABI
    // Show the raw parameters after the selector
    const rawParams = calldata.length > 10 
      ? calldata.slice(10) 
      : "";
    
    // If there are multiple signatures, include them in the args
    const args: unknown[] = [];
    
    // Add raw calldata as first arg
    args.push(rawParams);
    
    // If there are multiple signatures, add them as the second arg
    if (signatures.length > 1) {
      args.push({
        alternativeSignatures: signatures.slice(1).map(sig => sig.textSignature)
      });
    }
      
    return {
      functionName,
      functionSig: primarySignature,
      args,
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