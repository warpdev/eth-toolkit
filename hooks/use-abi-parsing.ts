'use client';

import { useCallback, useEffect } from 'react';
import { useAtom, useSetAtom, PrimitiveAtom } from 'jotai';
import { Abi } from 'viem';
import { safeParseAbi, showAbiOperationToast } from '@/lib/utils/abi-utils';

interface UseAbiParsingOptions {
  abiStringAtom: PrimitiveAtom<string>;
  parsedAbiAtom: PrimitiveAtom<Abi | null>;
  errorAtom: PrimitiveAtom<string | null>;
  onParseSuccess?: (abi: Abi) => void;
  onParseError?: (error: string) => void;
  autoParse?: boolean;
}

/**
 * Hook for ABI parsing with automatic error handling
 * All atoms are required to prevent conditional hook calls
 */
export function useAbiParsing({
  abiStringAtom,
  parsedAbiAtom,
  errorAtom,
  onParseSuccess,
  onParseError,
  autoParse = true,
}: UseAbiParsingOptions) {
  const [abiString, setAbiString] = useAtom(abiStringAtom);
  const setParsedAbi = useSetAtom(parsedAbiAtom);
  const setError = useSetAtom(errorAtom);

  const parseAbi = useCallback(() => {
    if (!abiString) {
      setParsedAbi(null);
      setError(null);
      return null;
    }

    const result = safeParseAbi(abiString);
    
    if (result.success && result.abi) {
      setParsedAbi(result.abi);
      setError(null);
      onParseSuccess?.(result.abi);
      showAbiOperationToast('parse', true);
      return result.abi;
    } else {
      setParsedAbi(null);
      const errorMessage = result.error || 'Failed to parse ABI';
      setError(errorMessage);
      onParseError?.(errorMessage);
      showAbiOperationToast('parse', false, { error: result.error });
      return null;
    }
  }, [abiString, setParsedAbi, setError, onParseSuccess, onParseError]);

  useEffect(() => {
    if (autoParse && abiString) {
      parseAbi();
    }
  }, [abiString, parseAbi, autoParse]);

  return {
    abiString,
    setAbiString,
    parseAbi,
  };
}