'use client';

import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { abiAtom } from '../atoms/calldata-atoms';
import { FunctionInfo } from '@/lib/types';
import { extractFunctionsFromAbi } from '@/lib/utils';

/**
 * Hook for handling function selection from an ABI
 */
export function useFunctionSelector() {
  const abi = useAtomValue(abiAtom);

  /**
   * Extract available functions from the ABI
   */
  const availableFunctions = useMemo(() => {
    if (!abi) return [];
    return extractFunctionsFromAbi(abi);
  }, [abi]);

  /**
   * Get a function's info by name
   */
  const getFunctionInfo = useCallback(
    (name: string): FunctionInfo | undefined => {
      return availableFunctions.find((func) => func.name === name);
    },
    [availableFunctions]
  );

  /**
   * Group functions by name (useful for overloaded functions)
   */
  const functionsByName = useMemo(() => {
    const grouped: Record<string, FunctionInfo[]> = {};

    availableFunctions.forEach((func) => {
      if (!grouped[func.name]) {
        grouped[func.name] = [];
      }
      grouped[func.name].push(func);
    });

    return grouped;
  }, [availableFunctions]);

  /**
   * Check if a function name is overloaded (has multiple signatures)
   */
  const isOverloadedFunction = useCallback(
    (name: string): boolean => {
      return functionsByName[name]?.length > 1 || false;
    },
    [functionsByName]
  );

  return {
    availableFunctions,
    functionsByName,
    getFunctionInfo,
    isOverloadedFunction,
    hasFunctions: availableFunctions.length > 0,
  };
}
