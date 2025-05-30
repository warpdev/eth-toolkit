'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useDecodingHistory } from './use-decoding-history';
import {
  calldataAtom,
  abiAtom,
  isDecodingAtom,
  decodeErrorAtom,
  decodeModeAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';
import {
  decodedResultAtom,
  selectedSignatureIndexAtom,
} from '@/features/calldata-decoder/atoms/decoder-result-atom';
import { DecodedFunctionWithSignatures } from '@/lib/types';
import {
  isValidCalldata,
  normalizeCalldata,
  ErrorType,
  getAbiValidationError,
  getCalldataValidationError,
  normalizeError,
} from '@/lib/utils';
import {
  decodeCalldataWithAbi,
  decodeCalldataWithSignatureLookup,
} from '@/lib/utils/calldata-processing';

/**
 * Hook for decoding calldata with improved error handling
 */
export function useDecodeCalldata() {
  const calldata = useAtomValue(calldataAtom);
  const abi = useAtomValue(abiAtom);
  const decodeMode = useAtomValue(decodeModeAtom);

  const setIsDecoding = useSetAtom(isDecodingAtom);
  const setDecodeError = useSetAtom(decodeErrorAtom);

  const { addToHistory } = useDecodingHistory();

  const setDecodedResult = useSetAtom(decodedResultAtom);
  const setSelectedIndex = useSetAtom(selectedSignatureIndexAtom);

  /**
   * Decode the calldata with improved error handling
   */
  const decodeCalldata = useCallback(
    async (calldataOverride?: string): Promise<DecodedFunctionWithSignatures | null> => {
      setIsDecoding(true);
      setDecodeError(null);
      // Reset selected index when starting a new decode
      setSelectedIndex(0);

      try {
        // Use override if provided, otherwise use the atom value
        const calldataToUse = calldataOverride || calldata;

        // Validate calldata first
        if (!calldataToUse) {
          setDecodeError('Calldata is required');
          return null;
        }

        if (!isValidCalldata(calldataToUse)) {
          const error = getCalldataValidationError();
          setDecodeError(error.message);
          return null;
        }

        // Normalize the calldata
        const normalizedCalldata = normalizeCalldata(calldataToUse);
        let result: DecodedFunctionWithSignatures | null = null;

        if (decodeMode === 'abi') {
          // Make sure we have a valid ABI
          if (!abi) {
            const error = getAbiValidationError('Invalid or missing ABI');
            setDecodeError(error.message);
            return null;
          }

          // Decode using the ABI
          result = await decodeCalldataWithAbi(normalizedCalldata, abi);
        } else {
          // Decode using signature lookup
          result = await decodeCalldataWithSignatureLookup(normalizedCalldata);

          // If we have a selected signature index from the result, use it
          if (
            'selectedSignatureIndex' in result &&
            typeof result.selectedSignatureIndex === 'number'
          ) {
            setSelectedIndex(result.selectedSignatureIndex);
          }
        }

        if (result && result.error) {
          setDecodeError(result.error);
        }

        // Store the result in the atom
        setDecodedResult(result);

        if (result && !result.error) {
          addToHistory(normalizedCalldata, result);
        }

        return result;
      } catch (error) {
        const normalizedError = normalizeError(error, ErrorType.DECODING_ERROR);
        setDecodeError(normalizedError.message);
        return null;
      } finally {
        setIsDecoding(false);
      }
    },
    [
      calldata,
      decodeMode,
      abi,
      setIsDecoding,
      setDecodeError,
      setDecodedResult,
      setSelectedIndex,
      addToHistory,
    ]
  );

  return {
    decodeCalldata,
  };
}
