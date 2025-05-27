'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import { useErrorToast } from '@/hooks/use-error-toast';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  transactionHashAtom,
  eventLogDataAtom,
  eventTopicsAtom,
  isDecodingAtom,
  isFetchingLogsAtom,
  decodingErrorAtom,
} from '@/features/event-log-decoder/atoms/event-log-atoms';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useEventLogForm } from '@/features/event-log-decoder/hooks/use-event-log-form';
import { EventLogHistory } from './event-log-history';
import { NetworkSelector } from '@/features/calldata-decoder/components/network-selector';
import { TransactionInput } from './transaction-input';
import { RawEventInput } from './raw-event-input';
import { EventLogModeSelector } from './event-log-mode-selector';
import { useFetchEventLogs } from '../hooks/use-fetch-event-logs';

interface EventLogFormProps {
  onDecodeSuccess?: () => void;
}

export const EventLogForm = React.memo(function EventLogForm({
  onDecodeSuccess,
}: EventLogFormProps) {
  const transactionHash = useAtomValue(transactionHashAtom);
  const eventLogData = useAtomValue(eventLogDataAtom);
  const eventTopics = useAtomValue(eventTopicsAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const isFetching = useAtomValue(isFetchingLogsAtom);

  const { decodeEventLog, handleDecodeClick } = useEventLogForm({ onDecodeSuccess });
  const { fetchLogs } = useFetchEventLogs();

  const handleFetchAndDecode = async () => {
    if (transactionHash) {
      await fetchLogs(transactionHash);
      if (onDecodeSuccess) {
        onDecodeSuccess();
      }
    }
  };

  useErrorToast({ errorAtom: decodingErrorAtom, title: 'Decode Error' });

  const isLoading = isDecoding || isFetching;
  const canDecode = transactionHash || (eventLogData && eventTopics);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <NetworkSelector className="md:col-span-1" />
          <TransactionInput className="md:col-span-2" onFetch={handleFetchAndDecode} />
        </div>

        <RawEventInput className="space-y-2" onDecode={decodeEventLog} />

        <EventLogModeSelector />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LoadingButton
          onClick={handleDecodeClick}
          disabled={!canDecode}
          isLoading={isLoading}
          loadingText={isFetching ? 'Fetching Logs...' : 'Decoding...'}
          size="lg"
          className="relative w-full sm:w-auto"
        >
          Decode Event Logs
        </LoadingButton>
        <EventLogHistory />
      </CardFooter>
    </Card>
  );
});
