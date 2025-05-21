import { atom } from "jotai";
import { DecodedFunctionWithSignatures } from "@/lib/types";

/**
 * Atom for storing the decoded function result
 */
export const decodedResultAtom = atom<DecodedFunctionWithSignatures | null>(null);

/**
 * Atom for tracking the currently selected signature index
 */
export const selectedSignatureIndexAtom = atom<number>(0);