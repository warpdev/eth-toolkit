"use client";

import { atom } from "jotai";
import { Abi } from "viem";

// Input state
export const abiStringAtom = atom<string>("");
export const abiAtom = atom<Abi | null>(null);
export const selectedFunctionAtom = atom<string | null>(null);
export const functionInputsAtom = atom<Record<string, any>>({});

// Processing state
export const isEncodingAtom = atom<boolean>(false);
export const encodeErrorAtom = atom<string | null>(null);

// Result state
export const encodedCalldataAtom = atom<string | null>(null);