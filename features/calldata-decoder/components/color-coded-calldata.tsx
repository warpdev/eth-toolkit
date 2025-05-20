"use client";

import { useMemo } from "react";
import { ParsedParameter } from "@/lib/decoder/types";
import { calculateSegments } from "@/lib/decoder/calldata-display-utils";
import { FunctionSignature } from "./function-signature";
import { CalldataSegment } from "./calldata-segment";
import { CalldataLegend } from "./calldata-legend";

interface ColorCodedCalldataProps {
  calldata: string;
  parsedParameters?: ParsedParameter[];
}

/**
 * Component for displaying color-coded Ethereum calldata
 * Breaks down calldata into function signature and parameters with appropriate coloring
 */
export function ColorCodedCalldata({ calldata, parsedParameters }: ColorCodedCalldataProps) {
  // Normalize calldata to always have 0x prefix
  const normalizedCalldata = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
  
  // Extract function signature (first 4 bytes/8 hex chars after 0x)
  const functionSignature = normalizedCalldata.slice(0, 10); // 0x + 8 chars
  const remainingCalldata = normalizedCalldata.slice(10);
  
  // Calculate parameter segments for display
  const segments = useMemo(
    () => calculateSegments(parsedParameters, remainingCalldata),
    [parsedParameters, remainingCalldata]
  );
  
  // Render the colorized calldata based on segments
  const colorizedCalldata = useMemo(() => {
    if (!parsedParameters || parsedParameters.length === 0 || segments.length === 0) {
      return <span>{remainingCalldata}</span>;
    }

    const elements: React.ReactNode[] = [];
    let coveredUntil = 0;
    
    // Add each segment with appropriate coloring and tooltip
    segments.forEach((segment, index) => {
      // If there's a gap between segments, add it first
      if (segment.start > coveredUntil) {
        elements.push(
          <span key={`gap-${index}`} className="text-muted-foreground">
            {remainingCalldata.slice(coveredUntil, segment.start)}
          </span>
        );
      }
      
      // Add the segment itself if it's within bounds
      if (segment.start < segment.end && segment.start < remainingCalldata.length) {
        const end = Math.min(segment.end, remainingCalldata.length);
        const segmentText = remainingCalldata.slice(segment.start, end);
        
        elements.push(
          <CalldataSegment 
            key={`param-${index}`}
            segment={segment}
            segmentText={segmentText}
            index={index}
          />
        );
        
        coveredUntil = end;
      }
    });
    
    // If there's any calldata not covered by our segments, add it at the end
    if (coveredUntil < remainingCalldata.length) {
      elements.push(
        <span key="remaining" className="text-muted-foreground">
          {remainingCalldata.slice(coveredUntil)}
        </span>
      );
    }
    
    return elements;
  }, [parsedParameters, remainingCalldata, segments]);

  // Basic display with just function signature highlighted
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
}