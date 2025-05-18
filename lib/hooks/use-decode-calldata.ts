"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { 
  calldataAtom, 
  abiAtom, 
  abiStringAtom,
  isDecodingAtom, 
  decodeErrorAtom,
  decodeModeAtom
} from "@/lib/atoms/calldata-atoms";
import { 
  decodeCalldataWithAbi, 
  decodeCalldataWithSignatureLookup, 
  parseAbiFromString,
  DecodedFunction
} from "@/lib/decoder/calldata-utils";
import {
  isValidCalldata,
  validateAbi,
  normalizeCalldata
} from "@/lib/decoder/validation";

/**
 * Hook for decoding calldata
 */
export function useDecodeCalldata() {
  const calldata = useAtomValue(calldataAtom);
  const [abi, setAbi] = useAtom(abiAtom);
  const abiString = useAtomValue(abiStringAtom);
  const decodeMode = useAtomValue(decodeModeAtom);
  
  const setIsDecoding = useSetAtom(isDecodingAtom);
  const setDecodeError = useSetAtom(decodeErrorAtom);

  /**
   * Parse the ABI from the input string
   */
  const parseAbi = useCallback(() => {
    if (!abiString) {
      setAbi(null);
      return false;
    }

    // Validate ABI before parsing
    const { isValid, error } = validateAbi(abiString);
    if (!isValid) {
      setDecodeError(error || "Invalid ABI format. Please check your input.");
      return false;
    }

    const parsedAbi = parseAbiFromString(abiString);
    
    if (!parsedAbi) {
      setDecodeError("Invalid ABI format. Please check your input.");
      return false;
    }

    setAbi(parsedAbi);
    return true;
  }, [abiString, setAbi, setDecodeError]);

  /**
   * Validate the calldata input
   */
  const validateCalldataInput = useCallback((): boolean => {
    if (!calldata) {
      setDecodeError("Calldata is required");
      return false;
    }

    if (!isValidCalldata(calldata)) {
      setDecodeError(
        "Invalid calldata format. Calldata must be a hex string, start with 0x, " +
        "and have at least 4 bytes for the function selector."
      );
      return false;
    }

    return true;
  }, [calldata, setDecodeError]);

  /**
   * Decode the calldata
   */
  const decodeCalldata = useCallback(async (): Promise<DecodedFunction | null> => {
    setIsDecoding(true);
    setDecodeError(null);

    try {
      // Validate calldata first
      if (!validateCalldataInput()) {
        return null;
      }

      // Normalize the calldata
      const normalizedCalldata = normalizeCalldata(calldata);

      if (decodeMode === "abi") {
        // Make sure we have a valid ABI
        const isValidAbi = parseAbi();
        
        if (!isValidAbi || !abi) {
          setDecodeError("Invalid ABI. Please check your input.");
          return null;
        }

        // Decode using the ABI
        const result = await decodeCalldataWithAbi(normalizedCalldata, abi);
        
        if (result.error) {
          setDecodeError(result.error);
        }
        
        return result;
      } else {
        // Decode using signature lookup
        const result = await decodeCalldataWithSignatureLookup(normalizedCalldata);
        
        if (result.error) {
          setDecodeError(result.error);
        }
        
        return result;
      }
    } catch (error) {
      console.error("Error decoding calldata:", error);
      setDecodeError(error instanceof Error ? error.message : "Unknown error decoding calldata");
      return null;
    } finally {
      setIsDecoding(false);
    }
  }, [calldata, decodeMode, abi, parseAbi, validateCalldataInput, setIsDecoding, setDecodeError]);

  return {
    decodeCalldata,
    parseAbi
  };
}