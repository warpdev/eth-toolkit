"use client";

import { abiStringAtom } from "../atoms/encoder-atoms";
import { SavedAbiSelector as SharedSavedAbiSelector } from "@/components/shared/saved-abi-selector";

export function SavedAbiSelector() {
  return (
    <SharedSavedAbiSelector 
      abiAtom={abiStringAtom}
      showDeleteOption={false}
      saveButtonText="Save ABI"
      loadButtonText="Load Saved ABIs"
    />
  );
}