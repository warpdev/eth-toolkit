import { Abi, decodeFunctionData, parseAbi } from "viem";
import { getLastSelectedSignature } from "@/lib/storage/abi-storage";

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

// Popular ERC standards and known protocols to prioritize
const POPULAR_PROTOCOLS = [
  // ERC20
  { pattern: /transfer\(address,uint256\)/, score: 10 },
  { pattern: /transferFrom\(address,address,uint256\)/, score: 10 },
  { pattern: /approve\(address,uint256\)/, score: 10 },
  { pattern: /balanceOf\(address\)/, score: 10 },
  // ERC721
  { pattern: /safeTransferFrom\(address,address,uint256\)/, score: 9 },
  { pattern: /transferFrom\(address,address,uint256\)/, score: 9 },
  { pattern: /ownerOf\(uint256\)/, score: 9 },
  // Uniswap
  { pattern: /swapExactTokensForTokens/, score: 8 },
  { pattern: /swapTokensForExactTokens/, score: 8 },
  { pattern: /addLiquidity/, score: 8 },
];

/**
 * Calculate a match score for a function signature based on how well it might match the calldata
 * 
 * @param signature - The function signature to score
 * @param calldata - The calldata to match against
 * @returns A score (higher is better match)
 */
function calculateSignatureMatchScore(signature: string, calldata: string): number {
  let score = 0;
  
  // Check if it's a popular protocol function
  for (const protocol of POPULAR_PROTOCOLS) {
    if (protocol.pattern.test(signature)) {
      score += protocol.score;
      break;
    }
  }
  
  // Prefer simpler signatures (fewer parameters)
  const paramCount = (signature.match(/,/g) || []).length + 1;
  score -= paramCount * 0.5; // Slight penalty for complexity
  
  // TODO: Add more heuristics here based on calldata analysis
  
  return score;
}

/**
 * Find the best signature match from a list of candidates
 * 
 * @param signatures - Available function signatures
 * @param functionSelector - The function selector (first 4 bytes)
 * @param calldata - Full calldata
 * @returns The best matching signature and index
 */
async function findBestSignatureMatch(
  signatures: FunctionSignature[],
  functionSelector: string,
  calldata: string
): Promise<{ bestSignature: string; index: number }> {
  // If there's only one signature, return it
  if (signatures.length === 1) {
    return { bestSignature: signatures[0].textSignature, index: 0 };
  }
  
  // First check if we have a user selection history
  const lastSelected = await getLastSelectedSignature(functionSelector);
  if (lastSelected) {
    // Find the index of the previously selected signature
    const index = signatures.findIndex(sig => sig.textSignature === lastSelected);
    if (index >= 0) {
      return { bestSignature: lastSelected, index };
    }
  }
  
  // Otherwise, score each signature and find the best match
  let bestScore = -Infinity;
  let bestIndex = 0;
  
  signatures.forEach((signature, index) => {
    const score = calculateSignatureMatchScore(signature.textSignature, calldata);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  
  return { 
    bestSignature: signatures[bestIndex].textSignature, 
    index: bestIndex 
  };
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
    
    // For parameters, we can't fully decode without the full ABI
    // Show the raw parameters after the selector
    const rawParams = calldata.length > 10 
      ? calldata.slice(10) 
      : "";
    
    const args: unknown[] = [rawParams]; // Add raw calldata as first arg
    
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
      functionSig: calldata.slice(0, 10),
      args: [],
      error: error instanceof Error ? error.message : "Unknown error decoding calldata",
    };
  }
}