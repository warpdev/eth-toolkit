"use client";

import React, { useMemo, useCallback } from "react";
import { ParsedParameter } from "../lib/types";
import { calculateSegments } from "../lib/calldata-display-utils";
import { FunctionSignature } from "./function-signature";
import { CalldataSegment } from "./calldata-segment";
import { CalldataLegend } from "./calldata-legend";

interface ColorCodedCalldataProps {
  calldata: string;
  parsedParameters?: ParsedParameter[];
}

export const ColorCodedCalldata = React.memo(function ColorCodedCalldata({ calldata, parsedParameters }: ColorCodedCalldataProps) {
  const normalizedCalldata = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
  const functionSignature = normalizedCalldata.slice(0, 10);
  const remainingCalldata = normalizedCalldata.slice(10);
  
  const segments = useMemo(
    () => calculateSegments(parsedParameters, remainingCalldata),
    [parsedParameters, remainingCalldata]
  );
  
  const renderSegment = useCallback((segment, index, segmentText) => (
    <CalldataSegment
      key={`param-${index}`}
      segment={segment}
      segmentText={segmentText}
      index={index}
    />
  ), []);
  
  const colorizedCalldata = useMemo(() => {
    if (!parsedParameters || parsedParameters.length === 0 || segments.length === 0) {
      return <span>{remainingCalldata}</span>;
    }

    const elements: React.ReactNode[] = [];
    let coveredUntil = 0;
    
    segments.forEach((segment, index) => {
      if (segment.start > coveredUntil) {
        elements.push(
          <span key={`gap-${index}`} className="text-muted-foreground">
            {remainingCalldata.slice(coveredUntil, segment.start)}
          </span>
        );
      }
      
      if (segment.start < segment.end && segment.start < remainingCalldata.length) {
        const end = Math.min(segment.end, remainingCalldata.length);
        const segmentText = remainingCalldata.slice(segment.start, end);
        
        elements.push(renderSegment(segment, index, segmentText));
        coveredUntil = end;
      }
    });
    
    if (coveredUntil < remainingCalldata.length) {
      elements.push(
        <span key="remaining" className="text-muted-foreground">
          {remainingCalldata.slice(coveredUntil)}
        </span>
      );
    }
    
    return elements;
  }, [parsedParameters, remainingCalldata, segments, renderSegment]);

  if (!parsedParameters || parsedParameters.length === 0) {
    return (
      <div>
        <FunctionSignature signature={functionSignature} />
        <span>{remainingCalldata}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      <div className="mb-2 w-full">
        <FunctionSignature signature={functionSignature} />
        {colorizedCalldata}
      </div>
      <CalldataLegend />
    </div>
  );
});