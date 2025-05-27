'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transactionHashAtom } from '../atoms/event-log-atoms';
import { Hash } from 'lucide-react';

interface TransactionInputProps {
  onFetch?: () => void;
  className?: string;
}

export const TransactionInput = React.memo(function TransactionInput({
  onFetch,
  className,
}: TransactionInputProps) {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onFetch && transactionHash) {
      e.preventDefault();
      onFetch();
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="transaction-hash">Transaction Hash (Optional)</Label>
      <div className="relative mt-2">
        <Input
          id="transaction-hash"
          type="text"
          placeholder="Enter transaction hash to fetch and decode event logs"
          value={transactionHash}
          onChange={(e) => setTransactionHash(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-24 font-mono"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute top-1/2 right-1 h-7 -translate-y-1/2"
          onClick={onFetch}
          disabled={!transactionHash}
        >
          <Hash className="mr-1 h-3 w-3" />
          Fetch Logs
        </Button>
      </div>
    </div>
  );
});
