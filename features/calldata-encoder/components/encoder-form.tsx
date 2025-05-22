'use client';

import React, { useEffect, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import {
  abiStringAtom,
  abiAtom,
  selectedFunctionAtom,
  isEncodingAtom,
  encodeErrorAtom,
} from '../atoms/encoder-atoms';
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
import { useEncodeCalldata } from '../hooks/use-encode-calldata';
import { AbiSelector } from '@/components/shared/abi-selector';
import { SavedAbiSelector } from '@/components/shared/saved-abi-selector';
import { FunctionSelector } from './function-selector';
import { ParameterInputs } from './parameter-inputs';

interface EncoderFormProps {
  onEncodeSuccess?: () => void;
}

export const EncoderForm = React.memo(function EncoderForm({ onEncodeSuccess }: EncoderFormProps) {
  const [abiString, setAbiString] = useAtom(abiStringAtom);
  const abi = useAtomValue(abiAtom);
  const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
  const isEncoding = useAtomValue(isEncodingAtom);
  const encodeError = useAtomValue(encodeErrorAtom);

  const { encodeCalldata, parseAbi } = useEncodeCalldata();

  // When ABI string changes, try to parse it
  useEffect(() => {
    if (abiString) {
      parseAbi();
    }
  }, [abiString, parseAbi]);

  // Watch for encode errors and show toast
  useEffect(() => {
    if (encodeError) {
      toast.error('Encode Error', {
        description: encodeError,
        duration: 5000,
      });
    }
  }, [encodeError]);

  // Handle encode action
  const handleEncode = useCallback(async () => {
    const result = await encodeCalldata();
    if (result && 'functionName' in result && onEncodeSuccess) {
      toast.success('Calldata Encoded', {
        description: `Successfully encoded ${result.functionName}`,
        duration: 3000,
      });

      // Scroll to result
      setTimeout(onEncodeSuccess, 100);
    }
  }, [encodeCalldata, onEncodeSuccess]);

  // Handle ABI string changes
  const handleAbiStringChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAbiString(e.target.value);
    },
    [setAbiString]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calldata Encoder</CardTitle>
        <CardDescription>
          Generate Ethereum transaction calldata from ABI and parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <AbiSelector abiStringAtom={abiStringAtom} showSamples={true} showUpload={false} />
            <SavedAbiSelector
              abiAtom={abiStringAtom}
              showDeleteOption={false}
              showFavoriteOption={true}
            />
          </div>
          <Textarea
            placeholder="Paste contract ABI JSON here..."
            value={abiString}
            onChange={handleAbiStringChange}
            className="h-48 font-mono"
          />
          <div className="flex items-center justify-start">
            <AbiSelector abiStringAtom={abiStringAtom} showSamples={false} showUpload={true} />
          </div>
        </div>

        {/* Function selector (only shown when ABI is loaded) */}
        {abi && (
          <div className="mt-6">
            <FunctionSelector />
          </div>
        )}

        {/* Parameter inputs (only shown when function is selected) */}
        {selectedFunction && (
          <div className="mt-6">
            <ParameterInputs />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleEncode}
          disabled={isEncoding || !selectedFunction}
          size="lg"
          className="relative"
        >
          {isEncoding ? (
            <>
              <span className="opacity-0">Encode Calldata</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Encoding...
              </span>
            </>
          ) : (
            'Encode Calldata'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
