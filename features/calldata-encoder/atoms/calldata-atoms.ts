'use client';

import { atom } from 'jotai';
import { Abi } from 'viem';

/**
 * Atom for storing the ABI input as a string
 */
export const abiStringAtom = atom<string>('');

/**
 * Atom for storing the parsed ABI
 */
export const abiAtom = atom<Abi | null>(null);

/**
 * Atom for storing the selected function name
 */
export const selectedFunctionAtom = atom<string | null>(null);

/**
 * Atom for storing function input values
 */
export const functionInputsAtom = atom<Record<string, string>>({});

/**
 * Atom for tracking if encoding is in progress
 */
export const isEncodingAtom = atom<boolean>(false);

/**
 * Atom for storing encode errors
 */
export const encodeErrorAtom = atom<string | null>(null);
