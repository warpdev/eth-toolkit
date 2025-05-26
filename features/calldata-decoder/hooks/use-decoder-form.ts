import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { useDecodeCalldata } from './use-decode-calldata';
import { decodedResultAtom } from '../atoms/decoder-result-atom';

interface UseDecoderFormOptions {
  onDecodeSuccess?: () => void;
}

export function useDecoderForm({ onDecodeSuccess }: UseDecoderFormOptions = {}) {
  const { decodeCalldata } = useDecodeCalldata();
  const setDecodedResult = useSetAtom(decodedResultAtom);

  const decodeWithCalldata = useCallback(
    async (calldataOverride?: string) => {
      const result = await decodeCalldata(calldataOverride);
      if (result) {
        setDecodedResult(result);

        if (!result.error) {
          const successToastOptions = {
            description: `Successfully decoded ${result.functionName}`,
            duration: 3000,
          };
          toast.success('Calldata Decoded', successToastOptions);

          if (onDecodeSuccess) {
            setTimeout(() => {
              onDecodeSuccess();
            }, 100);
          }
        }
      }
    },
    [decodeCalldata, setDecodedResult, onDecodeSuccess]
  );

  const handleDecodeClick = useCallback(async () => {
    await decodeWithCalldata();
  }, [decodeWithCalldata]);

  return {
    decodeWithCalldata,
    handleDecodeClick,
  };
}
