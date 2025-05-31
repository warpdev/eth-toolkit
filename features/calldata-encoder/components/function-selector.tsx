'use client';

import React, { useCallback } from 'react';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { AbiFunctionSelector } from '@/components/shared/abi-function-selector';

import { abiAtom, functionInputsAtom, selectedFunctionAtom } from '../atoms/calldata-atoms';

export const FunctionSelector = React.memo(function FunctionSelector() {
  const abi = useAtomValue(abiAtom);
  const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
  const setFunctionInputs = useSetAtom(functionInputsAtom);

  const handleFunctionSelect = useCallback(
    (functionName: string) => {
      setSelectedFunction(functionName);

      // Reset inputs when function changes
      setFunctionInputs({});
    },
    [setSelectedFunction, setFunctionInputs]
  );

  return (
    <AbiFunctionSelector
      abi={abi}
      selectedFunction={selectedFunction}
      onFunctionSelect={handleFunctionSelect}
      title="Select Function"
      placeholder="Select a function"
      showSignatures={true}
    />
  );
});
