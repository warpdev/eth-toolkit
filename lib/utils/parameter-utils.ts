import { Abi } from "viem";

/**
 * Extract parameter section from function signature
 * 
 * @param signature - Function signature (e.g. "transfer(address to,uint256 amount)")
 * @returns The parameter section of the signature or empty string if none
 */
export function extractParameterSection(signature: string): string {
  try {
    // Get the parameter section from the signature
    return signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
  } catch (error) {
    console.error("Error extracting parameter section:", error);
    return '';
  }
}

/**
 * Parse a single parameter string into name and type
 * 
 * @param param - Parameter string (e.g. "address to" or "uint256")
 * @param index - Index of the parameter for fallback naming
 * @returns Object with parameter name and type
 */
export function parseParameter(param: string, index: number): { name: string; type: string } {
  // Split parameter into type and name parts
  const parts = param.trim().split(' ');
  
  // Extract type and name
  const type = parts[0];
  // Use the name if available, otherwise use the index
  const name = parts.length > 1 ? parts[1] : `param${index}`;
  
  return { name, type };
}

/**
 * Generate parameter definitions from an ABI and function name
 * 
 * @param abi - Contract ABI
 * @param functionName - The name of the function to generate parameters for
 * @returns Array of parameter objects with name, type, and optional components
 */
export function generateParametersFromAbi(
  abi: Abi, 
  functionName: string
): Array<{ name: string; type: string; components?: any[] }> {
  if (!abi || !Array.isArray(abi) || !functionName) return [];
  
  // Find the function in the ABI
  const functionAbi = abi.find(
    (item) => item.type === 'function' && item.name === functionName
  );
  
  if (!functionAbi || !functionAbi.inputs) return [];
  
  // Map the inputs to our parameter interface
  return functionAbi.inputs.map((input) => ({
    name: input.name || `param${input.type}`,
    type: input.type,
    components: input.components
  }));
}