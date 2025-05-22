'use client';

import { abiStringAtom } from '../atoms/calldata-atoms';
import { SavedAbiSelector as SharedSavedAbiSelector } from '@/components/shared/saved-abi-selector';

export function SavedAbiSelector() {
  return (
    <SharedSavedAbiSelector
      abiAtom={abiStringAtom}
      showDeleteOption={true}
      showFavoriteOption={true}
      saveButtonText="Save Current ABI"
    />
  );
}
