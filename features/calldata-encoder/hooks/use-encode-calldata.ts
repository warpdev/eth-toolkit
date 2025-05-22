'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  abiAtom,
  abiStringAtom,
  selectedFunctionAtom,
  functionInputsAtom,
  isEncodingAtom,
  encodeErrorAtom,
  encodedCalldataAtom,
} from '../atoms/encoder-atoms';
import { Abi } from 'viem';
import {
  encodeCalldataWithAbi,
  createEncodedFunctionResult,
} from '@/lib/utils/calldata-processing';
import { FunctionParameter, EncodedFunction } from '@/lib/types';
import {
  parseAbiFromString,
  validateAbiString,
  validateFunctionInputs as validateInputs,
  generateParametersFromAbi,
  ErrorType,
  getAbiValidationError,
  getEncodingError,
  getParameterError,
  normalizeError,
} from '@/lib/utils';
import { transformInputsForEncoding } from '@/lib/utils/calldata-processing';

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
   * Parse ABI from string input with improved error handling
   */
  const parseAbi = useCallback(() => {
    // Validate ABI
    const validation = validateAbiString(abiString);
    if (!validation.isValid) {
      const error = getAbiValidationError(validation.error);
      setAbi(null);
      setEncodeError(error.message);
      return false;
    }

    // Parse ABI
    try {
      const parsedAbi = parseAbiFromString(abiString);
      if (!parsedAbi) {
        const error = getAbiValidationError('Failed to parse ABI structure');
        setEncodeError(error.message);
        return false;
      }

      setAbi(parsedAbi);
      setEncodeError(null);
      return true;
    } catch (error) {
      const normalizedError = normalizeError(error, ErrorType.INVALID_ABI);
      setEncodeError(normalizedError.message);
      return false;
    }
  }, [abiString, setAbi, setEncodeError]);

  /**
   * Handle function selection
   */
  const selectFunction = useCallback(
    (functionName: string) => {
      setSelectedFunction(functionName);

      // Reset inputs when changing function
      setFunctionInputs({});

      // Clear previous results
      setEncodedCalldata(null);
      setEncodeError(null);
    },
    [setSelectedFunction, setFunctionInputs, setEncodedCalldata, setEncodeError]
  );

  /**
   * Update function input values
   */
  const updateFunctionInput = useCallback(
    (name: string, value: string) => {
      setFunctionInputs((current) => ({
        ...current,
        [name]: value,
      }));
    },
    [setFunctionInputs]
  );

  /**
   * Validate the current encoding setup with improved error handling
   */
  const validateEncodingSetup = useCallback(() => {
    if (!abi || !selectedFunction) {
      setEncodeError('ABI and function must be selected');
      return false;
    }

    // Validate all required inputs are provided
    const inputValidation = validateInputs(abi, selectedFunction, functionInputs);
    if (!inputValidation.valid) {
      const error = getParameterError(inputValidation.error);
      setEncodeError(error.message);
      return false;
    }

    return true;
  }, [abi, selectedFunction, functionInputs, setEncodeError]);

  /**
   * Prepare function inputs for encoding
   */
  const prepareInputsForEncoding = useCallback(() => {
    if (!abi || !selectedFunction) return null;

    // Get function parameters from ABI
    const functionParams = generateParametersFromAbi(abi, selectedFunction);

    // Transform inputs to appropriate types
    const transformedInputs = transformInputsForEncoding(functionInputs, functionParams);

    return {
      functionParams,
      transformedInputs,
    };
  }, [abi, selectedFunction, functionInputs]);

  /**
   * Create the final result object
   */
  const createResultObject = useCallback(
    (
      functionName: string,
      functionParams: FunctionParameter[],
      transformedInputs: unknown[],
      encodedData: string
    ): EncodedFunction => {
      const signature = `${functionName}(${functionParams.map((p) => p.type).join(',')})`;
      return createEncodedFunctionResult(functionName, signature, transformedInputs, encodedData);
    },
    []
  );

  /**
   * Encode calldata using the current ABI, selected function, and inputs
   * with improved error handling
   */
  const encodeCalldata = useCallback(async () => {
    // Validate setup first
    if (!validateEncodingSetup()) {
      return null;
    }

    setIsEncoding(true);
    setEncodeError(null);

    try {
      // If validation passed, we know these variables are defined
      // We can safely use our hook variables

      // Prepare inputs for encoding
      const prepared = prepareInputsForEncoding();
      if (!prepared) {
        const error = getParameterError('Failed to prepare inputs');
        setEncodeError(error.message);
        return null;
      }

      const { functionParams, transformedInputs } = prepared;

      // Encode calldata using our shared utility
      const encodingResult = await encodeCalldataWithAbi(
        abi as Abi,
        selectedFunction || '',
        transformedInputs
      );

      if (typeof encodingResult === 'object' && 'error' in encodingResult) {
        throw new Error(encodingResult.error);
      }

      const encodedData = encodingResult;

      // Create result object
      const result = createResultObject(
        selectedFunction || '',
        functionParams,
        transformedInputs,
        encodedData
      );

      // Update state with result
      setEncodedCalldata(encodedData);

      return result;
    } catch (error) {
      const normalizedError = normalizeError(error, ErrorType.ENCODING_ERROR);
      setEncodeError(normalizedError.message);
      return { error: normalizedError.message };
    } finally {
      setIsEncoding(false);
    }
  }, [
    abi,
    selectedFunction,
    validateEncodingSetup,
    prepareInputsForEncoding,
    createResultObject,
    setIsEncoding,
    setEncodeError,
    setEncodedCalldata,
  ]);

  /**
   * Reset the encoder state
   */
  const resetEncoder = useCallback(() => {
    setAbiString('');
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
    setEncodedCalldata,
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
    resetEncoder,
  };
}
