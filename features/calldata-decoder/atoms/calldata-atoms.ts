import { atom } from 'jotai';
import { Abi } from 'viem';
import type { SupportedChainName, NetworkType } from '@/lib/config/viem-client';
import { getNetworkType } from '@/lib/config/viem-client';

/**
 * Atom for storing the calldata string input
 */
export const calldataAtom = atom<string>('');

/**
 * Atom for storing the ABI input as a string
 */
export const abiStringAtom = atom<string>('');

/**
 * Atom for storing the parsed ABI
 */
export const abiAtom = atom<Abi | null>(null);

/**
 * Atom for tracking if decoding is in progress
 */
export const isDecodingAtom = atom<boolean>(false);

/**
 * Atom for storing decode errors
 */
export const decodeErrorAtom = atom<string | null>(null);

/**
 * Atom for tracking the decoding mode
 * - "signature": Use 4bytes API to lookup the function signature
 * - "abi": Use provided ABI for decoding
 */
export const decodeModeAtom = atom<'signature' | 'abi'>('signature');

/**
 * Atom for storing the transaction hash input
 */
export const transactionHashAtom = atom<string>('');

/**
 * Atom for tracking if transaction is being fetched
 */
export const isFetchingTxAtom = atom<boolean>(false);

/**
 * Atom for storing transaction fetch errors
 */
export const txFetchErrorAtom = atom<string | null>(null);

/**
 * Atom for selected network
 * Will be hydrated from server-side cookie value via useHydrateAtoms
 */
export const selectedNetworkAtom = atom<SupportedChainName>('mainnet');

/**
 * Derived atom that automatically computes network type based on selected network
 * This prevents unnecessary re-renders and state updates
 */
export const networkTypeAtom = atom<NetworkType>((get) => getNetworkType(get(selectedNetworkAtom)));
