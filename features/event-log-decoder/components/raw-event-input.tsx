'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { eventLogDataAtom, eventTopicsAtom } from '../atoms/event-log-atoms';

interface RawEventInputProps {
  onDecode?: () => void;
  className?: string;
}

export const RawEventInput = React.memo(function RawEventInput({
  onDecode,
  className,
}: RawEventInputProps) {
  const [eventLogData, setEventLogData] = useAtom(eventLogDataAtom);
  const [eventTopics, setEventTopics] = useAtom(eventTopicsAtom);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey && onDecode) {
      e.preventDefault();
      onDecode();
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-data">Event Data</Label>
          <Textarea
            id="event-data"
            placeholder="Enter event data hex string (e.g., 0x0000000000000000000000000000000000000000000000000de0b6b3a7640000)"
            className="h-32 font-mono text-sm"
            value={eventLogData}
            onChange={(e) => setEventLogData(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-topics">Event Topics</Label>
          <Textarea
            id="event-topics"
            placeholder="Enter event topics (one per line):
0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
0x0000000000000000000000001234567890123456789012345678901234567890"
            className="h-32 font-mono text-sm"
            value={eventTopics}
            onChange={(e) => setEventTopics(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <p className="text-muted-foreground text-xs">Press Cmd+Enter to decode</p>
        </div>
      </div>
    </div>
  );
});
