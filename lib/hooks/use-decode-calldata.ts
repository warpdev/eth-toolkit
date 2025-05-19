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
import { decodedResultAtom, selectedSignatureIndexAtom } from "@/lib/atoms/decoder-result-atom";
import { DecodedFunction, DecodedFunctionWithSignatures } from "@/lib/decoder/types";
import { decodeCalldataWithAbi, decodeCalldataWithSignatureLookup, parseAbiFromString } from "@/lib/decoder/decoding-utils";
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

  const setDecodedResult = useSetAtom(decodedResultAtom);
  const setSelectedIndex = useSetAtom(selectedSignatureIndexAtom);

  /**
   * Decode the calldata
   */
  const decodeCalldata = useCallback(async (): Promise<DecodedFunctionWithSignatures | null> => {
    setIsDecoding(true);
    setDecodeError(null);
    // Reset selected index when starting a new decode
    setSelectedIndex(0);

    try {
      // Validate calldata first
      if (!validateCalldataInput()) {
        return null;
      }

      // Normalize the calldata
      const normalizedCalldata = normalizeCalldata(calldata);
      let result: DecodedFunction | DecodedFunctionWithSignatures | null = null;

      if (decodeMode === "abi") {
        // Make sure we have a valid ABI
        const isValidAbi = parseAbi();
        
        if (!isValidAbi || !abi) {
          setDecodeError("Invalid ABI. Please check your input.");
          return null;
        }

        // Decode using the ABI
        result = await decodeCalldataWithAbi(normalizedCalldata, abi);
      } else {
        // Decode using signature lookup
        result = await decodeCalldataWithSignatureLookup(normalizedCalldata);
        
        // If we have a selected signature index from the result, use it
        if ('selectedSignatureIndex' in result && typeof result.selectedSignatureIndex === 'number') {
          setSelectedIndex(result.selectedSignatureIndex);
        }
      }
      
      if (result && result.error) {
        setDecodeError(result.error);
      }
      
      // Store the result in the atom
      setDecodedResult(result);
      return result as DecodedFunctionWithSignatures;
    } catch (error) {
      console.error("Error decoding calldata:", error);
      setDecodeError(error instanceof Error ? error.message : "Unknown error decoding calldata");
      return null;
    } finally {
      setIsDecoding(false);
    }
  }, [
    calldata, 
    decodeMode, 
    abi, 
    parseAbi, 
    validateCalldataInput, 
    setIsDecoding, 
    setDecodeError, 
    setDecodedResult, 
    setSelectedIndex
  ]);

  return {
    decodeCalldata,
    parseAbi
  };
}