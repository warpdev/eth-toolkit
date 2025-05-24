'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import {
  calldataAtom,
  isDecodingAtom,
  decodeErrorAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';
import { decodedResultAtom } from '@/features/calldata-decoder/atoms/decoder-result-atom';
import { CalldataResultDisplay } from '@/components/shared/calldata-result-display';

export const DecoderOutput = React.memo(function DecoderOutput() {
  const calldata = useAtomValue(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const decodedResult = useAtomValue(decodedResultAtom);

  return (
    <CalldataResultDisplay
      calldata={calldata}
      isDecoding={isDecoding}
      decodeError={decodeError}
      decodedResult={decodedResult}
      title="Decoded Output"
      showSignatureSelector={true}
      emptyStateMessage="Enter calldata to see the decoded result"
      pendingStateMessage="Click &quot;Decode Calldata&quot; to decode"
    />
  );
});
