import { atom } from "jotai";
import { Abi } from "viem";

/**
 * Atom for storing the calldata string input
 */
export const calldataAtom = atom<string>("");

/**
 * Atom for storing the ABI input as a string
 */
export const abiStringAtom = atom<string>("");

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
export const decodeModeAtom = atom<"signature" | "abi">("signature");