import { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { transactionHashAtom, eventLogDataAtom, eventTopicsAtom } from '../atoms/event-log-atoms';
import { useEventLogDecoder } from './use-event-log-decoder';

interface UseEventLogFormProps {
  onDecodeSuccess?: () => void;
}

export function useEventLogForm({ onDecodeSuccess }: UseEventLogFormProps) {
  const transactionHash = useAtomValue(transactionHashAtom);
  const eventLogData = useAtomValue(eventLogDataAtom);
  const eventTopics = useAtomValue(eventTopicsAtom);

  const { decodeFromTransaction, decodeFromRawData } = useEventLogDecoder();

  const decodeEventLog = useCallback(async () => {
    if (transactionHash) {
      await decodeFromTransaction(transactionHash);
      onDecodeSuccess?.();
    } else if (eventLogData && eventTopics) {
      await decodeFromRawData();
      onDecodeSuccess?.();
    }
  }, [
    transactionHash,
    eventLogData,
    eventTopics,
    decodeFromTransaction,
    decodeFromRawData,
    onDecodeSuccess,
  ]);

  const handleDecodeClick = useCallback(() => {
    decodeEventLog();
  }, [decodeEventLog]);

  return {
    decodeEventLog,
    handleDecodeClick,
  };
}
