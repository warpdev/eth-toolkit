import { EventLogDecoder } from '@/features/event-log-decoder';

export default function EventLogDecoderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Event Log Decoder</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Decode Ethereum event logs with automatic signature detection
      </p>
      <EventLogDecoder />
    </div>
  );
}
