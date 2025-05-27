import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { isHex, type Log } from 'viem';
import { getPublicClient } from '@/lib/config/viem-client';
import { normalizeError } from '@/lib/utils/error-utils';
import {
  transactionHashAtom,
  selectedNetworkAtom,
  isFetchingLogsAtom,
  decodingErrorAtom,
} from '../atoms/event-log-atoms';

export function useFetchEventLogs() {
  const [transactionHash] = useAtom(transactionHashAtom);
  const [selectedNetwork] = useAtom(selectedNetworkAtom);
  const setIsFetching = useSetAtom(isFetchingLogsAtom);
  const setError = useSetAtom(decodingErrorAtom);

  const fetchLogs = useCallback(
    async (txHash?: string): Promise<Log[] | null> => {
      const hash = txHash || transactionHash;

      if (!hash || !isHex(hash) || hash.length !== 66) {
        setError(
          'Invalid transaction hash format. Expected 66 characters (0x + 64 hex characters)'
        );
        return null;
      }

      setIsFetching(true);
      setError(null);

      try {
        const client = getPublicClient(selectedNetwork);

        // Get transaction receipt to find logs
        const receipt = await client.getTransactionReceipt({
          hash,
        });

        if (!receipt) {
          setError('Transaction not found');
          return null;
        }

        return receipt.logs;
      } catch (error) {
        const errorMessage = normalizeError(error);
        setError(errorMessage.message);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [transactionHash, selectedNetwork, setIsFetching, setError]
  );

  const fetchLogsFromBlockRange = useCallback(
    async (fromBlock: bigint, toBlock: bigint, address?: string): Promise<Log[] | null> => {
      setIsFetching(true);
      setError(null);

      try {
        const client = getPublicClient(selectedNetwork);

        const logs = await client.getLogs({
          fromBlock,
          toBlock,
          address: address as `0x${string}` | undefined,
        });

        return logs;
      } catch (error) {
        const errorMessage = normalizeError(error);
        setError(errorMessage.message);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [selectedNetwork, setIsFetching, setError]
  );

  return {
    fetchLogs,
    fetchLogsFromBlockRange,
  };
}
