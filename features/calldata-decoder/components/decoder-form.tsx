'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import { useErrorToast } from '@/hooks/use-error-toast';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  calldataAtom,
  isDecodingAtom,
  decodeErrorAtom,
  txFetchErrorAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useDecoderForm } from '@/features/calldata-decoder/hooks/use-decoder-form';
import { DecodingHistory } from './decoding-history';
import { NetworkSelector } from './network-selector';
import { TransactionHashInput } from './transaction-hash-input';
import { CalldataInput } from './calldata-input';
import { DecodeModeSelector } from './decode-mode-selector';

interface DecoderFormProps {
  onDecodeSuccess?: () => void;
}

export const DecoderForm = React.memo(function DecoderForm({ onDecodeSuccess }: DecoderFormProps) {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);

  const { decodeWithCalldata, handleDecodeClick } = useDecoderForm({ onDecodeSuccess });

  useErrorToast({ errorAtom: decodeErrorAtom, title: 'Decode Error' });
  useErrorToast({ errorAtom: txFetchErrorAtom, title: 'Transaction Fetch Error' });

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <NetworkSelector className="md:col-span-1" />
          <TransactionHashInput
            className="md:col-span-2"
            onTransactionFetched={decodeWithCalldata}
          />
        </div>

        <CalldataInput className="space-y-2" onDecode={decodeWithCalldata} />

        <DecodeModeSelector />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LoadingButton
          onClick={handleDecodeClick}
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
