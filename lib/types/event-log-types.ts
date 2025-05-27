import type { Hex, Log } from 'viem';

/**
 * Represents a decoded event log
 */
export interface DecodedEventLog {
  eventName: string;
  eventSignature?: string;
  args: Record<string, unknown>;
  indexed: Record<string, boolean>;
  raw: {
    data: Hex;
    topics: Hex[];
  };
}

/**
 * Event signature from 4bytes directory
 */
export interface EventSignatureData {
  hex: string;
  text: string;
}

/**
 * Event log decoding result
 */
export interface EventLogDecodingResult {
  logs: Log[];
  decodedEvents: DecodedEventLog[];
  transactionHash?: Hex;
  blockNumber?: bigint;
  contractAddress?: Hex;
}

/**
 * Event ABI definition
 */
export interface EventABI {
  type: 'event';
  name: string;
  inputs: Array<{
    name: string;
    type: string;
    indexed: boolean;
    internalType?: string;
  }>;
  anonymous?: boolean;
}

/**
 * Event log history item for storage
 */
export interface EventLogHistoryItem {
  id: string;
  timestamp: number;
  transactionHash?: string;
  eventName?: string;
  eventSignature?: string;
  network: string;
  result: EventLogDecodingResult;
}
