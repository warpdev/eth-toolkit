import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import type { Hex } from 'viem';
import { detectedSignaturesAtom } from '../atoms/event-log-atoms';
import type { EventSignatureData } from '@/lib/types';

const FOURBYTE_API_URL = 'https://www.4byte.directory/api/v1/event-signatures/';

export function useEventSignatureDetection() {
  const setDetectedSignatures = useSetAtom(detectedSignaturesAtom);

  const detectEventSignature = useCallback(
    async (signature: Hex): Promise<EventSignatureData[]> => {
      try {
        // Remove '0x' prefix if present
        const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature;

        const response = await fetch(`${FOURBYTE_API_URL}?hex_signature=${cleanSignature}`);

        if (!response.ok) {
          console.error('Failed to fetch event signature from 4bytes');
          return [];
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const signatures: EventSignatureData[] = data.results.map(
            (result: { text_signature: string }) => ({
              hex: signature,
              text: result.text_signature,
            })
          );

          setDetectedSignatures(signatures);
          return signatures;
        }

        return [];
      } catch (error) {
        console.error('Error detecting event signature:', error);
        return [];
      }
    },
    [setDetectedSignatures]
  );

  const detectMultipleSignatures = useCallback(
    async (signatures: Hex[]): Promise<Map<Hex, EventSignatureData[]>> => {
      const results = new Map<Hex, EventSignatureData[]>();

      // Process signatures in parallel with rate limiting
      const batchSize = 5;
      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (sig) => {
            const detected = await detectEventSignature(sig);
            return { sig, detected };
          })
        );

        batchResults.forEach(({ sig, detected }) => {
          results.set(sig, detected);
        });

        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < signatures.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return results;
    },
    [detectEventSignature]
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
