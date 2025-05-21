'use client';

import React, { useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import {
  calldataAtom,
  abiStringAtom,
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDecodeCalldata } from '@/features/calldata-decoder/hooks/use-decode-calldata';
import { AbiSelector } from './abi-selector';
import { SavedAbiSelector } from './saved-abi-selector';
import { DecodingHistory } from './DecodingHistory';

interface DecoderFormProps {
  onDecodeSuccess?: () => void;
}

export const DecoderForm = React.memo(function DecoderForm({ onDecodeSuccess }: DecoderFormProps) {
  const [calldata, setCalldata] = useAtom(calldataAtom);
  const [abiString, setAbiString] = useAtom(abiStringAtom);
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const setDecodedResult = useSetAtom(decodedResultAtom);

  const { decodeCalldata, parseAbi } = useDecodeCalldata();

  // When ABI string changes, try to parse it
  useEffect(() => {
    if (decodeMode === 'abi' && abiString) {
      parseAbi();
    }
  }, [abiString, decodeMode, parseAbi]);

  // Watch for decode errors and show toast
  useEffect(() => {
    if (decodeError) {
      toast.error('Decode Error', {
        description: decodeError,
        duration: 5000,
      });
    }
  }, [decodeError]);

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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <AbiSelector />
                <SavedAbiSelector />
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
        <Button
          onClick={handleDecode}
          disabled={isDecoding || !calldata}
          size="lg"
          className="relative w-full sm:w-auto"
        >
          {isDecoding ? (
            <>
              <span className="opacity-0">Decode Calldata</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Decoding...
              </span>
            </>
          ) : (
            'Decode Calldata'
          )}
        </Button>
        <DecodingHistory />
      </CardFooter>
    </Card>
  );
});
