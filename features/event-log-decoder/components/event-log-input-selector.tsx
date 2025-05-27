'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { transactionHashAtom, eventLogDataAtom, eventTopicsAtom } from '../atoms/event-log-atoms';

interface EventLogInputSelectorProps {
  onDecode?: () => void;
  className?: string;
}

export const EventLogInputSelector = React.memo(function EventLogInputSelector({
  onDecode,
  className,
}: EventLogInputSelectorProps) {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const [eventLogData, setEventLogData] = useAtom(eventLogDataAtom);
  const [eventTopics, setEventTopics] = useAtom(eventTopicsAtom);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onDecode) {
      e.preventDefault();
      onDecode();
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="transaction" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transaction">Transaction Hash</TabsTrigger>
          <TabsTrigger value="raw">Raw Log Data</TabsTrigger>
        </TabsList>

        <TabsContent value="transaction" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="tx-hash">Transaction Hash</Label>
            <Input
              id="tx-hash"
              placeholder="0x..."
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono"
            />
          </div>
        </TabsContent>

        <TabsContent value="raw" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-data">Event Data (hex)</Label>
            <Input
              id="event-data"
              placeholder="0x..."
              value={eventLogData}
              onChange={(e) => setEventLogData(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-topics">Event Topics (one per line)</Label>
            <Textarea
              id="event-topics"
              placeholder="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
0x000000000000000000000000..."
              className="h-24 font-mono text-sm"
              value={eventTopics}
              onChange={(e) => setEventTopics(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
