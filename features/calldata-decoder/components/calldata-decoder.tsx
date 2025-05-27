'use client';

import React, { useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { DecoderForm } from './decoder-form';
import { DecoderOutput } from './decoder-output';
import { decodedResultAtom } from '../atoms/decoder-result-atom';

export const CalldataDecoder = React.memo(function CalldataDecoder() {
  const resultRef = useRef<HTMLDivElement>(null);
  const decodedResult = useAtomValue(decodedResultAtom);

  const scrollToResult = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto space-y-6">
      <DecoderForm onDecodeSuccess={scrollToResult} />
      {decodedResult && (
        <div ref={resultRef}>
          <DecoderOutput />
        </div>
      )}
    </div>
  );
});
