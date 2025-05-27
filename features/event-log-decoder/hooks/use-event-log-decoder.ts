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
import {
  decodeEventLogWithAbi,
  decodeEventLogs,
  getEventSignature,
  generateEventAbiFromSignature,
} from '@/lib/utils/event-log-utils';
import type { DecodedEventLog, EventLogDecodingResult } from '@/lib/types';

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
      // Validate transaction hash format
      if (!txHash || !isHex(txHash) || txHash.length !== 66) {
        setError(
          'Invalid transaction hash format. Expected 66 characters (0x + 64 hex characters)'
        );
        return;
      }

      setIsDecoding(true);
      setError(null);
      setResult(null);

      try {
        // Fetch logs from transaction
        const logs = await fetchLogs(txHash);
        if (!logs || logs.length === 0) {
          setError(
            'No event logs found in this transaction. The transaction may not have emitted any events.'
          );
          return;
        }

        let decodedEvents: DecodedEventLog[] = [];

        if (decodeMode === 'auto') {
          // Auto-detect event signatures
          const signatures = logs
            .map((log) => getEventSignature(log.topics))
            .filter((sig): sig is Hex => sig !== null);

          const uniqueSignatures = [...new Set(signatures)];
          const signatureMap = await detectMultipleSignatures(uniqueSignatures);

          // Decode each log with detected signatures
          decodedEvents = logs
            .map((log) => {
              const signature = getEventSignature(log.topics);
              if (!signature) return null;

              const detectedSigs = signatureMap.get(signature) || [];
              if (detectedSigs.length === 0) return null;

              // Use the first detected signature
              const eventAbi = generateEventAbiFromSignature(detectedSigs[0].text);
              if (!eventAbi) return null;

              const decoded = decodeEventLogWithAbi({ data: log.data, topics: log.topics }, [
                eventAbi,
              ]);

              if (decoded) {
                decoded.eventSignature = detectedSigs[0].text;
              }

              return decoded;
            })
            .filter((event): event is DecodedEventLog => event !== null);
        } else if (eventAbi) {
          // Manual mode with provided ABI
          decodedEvents = decodeEventLogs(logs, eventAbi);
          if (decodedEvents.length === 0) {
            setError(
              'Unable to decode event logs with the provided ABI. Please check if the ABI matches the contract.'
            );
            return;
          }
        }

        const result: EventLogDecodingResult = {
          logs,
          decodedEvents,
          transactionHash: txHash as Hex,
          blockNumber: logs[0]?.blockNumber || undefined,
          contractAddress: logs[0]?.address,
        };

        setResult(result);

        // Add to history
        const historyItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          transactionHash: txHash,
          eventName: decodedEvents[0]?.eventName,
          eventSignature: decodedEvents[0]?.eventSignature,
          network: selectedNetwork,
          result,
        };

        setHistory([historyItem, ...history.slice(0, 19)]); // Keep last 20 items
        if (decodedEvents.length === 0 && decodeMode === 'auto') {
          setError(
            'Unable to decode event logs. Event signatures not found in 4bytes.directory. Try manual mode with ABI.'
          );
          return;
        }
      } catch (error) {
        console.error('Error decoding event logs:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to decode event logs. Please check your input and try again.'
        );
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
      setError('Please provide both event data and topics to decode');
      return;
    }

    setIsDecoding(true);
    setError(null);
    setResult(null);

    try {
      // Parse topics
      const topicsArray = eventTopics
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter((t) => t && isHex(t)) as Hex[];

      if (topicsArray.length === 0) {
        setError(
          'Invalid topics format. Topics should be hex strings separated by newlines or commas.'
        );
        return;
      }

      const log = {
        data: (isHex(eventLogData) ? eventLogData : '0x') as Hex,
        topics: topicsArray,
      };

      let decodedEvent: DecodedEventLog | null = null;

      if (decodeMode === 'auto') {
        // Auto-detect event signature
        const signature = getEventSignature(topicsArray);
        if (signature) {
          const detected = await detectEventSignature(signature);
          if (detected.length > 0) {
            const eventAbi = generateEventAbiFromSignature(detected[0].text);
            if (eventAbi) {
              decodedEvent = decodeEventLogWithAbi(log, [eventAbi]);
              if (decodedEvent) {
                decodedEvent.eventSignature = detected[0].text;
              }
            }
          }
        }
      } else if (eventAbi) {
        // Manual mode with provided ABI
        decodedEvent = decodeEventLogWithAbi(log, eventAbi);
      }

      if (!decodedEvent) {
        setError(
          decodeMode === 'auto'
            ? 'Failed to decode event log. Event signature not found in 4bytes.directory. Try manual mode with ABI.'
            : 'Failed to decode event log. Please check if the ABI matches the event data.'
        );
        return;
      }

      const result: EventLogDecodingResult = {
        logs: [],
        decodedEvents: [decodedEvent],
      };

      setResult(result);

      // Add to history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        logData: eventLogData,
        topics: topicsArray,
        eventName: decodedEvent.eventName,
        eventSignature: decodedEvent.eventSignature,
        network: selectedNetwork,
        result,
      };

      setHistory([historyItem, ...history.slice(0, 19)]); // Keep last 20 items
    } catch (error) {
      console.error('Error decoding raw event data:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to decode event data. Please check your input format.'
      );
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
