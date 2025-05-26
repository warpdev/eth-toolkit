'use client';

import React, { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  transactionHashAtom,
  isFetchingTxAtom,
  isDecodingAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';
import { useFetchTransaction } from '@/features/calldata-decoder/hooks/use-fetch-transaction';

interface TransactionHashInputProps {
  onTransactionFetched?: (calldata: string) => void;
  className?: string;
}

export const TransactionHashInput = React.memo(function TransactionHashInput({
  onTransactionFetched,
  className,
}: TransactionHashInputProps) {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const isFetchingTx = useAtomValue(isFetchingTxAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const { fetchTransaction } = useFetchTransaction();

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

      if (onTransactionFetched) {
        onTransactionFetched(tx.input);
      }
    }
  }, [transactionHash, fetchTransaction, onTransactionFetched]);

  const handleTransactionHashKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && transactionHash && !isFetchingTx) {
        e.preventDefault();
        handleFetchTransaction();
      }
    },
    [transactionHash, isFetchingTx, handleFetchTransaction]
  );

  return (
    <div className={className}>
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
  );
});
