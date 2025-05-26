'use client';

import React, { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Textarea } from '@/components/ui/textarea';
import { calldataAtom, isDecodingAtom } from '@/features/calldata-decoder/atoms/calldata-atoms';

interface CalldataInputProps {
  onDecode?: (calldata?: string) => void;
  className?: string;
}

export const CalldataInput = React.memo(function CalldataInput({
  onDecode,
  className,
}: CalldataInputProps) {
  const [calldata, setCalldata] = useAtom(calldataAtom);
  const isDecoding = useAtomValue(isDecodingAtom);

  const handleCalldataChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCalldata(e.target.value);
    },
    [setCalldata]
  );

  const handleCalldataKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && calldata && !isDecoding && onDecode) {
        e.preventDefault();
        onDecode();
      }
    },
    [calldata, isDecoding, onDecode]
  );

  return (
    <div className={className}>
      <label className="text-sm font-medium">Calldata</label>
      <Textarea
        placeholder="Enter calldata hex string (e.g., 0x70a08231000000000000000000000000...) and press Enter to decode"
        value={calldata}
        onChange={handleCalldataChange}
        onKeyDown={handleCalldataKeyDown}
        className="h-32 font-mono break-all"
      />
    </div>
  );
});
