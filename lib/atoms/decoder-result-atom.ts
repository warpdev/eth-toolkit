import { atom } from "jotai";
import { DecodedFunction } from "@/lib/decoder/calldata-utils";

/**
 * Atom for storing the decoded function result
 */
export const decodedResultAtom = atom<DecodedFunction | null>(null);