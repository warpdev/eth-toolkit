'use client';

import React, { useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { EventLogForm } from './event-log-form';
import { EventLogOutput } from './event-log-output';
import { eventLogResultAtom } from '../atoms/event-log-atoms';

export const EventLogDecoder = React.memo(function EventLogDecoder() {
  const resultRef = useRef<HTMLDivElement>(null);
  const decodedResult = useAtomValue(eventLogResultAtom);

  const scrollToResult = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto space-y-6">
      <EventLogForm onDecodeSuccess={scrollToResult} />
      {decodedResult && (
        <div ref={resultRef}>
          <EventLogOutput />
        </div>
      )}
    </div>
  );
});
