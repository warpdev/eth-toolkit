'use client';

import React, { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { toast } from 'sonner';
import { useErrorToast } from '@/hooks/use-error-toast';
import { useAbiParsing } from '@/hooks/use-abi-parsing';
import { LoadingButton } from '@/components/shared/loading-button';
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
  const abi = useAtomValue(abiAtom);
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const isEncoding = useAtomValue(isEncodingAtom);

  // Use the shared ABI parsing hook
  const { abiString, setAbiString } = useAbiParsing({
    abiStringAtom,
    parsedAbiAtom: abiAtom,
    errorAtom: encodeErrorAtom,
    autoParse: true,
  });

  const { encodeCalldata } = useEncodeCalldata();

  // Watch for encode errors and show toast
  useErrorToast({ errorAtom: encodeErrorAtom, title: 'Encode Error' });

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
        <LoadingButton
          onClick={handleEncode}
          disabled={!selectedFunction}
          isLoading={isEncoding}
          loadingText="Encoding..."
          size="lg"
          className="relative"
        >
          Encode Calldata
        </LoadingButton>
      </CardFooter>
    </Card>
  );
});
