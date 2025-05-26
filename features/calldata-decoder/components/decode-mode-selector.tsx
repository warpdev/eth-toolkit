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
  abiStringAtom,
  abiAtom,
  decodeErrorAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';

interface DecodeModeSelectorProps {
  className?: string;
}

export const DecodeModeSelector = React.memo(function DecodeModeSelector({
  className,
}: DecodeModeSelectorProps) {
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);

  const { abiString, setAbiString } = useAbiParsing({
    abiStringAtom,
    parsedAbiAtom: abiAtom,
    errorAtom: decodeErrorAtom,
    autoParse: decodeMode === 'abi',
  });

  const handleDecodeModeChange = useCallback(
    (value: string) => {
      setDecodeMode(value as 'signature' | 'abi');
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
          <TabsTrigger value="signature">Signature Lookup</TabsTrigger>
          <TabsTrigger value="abi">Custom ABI</TabsTrigger>
        </TabsList>
        <TabsContent value="signature" className="space-y-4 pt-4">
          <p className="text-muted-foreground text-sm">
            Automatically lookup function signatures using the 4bytes database. This method only
            requires the calldata and works best for known, verified contracts.
          </p>
        </TabsContent>
        <TabsContent value="abi" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <AbiSelector abiStringAtom={abiStringAtom} showSamples={true} showUpload={false} />
              <SavedAbiSelector
                abiAtom={abiStringAtom}
                showDeleteOption={true}
                showFavoriteOption={true}
              />
            </div>
            <Textarea
              placeholder="Paste contract ABI JSON here..."
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
