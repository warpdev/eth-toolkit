'use client';

import { useAtom } from 'jotai';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { decodeModeAtom } from '../atoms/event-log-atoms';
import { EventLogDecoderForm } from './event-log-decoder-form';
import { EventLogOutput } from './event-log-output';

export function EventLogDecoder() {
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);

  return (
    <div className="space-y-6">
      <Tabs value={decodeMode} onValueChange={(value) => setDecodeMode(value as 'auto' | 'manual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">Auto-Detect Signature</TabsTrigger>
          <TabsTrigger value="manual">Manual with ABI</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Automatic Event Detection</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Automatically detect event signatures using 4bytes directory. Works without ABI!
            </p>
            <EventLogDecoderForm />
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Manual Decoding with ABI</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Decode event logs using provided event ABI for precise results.
            </p>
            <EventLogDecoderForm showAbiInput />
          </Card>
        </TabsContent>
      </Tabs>

      <EventLogOutput />
    </div>
  );
}
