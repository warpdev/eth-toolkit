import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { isHex, type Hex } from 'viem';
import {
  eventLogDataAtom,
  eventTopicsAtom,
  eventAbiAtom,
  decodeModeAtom,
  isDecodingAtom,
  decodingErrorAtom,
  eventLogResultAtom,
  eventLogHistoryAtom,
} from '../atoms/event-log-atoms';
import { selectedNetworkAtom } from '@/features/calldata-decoder/atoms/calldata-atoms';
import { useFetchEventLogs } from './use-fetch-event-logs';
import { useEventSignatureDetection } from './use-event-signature-detection';
import { decodeEventLogWithAbi } from '@/lib/utils/event-log-utils';
import type { DecodedEventLog, EventLogDecodingResult } from '@/lib/types';
import { STORAGE_LIMITS, ERROR_MESSAGES } from '../lib/constants';
import {
  validateTransactionHash,
  decodeLogsWithAutoSignatures,
  decodeLogsWithManualAbi,
  buildEventLogResult,
  buildHistoryItem,
  validateDecodingResults,
  parseTopicsInput,
  decodeSingleEventAuto,
} from '../lib/decode-helpers';
import { handleEventLogError } from '@/lib/errors/event-log-errors';

export function useEventLogDecoder() {
  const [eventLogData] = useAtom(eventLogDataAtom);
  const [eventTopics] = useAtom(eventTopicsAtom);
  const [eventAbi] = useAtom(eventAbiAtom);
  const [decodeMode] = useAtom(decodeModeAtom);
  const [history, setHistory] = useAtom(eventLogHistoryAtom);
  const [selectedNetwork] = useAtom(selectedNetworkAtom);

  const setIsDecoding = useSetAtom(isDecodingAtom);
  const setError = useSetAtom(decodingErrorAtom);
  const setResult = useSetAtom(eventLogResultAtom);

  const { fetchLogs } = useFetchEventLogs();
  const { detectEventSignature, detectMultipleSignatures } = useEventSignatureDetection();

  const decodeFromTransaction = useCallback(
    async (txHash: string) => {
      // Validate transaction hash
      const validation = validateTransactionHash(txHash);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      setIsDecoding(true);
      setError(null);
      setResult(null);

      try {
        // Step 1: Fetch logs from transaction
        const logs = await fetchLogs(txHash);
        if (!logs || logs.length === 0) {
          setError(ERROR_MESSAGES.NO_EVENT_LOGS);
          return;
        }

        // Step 2: Decode events based on mode
        let decodedEvents: DecodedEventLog[] = [];

        if (decodeMode === 'auto') {
          decodedEvents = await decodeLogsWithAutoSignatures(logs, detectMultipleSignatures);
        } else if (eventAbi) {
          decodedEvents = decodeLogsWithManualAbi(logs, eventAbi);
        }

        // Step 3: Validate decoding results
        const resultValidation = validateDecodingResults(decodedEvents, decodeMode);
        if (!resultValidation.valid) {
          setError(resultValidation.error!);
          return;
        }

        // Step 4: Build result
        const result = buildEventLogResult(logs, decodedEvents, txHash);
        setResult(result);

        // Step 5: Add to history
        const historyItem = buildHistoryItem(result, txHash, selectedNetwork, decodedEvents);
        setHistory([historyItem, ...history.slice(0, STORAGE_LIMITS.HISTORY_MAX_ITEMS - 1)]);
      } catch (error) {
        console.error('Error decoding event logs:', error);
        setError(handleEventLogError(error));
      } finally {
        setIsDecoding(false);
      }
    },
    [
      decodeMode,
      eventAbi,
      fetchLogs,
      detectMultipleSignatures,
      history,
      setHistory,
      setIsDecoding,
      setError,
      setResult,
      selectedNetwork,
    ]
  );

  const decodeFromRawData = useCallback(async () => {
    if (!eventLogData || !eventTopics) {
      setError(ERROR_MESSAGES.INVALID_EVENT_DATA);
      return;
    }

    setIsDecoding(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Parse and validate topics
      const topicsValidation = parseTopicsInput(eventTopics);
      if (!topicsValidation.valid) {
        setError(topicsValidation.error!);
        return;
      }

      const log = {
        data: (isHex(eventLogData) ? eventLogData : '0x') as Hex,
        topics: topicsValidation.topics!,
      };

      // Step 2: Decode event based on mode
      let decodedEvent: DecodedEventLog | null = null;

      if (decodeMode === 'auto') {
        decodedEvent = await decodeSingleEventAuto(log, detectEventSignature);
      } else if (eventAbi) {
        decodedEvent = decodeEventLogWithAbi(log, eventAbi);
      }

      // Step 3: Validate result
      if (!decodedEvent) {
        setError(
          decodeMode === 'auto'
            ? ERROR_MESSAGES.DECODE_SINGLE_FAILED_AUTO
            : ERROR_MESSAGES.DECODE_SINGLE_FAILED_MANUAL
        );
        return;
      }

      // Step 4: Build result
      const result: EventLogDecodingResult = {
        logs: [],
        decodedEvents: [decodedEvent],
      };

      setResult(result);

      // Step 5: Add to history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        logData: eventLogData,
        topics: topicsValidation.topics!,
        eventName: decodedEvent.eventName,
        eventSignature: decodedEvent.eventSignature,
        network: selectedNetwork,
        result,
      };

      setHistory([historyItem, ...history.slice(0, STORAGE_LIMITS.HISTORY_MAX_ITEMS - 1)]);
    } catch (error) {
      console.error('Error decoding raw event data:', error);
      setError(handleEventLogError(error));
    } finally {
      setIsDecoding(false);
    }
  }, [
    eventLogData,
    eventTopics,
    eventAbi,
    decodeMode,
    detectEventSignature,
    history,
    setHistory,
    setIsDecoding,
    setError,
    setResult,
    selectedNetwork,
  ]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, [setResult, setError]);

  return {
    decodeFromTransaction,
    decodeFromRawData,
    clearResults,
  };
}
