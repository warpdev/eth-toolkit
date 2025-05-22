'use client';

import React, { useRef, useCallback } from 'react';
import { EncoderForm } from './encoder-form';
import { EncoderOutput } from './encoder-output';

export const CalldataEncoder = React.memo(function CalldataEncoder() {
  const resultRef = useRef<HTMLDivElement>(null);

  const scrollToResult = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="container mx-auto space-y-6 p-4">
      <EncoderForm onEncodeSuccess={scrollToResult} />
      <div ref={resultRef}>
        <EncoderOutput />
      </div>
    </div>
  );
});
