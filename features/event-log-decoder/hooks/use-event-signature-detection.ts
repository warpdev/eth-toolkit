import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import type { Hex } from 'viem';
import { detectedSignaturesAtom } from '../atoms/event-log-atoms';
import type { EventSignatureData } from '@/lib/types';
import { fourBytesClient } from '@/lib/api/fourbytes-client';

export function useEventSignatureDetection() {
  const setDetectedSignatures = useSetAtom(detectedSignaturesAtom);

  const detectEventSignature = useCallback(
    async (signature: Hex): Promise<EventSignatureData[]> => {
      try {
        const results = await fourBytesClient.getEventSignature(signature);

        if (results.length > 0) {
          const signatures: EventSignatureData[] = results.map((result) => ({
            hex: signature,
            text: result.text_signature,
          }));

          setDetectedSignatures(signatures);
          return signatures;
        }

        return [];
      } catch (error) {
        // Log error but don't throw - gracefully return empty array
        console.warn('Event signature not found in 4bytes.directory:', signature, error);
        return [];
      }
    },
    [setDetectedSignatures]
  );

  const detectMultipleSignatures = useCallback(
    async (signatures: Hex[]): Promise<Map<Hex, EventSignatureData[]>> => {
      try {
        const fourBytesResults = await fourBytesClient.getEventSignatures(signatures);
        const results = new Map<Hex, EventSignatureData[]>();

        fourBytesResults.forEach((fourBytesSignatures, hex) => {
          const eventSignatures: EventSignatureData[] = fourBytesSignatures.map((sig) => ({
            hex,
            text: sig.text_signature,
          }));
          results.set(hex, eventSignatures);
        });

        return results;
      } catch (error) {
        // Log error but don't throw - gracefully return empty map
        console.warn('Failed to detect some event signatures from 4bytes.directory', error);
        return new Map();
      }
    },
    []
  );

  const clearDetectedSignatures = useCallback(() => {
    setDetectedSignatures([]);
  }, [setDetectedSignatures]);

  return {
    detectEventSignature,
    detectMultipleSignatures,
    clearDetectedSignatures,
  };
}
