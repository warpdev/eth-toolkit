"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { 
  abiAtom, 
  abiStringAtom,
  selectedFunctionAtom, 
  functionInputsAtom,
  isEncodingAtom, 
  encodeErrorAtom,
  encodedCalldataAtom 
} from "../atoms/encoder-atoms";
import { 
  parseAbiFromString, 
  encodeCalldataWithAbi, 
  transformInputsForEncoding 
} from "../lib/encoding-utils";
import { validateAbi, validateFunctionInputs } from "../lib/validation";
import { generateInputFieldsFromAbi } from "../lib/parameter-utils";
import { EncodedFunction } from "../lib/types";

/**
 * Hook for encoding calldata functionality
 */
export function useEncodeCalldata() {
  // State atoms
  const [abiString, setAbiString] = useAtom(abiStringAtom);
  const [abi, setAbi] = useAtom(abiAtom);
  const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
  const [functionInputs, setFunctionInputs] = useAtom(functionInputsAtom);
  const [isEncoding, setIsEncoding] = useAtom(isEncodingAtom);
  const [encodeError, setEncodeError] = useAtom(encodeErrorAtom);
  const [encodedCalldata, setEncodedCalldata] = useAtom(encodedCalldataAtom);

  /**
   * Parse ABI from string input
   */
  const parseAbi = useCallback(() => {
    // Validate ABI
    const validation = validateAbi(abiString);
    if (!validation.valid) {
      setAbi(null);
      setEncodeError(validation.error || "Invalid ABI");
      return false;
    }

    // Parse ABI
    try {
      const parsedAbi = parseAbiFromString(abiString);
      if (!parsedAbi) {
        setEncodeError("Failed to parse ABI");
        return false;
      }
      
      setAbi(parsedAbi);
      setEncodeError(null);
      return true;
    } catch (error) {
      setEncodeError(`Error parsing ABI: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, [abiString, setAbi, setEncodeError]);

  /**
   * Handle function selection
   */
  const selectFunction = useCallback((functionName: string) => {
    setSelectedFunction(functionName);
    
    // Reset inputs when changing function
    setFunctionInputs({});
    
    // Clear previous results
    setEncodedCalldata(null);
    setEncodeError(null);
  }, [setSelectedFunction, setFunctionInputs, setEncodedCalldata, setEncodeError]);

  /**
   * Update function input values
   */
  const updateFunctionInput = useCallback((name: string, value: string) => {
    setFunctionInputs(current => ({
      ...current,
      [name]: value
    }));
  }, [setFunctionInputs]);

  /**
   * Encode calldata using the current ABI, selected function, and inputs
   */
  const encodeCalldata = useCallback(async () => {
    if (!abi || !selectedFunction) {
      setEncodeError("ABI and function must be selected");
      return null;
    }

    // Validate all required inputs are provided
    const inputValidation = validateFunctionInputs(abi, selectedFunction, functionInputs);
    if (!inputValidation.valid) {
      setEncodeError(inputValidation.error || "Invalid inputs");
      return null;
    }

    setIsEncoding(true);
    setEncodeError(null);

    try {
      // Get function parameters from ABI
      const functionParams = generateInputFieldsFromAbi(abi, selectedFunction);
      
      // Transform inputs to appropriate types
      const transformedInputs = transformInputsForEncoding(functionInputs, functionParams);
      
      // Encode calldata
      const encodedData = await encodeCalldataWithAbi(abi, selectedFunction, transformedInputs);
      
      // Create result object
      const result: EncodedFunction = {
        functionName: selectedFunction,
        functionSig: `${selectedFunction}(${functionParams.map(p => p.type).join(',')})`,
        args: transformedInputs,
        encodedData
      };
      
      // Update state with result
      setEncodedCalldata(encodedData);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setEncodeError(`Error encoding calldata: ${errorMessage}`);
      return { error: errorMessage };
    } finally {
      setIsEncoding(false);
    }
  }, [
    abi, 
    selectedFunction, 
    functionInputs, 
    setIsEncoding, 
    setEncodeError,
    setEncodedCalldata
  ]);

  /**
   * Reset the encoder state
   */
  const resetEncoder = useCallback(() => {
    setAbiString("");
    setAbi(null);
    setSelectedFunction(null);
    setFunctionInputs({});
    setEncodeError(null);
    setEncodedCalldata(null);
  }, [
    setAbiString,
    setAbi,
    setSelectedFunction,
    setFunctionInputs,
    setEncodeError,
    setEncodedCalldata
  ]);

  return {
    // State
    abiString,
    abi,
    selectedFunction,
    functionInputs,
    isEncoding,
    encodeError,
    encodedCalldata,
    
    // Actions
    setAbiString,
    parseAbi,
    selectFunction,
    updateFunctionInput,
    encodeCalldata,
    resetEncoder
  };
}