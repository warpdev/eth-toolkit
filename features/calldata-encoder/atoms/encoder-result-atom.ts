import { atom } from 'jotai';

/**
 * Atom for storing the encoded calldata result
 */
export const encodedCalldataAtom = atom<string | null>(null);
