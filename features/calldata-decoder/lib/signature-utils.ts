import { parseAbi } from 'viem';
import { FunctionSignature } from '@/lib/types';
import { getLastSelectedSignature } from '@/lib/storage/abi-storage';

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
    const selector = functionSelector.startsWith('0x')
      ? functionSelector.slice(2, 10)
      : functionSelector.slice(0, 8);

    // Call the 4bytes API
    const response = await fetch(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=0x${selector}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if we found signatures
    if (data.results && data.results.length > 0) {
      // Map to our interface
      return data.results.map(
        (result: {
          id: number;
          text_signature: string;
          hex_signature: string;
          created_at: string;
        }) => ({
          id: result.id,
          textSignature: result.text_signature,
          hexSignature: result.hex_signature,
          createdAt: result.created_at,
        })
      );
    }

    return [];
  } catch (error) {
    console.error('Error fetching function signatures:', error);
    return [];
  }
}

/**
 * Fetch function signature from 4bytes API (simplified version)
 *
 * @param functionSelector - 4-byte function selector (e.g., 0x70a08231)
 * @returns Function signature or null if not found
 */
export async function fetchFunctionSignature(functionSelector: string): Promise<string | null> {
  const signatures = await fetchFunctionSignatures(functionSelector);
  return signatures.length > 0 ? signatures[0].textSignature : null;
}

/**
 * Create a temporary ABI item from function signature
 *
 * @param signature - Function signature (e.g. "transfer(address,uint256)")
 * @returns ABI item array
 */
export function createTemporaryAbiFromSignature(signature: string) {
  try {
    // Validate signature format
    if (!signature.includes('(')) {
      throw new Error('Invalid function signature format: missing parentheses');
    }

    // Instead of using template strings which cause type issues with viem,
    // use a hard-coded function signature array with known types
    const functionSignatureWithPrefix = 'function ' + signature;
    return parseAbi([functionSignatureWithPrefix] as readonly [string]);
  } catch (error) {
    console.error('Error creating temporary ABI:', error);
    // Return minimal valid ABI if parsing fails
    return parseAbi(['function unknown()'] as const);
  }
}

/**
 * Check if a function signature is valid for ABI creation
 *
 * @param signature - Function signature to validate
 * @returns True if the signature is valid, false otherwise
 */
export function isValidFunctionSignature(signature: string): boolean {
  try {
    // Basic format validation
    if (!signature || !signature.includes('(') || !signature.includes(')')) {
      return false;
    }

    // Try to parse it (this will catch syntax errors)
    const functionSignatureWithPrefix = 'function ' + signature;
    parseAbi([functionSignatureWithPrefix] as readonly [string]);
    return true;
  } catch {
    return false;
  }
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
  // ERC1155
  { pattern: /safeTransferFrom\(address,address,uint256,uint256,bytes\)/, score: 9 },
  { pattern: /safeBatchTransferFrom\(address,address,uint256\[\],uint256\[\],bytes\)/, score: 9 },
  // Named parameter preference
  { pattern: /\w+\s+\w+/, score: 1 }, // Bonus for named parameters
];

/**
 * Calculate a match score for a function signature based on how well it might match the calldata
 *
 * @param signature - The function signature to score
 * @param calldata - The calldata to match against
 * @returns A score (higher is better match)
 */
export function calculateSignatureMatchScore(signature: string, calldata: string): number {
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

  // Parse out parameter types for additional analysis
  const paramSection = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
  const params = paramSection ? paramSection.split(',').map((p) => p.trim()) : [];

  // Analyze calldata length for better matching
  if (calldata && calldata.length > 10) {
    const calldataLength = calldata.length - 10; // Subtract function selector

    // Estimate parameter length based on types
    let estimatedLength = 0;

    for (const param of params) {
      const paramType = param.split(' ')[0]; // Get just the type part

      // Dynamic types typically start with an offset (32 bytes)
      if (paramType === 'string' || paramType === 'bytes' || paramType.endsWith('[]')) {
        estimatedLength += 64; // 32 bytes offset = 64 hex chars
      }
      // Fixed-size types
      else {
        // Most Ethereum types are padded to 32 bytes
        estimatedLength += 64; // 32 bytes = 64 hex chars
      }
    }

    // If our parameter estimates are within 25% of the actual calldata length, that's a good sign
    const lengthDifference = Math.abs(estimatedLength - calldataLength);
    const lengthRatio = estimatedLength > 0 ? lengthDifference / estimatedLength : 1;

    if (lengthRatio < 0.25) {
      score += 3; // Good length match
    } else if (lengthRatio < 0.5) {
      score += 1; // Decent length match
    }
  }

  // Prefer signatures with named parameters
  const namedParamCount = params.filter((p) => p.includes(' ')).length;
  score += namedParamCount * 0.5; // Bonus for named parameters

  // Prefer signatures with more specific parameter types
  // (e.g., uint256 is more specific than uint)
  for (const param of params) {
    const paramType = param.split(' ')[0];
    if (/uint\d+/.test(paramType) || /int\d+/.test(paramType) || /bytes\d+/.test(paramType)) {
      score += 0.2; // Small bonus for specific numeric types
    }
  }

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
export async function findBestSignatureMatch(
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
    const index = signatures.findIndex((sig) => sig.textSignature === lastSelected);
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
    index: bestIndex,
  };
}
