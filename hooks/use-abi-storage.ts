'use client';

import { useCallback } from 'react';
import { useSetAtom, PrimitiveAtom } from 'jotai';
import {
  saveAbiWithValidation,
  loadAbiWithValidation,
  showAbiOperationToast,
} from '@/lib/utils/abi-utils';

interface UseAbiStorageOptions {
  abiStringAtom: PrimitiveAtom<string>;
}

/**
 * Hook for ABI storage operations (save/load)
 */
export function useAbiStorage({ abiStringAtom }: UseAbiStorageOptions) {
  const setAbiString = useSetAtom(abiStringAtom);

  const saveAbi = useCallback(async (name: string, abiString: string) => {
    if (!abiString) {
      showAbiOperationToast('save', false, { error: 'No ABI to save' });
      return null;
    }

    const result = await saveAbiWithValidation(name, abiString);

    if (result.success) {
      showAbiOperationToast('save', true, { name });
      return result.id;
    } else {
      showAbiOperationToast('save', false, { error: result.error });
      return null;
    }
  }, []);

  const loadAbi = useCallback(
    async (id: string) => {
      const result = await loadAbiWithValidation(id);

      if (result.success && result.abi) {
        setAbiString(result.abi);
        showAbiOperationToast('load', true, { name: result.name });
        return true;
      } else {
        showAbiOperationToast('load', false, { error: result.error });
        return false;
      }
    },
    [setAbiString]
  );

  return {
    saveAbi,
    loadAbi,
  };
}
