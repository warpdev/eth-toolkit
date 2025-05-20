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
} from "@/features/calldata-decoder/atoms/calldata-atoms";
import { decodedResultAtom, selectedSignatureIndexAtom } from "@/features/calldata-decoder/atoms/decoder-result-atom";
import { 
  DecodedFunctionWithSignatures,
  parseAbiFromString,
  validateAbiString,
  isValidCalldata,
  normalizeCalldata,
  ErrorType,
  getAbiValidationError,
  getCalldataValidationError,
  getDecodingError,
  normalizeError
} from "@/lib/utils";
import { decodeCalldataWithAbi, decodeCalldataWithSignatureLookup } from "@/features/calldata-decoder/lib/decoding-utils";

/**
 * Hook for decoding calldata with improved error handling
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
    const validation = validateAbiString(abiString);
    if (!validation.isValid) {
      const error = getAbiValidationError(validation.error);
      setDecodeError(error.message);
      return false;
    }

    const parsedAbi = parseAbiFromString(abiString);
    
    if (!parsedAbi) {
      const error = getAbiValidationError("Failed to parse ABI structure");
      setDecodeError(error.message);
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
      const error = getCalldataValidationError();
      setDecodeError(error.message);
      return false;
    }

    return true;
  }, [calldata, setDecodeError]);

  const setDecodedResult = useSetAtom(decodedResultAtom);
  const setSelectedIndex = useSetAtom(selectedSignatureIndexAtom);

  /**
   * Decode the calldata with improved error handling
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
      let result: DecodedFunctionWithSignatures | null = null;

      if (decodeMode === "abi") {
        // Make sure we have a valid ABI
        const isValidAbi = parseAbi();
        
        if (!isValidAbi || !abi) {
          const error = getAbiValidationError("Invalid or missing ABI");
          setDecodeError(error.message);
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
      return result;
    } catch (error) {
      const normalizedError = normalizeError(error, ErrorType.DECODING_ERROR);
      setDecodeError(normalizedError.message);
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