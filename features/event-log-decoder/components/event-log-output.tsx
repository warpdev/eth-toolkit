'use client';

import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyButton } from '@/components/shared/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { eventLogResultAtom, decodingErrorAtom, isDecodingAtom } from '../atoms/event-log-atoms';
import { formatEventLog } from '@/lib/utils/event-log-utils';
import type { DecodedEventLog } from '@/lib/types';

/**
 * Format parameter values for display with proper type handling
 */
function formatValue(value: unknown): string {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'string' && value.startsWith('0x')) {
    // Format addresses and hashes
    if (value.length === 42) {
      // Address
      return `${value.slice(0, 6)}...${value.slice(-4)}`;
    } else if (value.length > 10) {
      // Other hex strings
      return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

export function EventLogOutput() {
  const [result] = useAtom(eventLogResultAtom);
  const [error] = useAtom(decodingErrorAtom);
  const [isDecoding] = useAtom(isDecodingAtom);

  // Loading state
  if (isDecoding) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Decoding Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Enter a transaction hash or raw event data to decode event logs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decoded Event Logs</CardTitle>
        {result.transactionHash && (
          <p className="text-muted-foreground text-sm">Transaction: {result.transactionHash}</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formatted" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="space-y-4">
            {result.decodedEvents.map((event, index) => (
              <EventCard key={index} event={event} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {result.decodedEvents.map((event, index) => (
              <DetailedEventCard key={index} event={event} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <div className="relative">
              <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                {JSON.stringify(result, (key, value) => 
                  typeof value === 'bigint' ? value.toString() : value, 2
                )}
              </pre>
              <CopyButton
                text={JSON.stringify(result, (key, value) => 
                  typeof value === 'bigint' ? value.toString() : value, 2
                )}
                className="absolute top-2 right-2"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function EventCard({ event, index }: { event: DecodedEventLog; index: number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-sm font-semibold">
          Event #{index + 1}: {event.eventName}
        </h4>
        <CopyButton text={formatEventLog(event)} size="sm" />
      </div>
      {event.eventSignature && (
        <p className="text-muted-foreground mb-2 text-xs">{event.eventSignature}</p>
      )}
      <pre className="text-muted-foreground text-xs">{formatEventLog(event)}</pre>
    </div>
  );
}

function DetailedEventCard({ event, index }: { event: DecodedEventLog; index: number }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-3 text-sm font-semibold">
        Event #{index + 1}: {event.eventName}
      </h4>

      {event.eventSignature && (
        <div className="mb-3">
          <p className="text-muted-foreground text-xs font-medium">Signature</p>
          <p className="font-mono text-xs">{event.eventSignature}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">Arguments</p>
          <div className="space-y-1">
            {Object.entries(event.args).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-medium">
                    {key}
                    {event.indexed[key] && ' (indexed)'}:
                  </span>
                  <span className="text-muted-foreground font-mono break-all">
                    {formatValue(value)}
                  </span>
                </div>
                {typeof value === 'string' && value.startsWith('0x') && value.length > 10 && (
                  <CopyButton text={value} size="sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">Raw Data</p>
          <div className="space-y-1">
            <div className="text-xs">
              <span className="font-medium">Data:</span>{' '}
              <span className="text-muted-foreground font-mono">{event.raw.data}</span>
            </div>
            <div className="text-xs">
              <span className="font-medium">Topics:</span>
              <div className="mt-1 space-y-1">
                {event.raw.topics.map((topic, i) => (
                  <div key={i} className="text-muted-foreground font-mono">
                    [{i}] {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
