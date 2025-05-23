'use client';

import { useEffect } from 'react';
import { useAtomValue, Atom } from 'jotai';
import { toast } from 'sonner';

interface UseErrorToastOptions {
  errorAtom: Atom<string | null>;
  title?: string;
  duration?: number;
}

/**
 * Custom hook for showing error toasts when error atom value changes
 */
export function useErrorToast({
  errorAtom,
  title = 'Error',
  duration = 5000,
}: UseErrorToastOptions) {
  const error = useAtomValue(errorAtom);

  useEffect(() => {
    if (error) {
      toast.error(title, {
        description: error,
        duration,
      });
    }
  }, [error, title, duration]);

  return error;
}
