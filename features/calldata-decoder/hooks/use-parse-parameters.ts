"use client";

import React, { useMemo, useCallback } from "react";
import { useAtomValue } from "jotai";
import { decodeFunctionData } from "viem";
import { 
  calldataAtom,
  isDecodingAtom 
} from "@/features/calldata-decoder/atoms/calldata-atoms";
import {
  decodedResultAtom,
  selectedSignatureIndexAtom 
} from "@/features/calldata-decoder/atoms/decoder-result-atom";
import { 
  ParsedParameter
} from "@/lib/types";
import {
  normalizeCalldata,
  extractParametersFromSignature,
  createTemporaryAbiFromSignature
} from "@/lib/utils";

/**
 * Hook for parsing function parameters from calldata and signature
 * 
 * This hook encapsulates the parameter parsing logic that was previously
 * embedded in the DecoderOutput component, providing a cleaner separation
 * of concerns and better reusability.
 */
export function useParseParameters() {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodedResult = useAtomValue(decodedResultAtom);
  const selectedIndex = useAtomValue(selectedSignatureIndexAtom);

  /**
   * Get the currently selected function signature
   */
  const selectedSignature = useMemo(() => {
    if (
      decodedResult?.possibleSignatures &&
      decodedResult.possibleSignatures.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < decodedResult.possibleSignatures.length
    ) {
      return decodedResult.possibleSignatures[selectedIndex];
    }
    
    return decodedResult?.functionSig || "";
  }, [decodedResult, selectedIndex]);

  /**
   * State for tracking parameter parsing errors
   */
  const [parseError, setParseError] = React.useState<string | null>(null);

  /**
   * Parse parameters from the current calldata and selected signature
   */
  const parseParameters = useCallback((): ParsedParameter[] => {
    // Reset error state
    setParseError(null);

    // Return empty array for invalid conditions
    if (!decodedResult) {
      return [];
    }
    
    if (!calldata) {
      setParseError("No calldata provided");
      return [];
    }
    
    if (calldata.length <= 10) {
      setParseError("Calldata too short to contain parameters");
      return [];
    }
    
    if (!selectedSignature) {
      setParseError("No function signature available");
      return [];
    }
    
    if (isDecoding) {
      return [];
    }

    // Check if decodedResult already has parsed parameters
    if (
      decodedResult.parsedParameters && 
      decodedResult.parsedParameters.length > 0 && 
      decodedResult.selectedSignatureIndex === selectedIndex
    ) {
      return decodedResult.parsedParameters;
    }

    try {
      // Normalize calldata
      const fullCalldata = normalizeCalldata(calldata);
      
      // Create temporary ABI from the selected signature
      const tempAbi = createTemporaryAbiFromSignature(selectedSignature);
      
      // Decode the calldata - type assertion needed for viem's strict types
      const decodedData = decodeFunctionData({
        abi: tempAbi,
        data: fullCalldata as `0x${string}`,
      });
      
      // Extract and return parameters
      return extractParametersFromSignature(selectedSignature, decodedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error parsing parameters:", errorMessage);
      setParseError(`Failed to parse parameters: ${errorMessage}`);
      return [];
    }
  }, [calldata, decodedResult, selectedIndex, selectedSignature, isDecoding]);

  /**
   * Memoized parsed parameters to avoid unnecessary recalculations
   */
  const parsedParameters = useMemo(() => {
    return parseParameters();
  }, [parseParameters]);

  // Memoize the return object to prevent recreation on each render
  const result = useMemo(() => ({
    parsedParameters,
    parseParameters,
    selectedSignature,
    parseError
  }), [parsedParameters, parseParameters, selectedSignature, parseError]);
  
  return result;
}