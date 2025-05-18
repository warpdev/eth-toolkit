import { atom } from "jotai";
import { DecodedFunction, DecodedFunctionWithSignatures } from "@/lib/decoder/calldata-utils";

/**
 * Atom for storing the decoded function result
 */
export const decodedResultAtom = atom<DecodedFunctionWithSignatures | null>(null);

/**
 * Atom for tracking the currently selected signature index
 */
export const selectedSignatureIndexAtom = atom<number>(0);