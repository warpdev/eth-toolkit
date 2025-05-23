'use client';

import React, { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { useErrorToast } from '@/hooks/use-error-toast';
import { useAbiParsing } from '@/hooks/use-abi-parsing';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  calldataAtom,
  abiStringAtom,
  abiAtom,
  decodeModeAtom,
  isDecodingAtom,
  decodeErrorAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';
import { decodedResultAtom } from '@/features/calldata-decoder/atoms/decoder-result-atom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDecodeCalldata } from '@/features/calldata-decoder/hooks/use-decode-calldata';
import { AbiSelector } from '@/components/shared/abi-selector';
import { DecodingHistory } from './decoding-history';
import { SavedAbiSelector } from '@/components/shared/saved-abi-selector';
interface DecoderFormProps {
  onDecodeSuccess?: () => void;
}

export const DecoderForm = React.memo(function DecoderForm({ onDecodeSuccess }: DecoderFormProps) {
  const [calldata, setCalldata] = useAtom(calldataAtom);
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const setDecodedResult = useSetAtom(decodedResultAtom);

  // Use the shared ABI parsing hook
  const { abiString, setAbiString } = useAbiParsing({
    abiStringAtom,
    parsedAbiAtom: abiAtom,
    errorAtom: decodeErrorAtom,
    autoParse: decodeMode === 'abi',
  });

  const { decodeCalldata } = useDecodeCalldata();

  // Watch for decode errors and show toast
  useErrorToast({ errorAtom: decodeErrorAtom, title: 'Decode Error' });

  const handleDecode = useCallback(async () => {
    const result = await decodeCalldata();
    if (result) {
      setDecodedResult(result);

      // Show success toast
      if (!result.error) {
        const successToastOptions = {
          description: `Successfully decoded ${result.functionName}`,
          duration: 3000,
        };
        toast.success('Calldata Decoded', successToastOptions);

        // Scroll to the result section
        if (onDecodeSuccess) {
          // Small delay to ensure result is rendered
          setTimeout(() => {
            onDecodeSuccess();
          }, 100);
        }
      }
    }
  }, [decodeCalldata, setDecodedResult, onDecodeSuccess]);

  const handleCalldataChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCalldata(e.target.value);
    },
    [setCalldata]
  );

  const handleCalldataKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && calldata && !isDecoding) {
        e.preventDefault();
        handleDecode();
      }
    },
    [calldata, isDecoding, handleDecode]
  );

  const handleAbiStringChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAbiString(e.target.value);
    },
    [setAbiString]
  );

  const handleDecodeModeChange = useCallback(
    (value: string) => {
      setDecodeMode(value as 'signature' | 'abi');
    },
    [setDecodeMode]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calldata Decoder</CardTitle>
        <CardDescription>
          Decode Ethereum transaction calldata into human-readable format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Calldata</label>
          <Textarea
            placeholder="Enter calldata hex string (e.g., 0x70a08231000000000000000000000000...) and press Enter to decode"
            value={calldata}
            onChange={handleCalldataChange}
            onKeyDown={handleCalldataKeyDown}
            className="h-32 font-mono break-all"
          />
        </div>

        <Tabs value={decodeMode} onValueChange={handleDecodeModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signature">Signature Lookup</TabsTrigger>
            <TabsTrigger value="abi">Custom ABI</TabsTrigger>
          </TabsList>
          <TabsContent value="signature" className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Automatically lookup function signatures using the 4bytes database. This method only
              requires the calldata and works best for known, verified contracts.
            </p>
          </TabsContent>
          <TabsContent value="abi" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <AbiSelector abiStringAtom={abiStringAtom} showSamples={true} showUpload={false} />
                <SavedAbiSelector
                  abiAtom={abiStringAtom}
                  showDeleteOption={true}
                  showFavoriteOption={true}
                />
              </div>
              <Textarea
                placeholder="Paste contract ABI JSON here..."
                value={abiString}
                onChange={handleAbiStringChange}
                className="h-48 font-mono break-all"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LoadingButton
          onClick={handleDecode}
          disabled={!calldata}
          isLoading={isDecoding}
          loadingText="Decoding..."
          size="lg"
          className="relative w-full sm:w-auto"
        >
          Decode Calldata
        </LoadingButton>
        <DecodingHistory />
      </CardFooter>
    </Card>
  );
});
