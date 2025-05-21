"use client";

import { abiStringAtom } from "../atoms/calldata-atoms";
import { AbiSelector as SharedAbiSelector } from "@/components/shared/abi-selector";

export function AbiSelector() {
  return (
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium">
        Contract ABI
      </label>
      <SharedAbiSelector 
        abiStringAtom={abiStringAtom}
        showSamples={true}
        showUpload={false}
      />
    </div>
  );
}
