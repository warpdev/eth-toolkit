/**
 * Helper functions for event log decoding
 */

import { isHex, type Hex, type Log, type Abi } from 'viem';
import {
  decodeEventLogWithAbi,
  decodeEventLogs,
  getEventSignature,
  generateEventAbiFromSignature,
} from '@/lib/utils/event-log-utils';
import type { DecodedEventLog, EventSignatureData, EventLogDecodingResult } from '@/lib/types';
import { VALIDATION, ERROR_MESSAGES } from './constants';

/**
 * Validate transaction hash format
 */
export function validateTransactionHash(txHash: string): { valid: boolean; error?: string } {
  if (!txHash || !isHex(txHash) || txHash.length !== VALIDATION.TX_HASH_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_TX_HASH };
  }
  return { valid: true };
}

/**
 * Decode logs with automatic signature detection
 */
export async function decodeLogsWithAutoSignatures(
  logs: Log[],
  detectMultipleSignatures: (signatures: Hex[]) => Promise<Map<Hex, EventSignatureData[]>>
): Promise<DecodedEventLog[]> {
  // Extract unique event signatures
  const signatures = logs
    .map((log) => getEventSignature(log.topics))
    .filter((sig): sig is Hex => sig !== null);

  const uniqueSignatures = [...new Set(signatures)];
  const signatureMap = await detectMultipleSignatures(uniqueSignatures);

  // Decode each log with detected signatures
  return logs
    .map((log) => {
      const signature = getEventSignature(log.topics);
      if (!signature) return null;

      const detectedSigs = signatureMap.get(signature) || [];
      if (detectedSigs.length === 0) return null;

      // Use the first detected signature
      const eventAbi = generateEventAbiFromSignature(detectedSigs[0].text);
      if (!eventAbi) return null;

      const decoded = decodeEventLogWithAbi({ data: log.data, topics: log.topics }, [eventAbi]);

      if (decoded) {
        decoded.eventSignature = detectedSigs[0].text;
      }

      return decoded;
    })
    .filter((event): event is DecodedEventLog => event !== null);
}

/**
 * Decode logs with manual ABI
 */
export function decodeLogsWithManualAbi(logs: Log[], eventAbi: Abi): DecodedEventLog[] {
  return decodeEventLogs(logs, eventAbi);
}

/**
 * Build event log decoding result
 */
export function buildEventLogResult(
  logs: Log[],
  decodedEvents: DecodedEventLog[],
  txHash: string
): EventLogDecodingResult {
  return {
    logs,
    decodedEvents,
    transactionHash: txHash as Hex,
    blockNumber: logs[0]?.blockNumber || undefined,
    contractAddress: logs[0]?.address,
  };
}

/**
 * Build history item from result
 */
export function buildHistoryItem(
  result: EventLogDecodingResult,
  txHash: string,
  network: string,
  decodedEvents: DecodedEventLog[]
) {
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    transactionHash: txHash,
    eventName: decodedEvents[0]?.eventName,
    eventSignature: decodedEvents[0]?.eventSignature,
    network,
    result,
  };
}

/**
 * Validate event log decoding results
 */
export function validateDecodingResults(
  decodedEvents: DecodedEventLog[],
  decodeMode: 'auto' | 'manual'
): { valid: boolean; error?: string } {
  if (decodedEvents.length === 0) {
    return {
      valid: false,
      error:
        decodeMode === 'auto'
          ? ERROR_MESSAGES.DECODE_FAILED_AUTO
          : ERROR_MESSAGES.DECODE_FAILED_MANUAL,
    };
  }
  return { valid: true };
}

/**
 * Parse topics from string input
 */
export function parseTopicsInput(topicsInput: string): {
  valid: boolean;
  topics?: Hex[];
  error?: string;
} {
  const topicsArray = topicsInput
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter((t) => t && isHex(t)) as Hex[];

  if (topicsArray.length === 0) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_TOPICS_FORMAT };
  }

  return { valid: true, topics: topicsArray };
}

/**
 * Decode single event with automatic signature detection
 */
export async function decodeSingleEventAuto(
  log: { data: Hex; topics: Hex[] },
  detectEventSignature: (signature: Hex) => Promise<EventSignatureData[]>
): Promise<DecodedEventLog | null> {
  const signature = getEventSignature(log.topics);
  if (!signature) return null;

  const detected = await detectEventSignature(signature);
  if (detected.length === 0) return null;

  const eventAbi = generateEventAbiFromSignature(detected[0].text);
  if (!eventAbi) return null;

  const decoded = decodeEventLogWithAbi(log, [eventAbi]);
  if (decoded) {
    decoded.eventSignature = detected[0].text;
  }

  return decoded;
}
