'use client';

import React, { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { Hash } from 'lucide-react';
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
  transactionHashAtom,
  isFetchingTxAtom,
  txFetchErrorAtom,
  selectedNetworkAtom,
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
import { useFetchTransaction } from '@/features/calldata-decoder/hooks/use-fetch-transaction';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_CHAINS, type SupportedChainName } from '@/lib/config/viem-client';

interface DecoderFormProps {
  onDecodeSuccess?: () => void;
}

export const DecoderForm = React.memo(function DecoderForm({ onDecodeSuccess }: DecoderFormProps) {
  const [calldata, setCalldata] = useAtom(calldataAtom);
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const isFetchingTx = useAtomValue(isFetchingTxAtom);
  const setDecodedResult = useSetAtom(decodedResultAtom);

  // Use the shared ABI parsing hook
  const { abiString, setAbiString } = useAbiParsing({
    abiStringAtom,
    parsedAbiAtom: abiAtom,
    errorAtom: decodeErrorAtom,
    autoParse: decodeMode === 'abi',
  });

  const { decodeCalldata } = useDecodeCalldata();
  const { fetchTransaction } = useFetchTransaction();

  // Watch for decode errors and show toast
  useErrorToast({ errorAtom: decodeErrorAtom, title: 'Decode Error' });
  useErrorToast({ errorAtom: txFetchErrorAtom, title: 'Transaction Fetch Error' });

  const decodeWithCalldata = useCallback(
    async (calldataOverride?: string) => {
      const result = await decodeCalldata(calldataOverride);
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
    },
    [decodeCalldata, setDecodedResult, onDecodeSuccess]
  );

  const handleDecodeClick = useCallback(async () => {
    await decodeWithCalldata();
  }, [decodeWithCalldata]);

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
        decodeWithCalldata();
      }
    },
    [calldata, isDecoding, decodeWithCalldata]
  );

  const handleAbiStringChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAbiString(e.target.value);
    },
    [setAbiString]
  );

  const handleTransactionHashChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTransactionHash(e.target.value);
    },
    [setTransactionHash]
  );

  const handleFetchTransaction = useCallback(async () => {
    const tx = await fetchTransaction(transactionHash);
    if (tx && tx.input) {
      toast.success('Transaction fetched', {
        description: `Fetched calldata from transaction ${transactionHash.slice(0, 10)}...`,
        duration: 3000,
      });

      // Pass the calldata directly to avoid race condition
      decodeWithCalldata(tx.input);
    }
  }, [transactionHash, fetchTransaction, decodeWithCalldata]);

  const handleTransactionHashKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && transactionHash && !isFetchingTx) {
        e.preventDefault();
        handleFetchTransaction();
      }
    },
    [transactionHash, isFetchingTx, handleFetchTransaction]
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium">Network</label>
            <Select
              value={selectedNetwork}
              onValueChange={(value) => setSelectedNetwork(value as SupportedChainName)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                  <SelectItem key={key} value={key}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Transaction Hash (Optional)</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter transaction hash to fetch and decode calldata (e.g., 0x...)"
                value={transactionHash}
                onChange={handleTransactionHashChange}
                onKeyDown={handleTransactionHashKeyDown}
                className="font-mono"
              />
              <Button
                onClick={handleFetchTransaction}
                disabled={!transactionHash || isFetchingTx || isDecoding}
                variant="secondary"
                size="default"
              >
                {isFetchingTx || isDecoding ? (
                  <div className="flex items-center gap-2">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
                    <span>{isFetchingTx ? 'Fetching...' : 'Decoding...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Fetch & Decode</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

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
