"use client";

import { abiStringAtom } from "../atoms/encoder-atoms";
import { AbiSelector as SharedAbiSelector } from "@/components/shared/abi-selector";

export function AbiSelector() {
  return (
    <SharedAbiSelector 
      abiStringAtom={abiStringAtom}
      showSamples={true}
      showUpload={true}
    />
  );
}