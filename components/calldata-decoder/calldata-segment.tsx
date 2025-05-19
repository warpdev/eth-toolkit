"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Segment, formatTooltipValue, getParamColor } from "@/lib/decoder/calldata-display-utils";

interface CalldataSegmentProps {
  segment: Segment;
  segmentText: string;
  index: number;
}

export function CalldataSegment({ segment, segmentText, index }: CalldataSegmentProps) {
  return (
    <TooltipProvider key={`param-${index}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={getParamColor(segment)}>
            {segmentText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <p><span className="font-semibold">Name:</span> {segment.name}</p>
            <p><span className="font-semibold">Type:</span> {segment.type}</p>
            {segment.isOffset && (
              <p><span className="font-semibold">Offset:</span> {segment.offsetValue} bytes</p>
            )}
            <p><span className="font-semibold">Value:</span> {formatTooltipValue(segment.value)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}