import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Abi } from 'viem';
import type {
  EventLogDecodingResult,
  EventSignatureData,
  EventLogHistoryItem as EventLogHistoryItemType,
} from '@/lib/types/event-log-types';
import { eventLogHistoryStorage } from '../lib/storage-adapter';

// Input atoms
export const transactionHashAtom = atom<string>('');
export const eventLogDataAtom = atom<string>('');
export const eventTopicsAtom = atom<string>('');
export const eventAbiStringAtom = atom<string>(''); // Raw ABI string
export const eventAbiAtom = atom<Abi | null>(null); // Parsed ABI
export const selectedNetworkAtom = atomWithStorage<string>('event-log-decoder:network', 'mainnet');

// Decode mode atoms
export type DecodeMode = 'auto' | 'manual';
export const decodeModeAtom = atomWithStorage<DecodeMode>('event-log-decoder:mode', 'auto');

// Processing atoms
export const isFetchingLogsAtom = atom<boolean>(false);
export const isDecodingAtom = atom<boolean>(false);
export const decodingErrorAtom = atom<string | null>(null);

// Result atoms
export const eventLogResultAtom = atom<EventLogDecodingResult | null>(null);

// Event signature detection
export const detectedSignaturesAtom = atom<EventSignatureData[]>([]);
export const selectedSignatureAtom = atom<EventSignatureData | null>(null);

// History atom with custom storage adapter for BigInt support
export const eventLogHistoryAtom = atomWithStorage<EventLogHistoryItemType[]>(
  'event-log-decoder:history',
  [],
  eventLogHistoryStorage
);
