"use client";

import React, { useMemo } from "react";
import { ParsedParameter } from "@/lib/decoder/calldata-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Component for color-coding calldata
interface ColorCodedCalldataProps {
  calldata: string;
  parsedParameters?: ParsedParameter[];
}

const ColorCodedCalldata = React.memo(function ColorCodedCalldata({ 
  calldata,
  parsedParameters
}: ColorCodedCalldataProps) {
  // Normalize calldata to always have 0x prefix
  const normalizedCalldata = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
  
  // Extract function signature (first 4 bytes/8 hex chars after 0x)
  const functionSignature = normalizedCalldata.slice(0, 10); // 0x + 8 chars
  const remainingCalldata = normalizedCalldata.slice(10);
  
  // Calculate approximate parameter segments for common types
  const calculateSegments = useMemo(() => {
    if (!parsedParameters || parsedParameters.length === 0) return [];
    
    const segments: Array<{
      start: number,
      end: number,
      type: string,
      name: string,
      value: unknown
    }> = [];
    
    // Static parameter types have fixed lengths (assuming hex encoded)
    // These are approximate and don't handle all edge cases
    const typeLength: Record<string, number> = {
      'address': 64, // 32 bytes = 64 hex chars, padded
      'uint256': 64,
      'uint128': 64, // still 32 bytes due to padding
      'uint64': 64, 
      'uint32': 64,
      'uint16': 64,
      'uint8': 64,
      'int256': 64,
      'int128': 64,
      'int64': 64,
      'int32': 64,
      'int16': 64,
      'int8': 64,
      'bool': 64,
      'bytes32': 64,
      'bytes16': 64,
      'bytes8': 64,
      'bytes4': 64,
      'bytes2': 64,
      'bytes1': 64,
    };
    
    let currentPos = 0;
    
    parsedParameters.forEach((param) => {
      const type = param.type.replace(/\[\]$/, ''); // Remove array suffix for now
      
      // Handle static types
      if (type in typeLength) {
        segments.push({
          start: currentPos,
          end: currentPos + typeLength[type],
          type: param.type,
          name: param.name,
          value: param.value
        });
        currentPos += typeLength[type];
      } 
      // Dynamic types like string, bytes, and arrays are more complex
      // We're simplifying by just assigning the rest of the calldata
      else {
        // For dynamic types, we'll just highlight what's remaining
        if (currentPos < remainingCalldata.length) {
          segments.push({
            start: currentPos,
            end: remainingCalldata.length,
            type: param.type,
            name: param.name,
            value: param.value
          });
        }
      }
    });
    
    return segments;
  }, [parsedParameters, remainingCalldata.length]);
  
  // If we don't have parsed parameters, just return colorized function signature
  if (!parsedParameters || parsedParameters.length === 0) {
    return (
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="bg-primary/20 text-primary font-bold">{functionSignature}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Function Signature (4 bytes)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span>{remainingCalldata}</span>
      </div>
    );
  }
  
  // Colors for different parameter types
  const getParamColor = (type: string) => {
    if (type.includes("address")) return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
    if (type.includes("uint") || type.includes("int")) return "bg-green-500/20 text-green-700 dark:text-green-300";
    if (type.includes("bool")) return "bg-purple-500/20 text-purple-700 dark:text-purple-300";
    if (type.includes("string") || type.includes("bytes")) return "bg-orange-500/20 text-orange-700 dark:text-orange-300";
    return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
  };

  // Create colorized calldata using our calculated segments
  const renderColorizedCalldata = () => {
    if (calculateSegments.length === 0) {
      return (<span>{remainingCalldata}</span>);
    }

    const elements: React.ReactNode[] = [];
    
    // Add each segment with appropriate coloring and tooltip
    calculateSegments.forEach((segment, index) => {
      if (segment.start < segment.end && segment.start < remainingCalldata.length) {
        const end = Math.min(segment.end, remainingCalldata.length);
        const segmentText = remainingCalldata.slice(segment.start, end);
        
        elements.push(
          <TooltipProvider key={`param-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={getParamColor(segment.type)}>
                  {segmentText}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-xs">
                  <p><span className="font-semibold">Name:</span> {segment.name}</p>
                  <p><span className="font-semibold">Type:</span> {segment.type}</p>
                  <p><span className="font-semibold">Value:</span> {
                    typeof segment.value === 'object' 
                      ? JSON.stringify(segment.value)
                      : String(segment.value)
                  }</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    });
    
    // If there's any calldata not covered by our segments, add it at the end
    const lastSegment = calculateSegments[calculateSegments.length - 1];
    if (lastSegment && lastSegment.end < remainingCalldata.length) {
      elements.push(
        <span key="remaining">
          {remainingCalldata.slice(lastSegment.end)}
        </span>
      );
    }
    
    return elements;
  };

  return (
    <div className="flex flex-wrap">
      <div className="mb-2 w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="bg-primary/20 text-primary font-bold">{functionSignature}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Function Signature (4 bytes)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {renderColorizedCalldata()}
      </div>
      
      {/* Legend */}
      <div className="w-full mt-3 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-primary/20"></span>
          <span>Function Signature</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-blue-500/20"></span>
          <span>Address</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-green-500/20"></span>
          <span>Numbers</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-purple-500/20"></span>
          <span>Boolean</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-orange-500/20"></span>
          <span>Strings/Bytes</span>
        </div>
      </div>
    </div>
  );
});

export { ColorCodedCalldata };