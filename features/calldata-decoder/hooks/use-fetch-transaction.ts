import { useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { publicClients } from '@/lib/config/viem-client';
import {
  calldataAtom,
  transactionHashAtom,
  isFetchingTxAtom,
  txFetchErrorAtom,
  selectedNetworkAtom,
} from '../atoms/calldata-atoms';

export function useFetchTransaction() {
  const setCalldata = useSetAtom(calldataAtom);
  const setTransactionHash = useSetAtom(transactionHashAtom);
  const setIsFetchingTx = useSetAtom(isFetchingTxAtom);
  const setTxFetchError = useSetAtom(txFetchErrorAtom);
  const selectedNetwork = useAtomValue(selectedNetworkAtom);

  const fetchTransaction = useCallback(
    async (txHash: string) => {
      if (!txHash) {
        setTxFetchError('Please enter a transaction hash');
        return;
      }

      // Validate transaction hash format
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        setTxFetchError('Invalid transaction hash format');
        return;
      }

      try {
        setIsFetchingTx(true);
        setTxFetchError(null);

        // Fetch transaction from blockchain
        const client = publicClients[selectedNetwork];
        const transaction = await client.getTransaction({
          hash: txHash as `0x${string}`,
        });

        if (!transaction) {
          setTxFetchError('Transaction not found');
          return;
        }

        // Check if transaction has input data
        if (!transaction.input || transaction.input === '0x') {
          setTxFetchError('Transaction has no calldata');
          return;
        }

        // Set the calldata from the transaction
        setCalldata(transaction.input);
        setTransactionHash(txHash);

        return transaction;
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setTxFetchError(error instanceof Error ? error.message : 'Failed to fetch transaction');
      } finally {
        setIsFetchingTx(false);
      }
    },
    [setCalldata, setTransactionHash, setIsFetchingTx, setTxFetchError, selectedNetwork]
  );

  const clearTransaction = useCallback(() => {
    setTransactionHash('');
    setTxFetchError(null);
  }, [setTransactionHash, setTxFetchError]);

  return { fetchTransaction, clearTransaction };
}
