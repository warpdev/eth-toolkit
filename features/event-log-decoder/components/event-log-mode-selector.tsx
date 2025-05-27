'use client';

import React, { useCallback } from 'react';
import { useAtom } from 'jotai';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AbiSelector } from '@/components/shared/abi-selector';
import { SavedAbiSelector } from '@/components/shared/saved-abi-selector';
import { useAbiParsing } from '@/hooks/use-abi-parsing';
import {
  decodeModeAtom,
  eventAbiAtom,
  eventAbiStringAtom,
  decodingErrorAtom,
} from '@/features/event-log-decoder/atoms/event-log-atoms';

interface EventLogModeSelectorProps {
  className?: string;
}

export const EventLogModeSelector = React.memo(function EventLogModeSelector({
  className,
}: EventLogModeSelectorProps) {
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);

  const { abiString, setAbiString } = useAbiParsing({
    abiStringAtom: eventAbiStringAtom,
    parsedAbiAtom: eventAbiAtom,
    errorAtom: decodingErrorAtom,
    autoParse: decodeMode === 'manual',
  });

  const handleDecodeModeChange = useCallback(
    (value: string) => {
      setDecodeMode(value as 'auto' | 'manual');
    },
    [setDecodeMode]
  );

  const handleAbiStringChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAbiString(e.target.value);
    },
    [setAbiString]
  );

  return (
    <div className={className}>
      <Tabs value={decodeMode} onValueChange={handleDecodeModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">Auto-Detect Signature</TabsTrigger>
          <TabsTrigger value="manual">Manual with ABI</TabsTrigger>
        </TabsList>
        <TabsContent value="auto" className="space-y-4 pt-4">
          <p className="text-muted-foreground text-sm">
            Automatically detect event signatures using 4bytes directory. Works without ABI!
          </p>
        </TabsContent>
        <TabsContent value="manual" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <AbiSelector
                abiStringAtom={eventAbiStringAtom}
                showSamples={true}
                showUpload={false}
              />
              <SavedAbiSelector
                abiAtom={eventAbiStringAtom}
                showDeleteOption={true}
                showFavoriteOption={true}
              />
            </div>
            <Textarea
              placeholder="Paste event ABI JSON here..."
              value={abiString}
              onChange={handleAbiStringChange}
              className="h-48 font-mono break-all"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
