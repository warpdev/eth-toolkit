'use client';

import React, { useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { EncoderForm } from './encoder-form';
import { EncoderOutput } from './encoder-output';
import { encodedCalldataAtom } from '../atoms/encoder-atoms';

export const CalldataEncoder = React.memo(function CalldataEncoder() {
  const resultRef = useRef<HTMLDivElement>(null);
  const encodedCalldata = useAtomValue(encodedCalldataAtom);

  const scrollToResult = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto space-y-6">
      <EncoderForm onEncodeSuccess={scrollToResult} />
      {encodedCalldata && (
        <div ref={resultRef}>
          <EncoderOutput />
        </div>
      )}
    </div>
  );
});
