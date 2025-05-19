"use client";

import React, { useMemo } from "react";
import { ParsedParameter } from "@/lib/decoder/calldata-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Component for color-coding calldata
interface ColorCodedCalldataProps {
  calldata: string;
  parsedParameters?: ParsedParameter[];
}

interface Segment {
  start: number;
  end: number;
  type: string;
  name: string;
  value: unknown;
  isDynamic?: boolean;
  isOffset?: boolean;
  offsetValue?: number;
}

// Helper function to determine if a type is dynamic
const isDynamicType = (type: string): boolean => {
  // Basic dynamic types
  if (type === 'string' || type === 'bytes') return true;
  
  // Arrays
  if (type.endsWith('[]')) return true;
  
  // Dynamic length arrays of form type[N] are not dynamic themselves
  if (type.match(/\[\d+\]$/)) return false;
  
  return false;
};

const ColorCodedCalldata = React.memo(function ColorCodedCalldata({ 
  calldata,
  parsedParameters
}: ColorCodedCalldataProps) {
  // Normalize calldata to always have 0x prefix
  const normalizedCalldata = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
  
  // Extract function signature (first 4 bytes/8 hex chars after 0x)
  const functionSignature = normalizedCalldata.slice(0, 10); // 0x + 8 chars
  const remainingCalldata = normalizedCalldata.slice(10);
  
  // Calculate parameter segments with improved handling of dynamic types
  const calculateSegments = useMemo(() => {
    if (!parsedParameters || parsedParameters.length === 0) return [];
    
    const segments: Segment[] = [];
    
    // Static parameter types have fixed lengths (assuming hex encoded)
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
    
    // First pass: identify static and dynamic parameters
    let hasAnyDynamicParams = false;
    const parameterTypes = parsedParameters.map(param => {
      const baseType = param.type.replace(/\[\d*\]$/, ''); // Remove array suffix
      const isDynamic = isDynamicType(param.type);
      
      if (isDynamic) {
        hasAnyDynamicParams = true;
      }
      
      return {
        ...param,
        baseType,
        isDynamic
      };
    });
    
    // If no dynamic parameters, we can do simple static allocation
    if (!hasAnyDynamicParams) {
      let currentPos = 0;
      
      parameterTypes.forEach(param => {
        const type = param.baseType;
        
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
        } else {
          // Unknown type - just use 32 bytes as default
          segments.push({
            start: currentPos,
            end: currentPos + 64,
            type: param.type,
            name: param.name,
            value: param.value
          });
          currentPos += 64;
        }
      });
    } 
    // For calldata with dynamic parameters, we need to handle offsets
    else {
      let staticParamPos = 0;
      let dynamicParamPos = 0;
      const dynamicSegments: Segment[] = [];
      
      // Calculate positions for static parts and placeholders for dynamic data
      parameterTypes.forEach((param, index) => {
        if (param.isDynamic) {
          // For dynamic parameters, in the static section we have a pointer (offset)
          // Try to extract the offset from remaining calldata
          let offsetHex = '';
          try {
            offsetHex = remainingCalldata.slice(staticParamPos, staticParamPos + 64);
            const offsetValue = parseInt(offsetHex, 16);
            
            // Add an entry for the offset pointer in the static section
            segments.push({
              start: staticParamPos,
              end: staticParamPos + 64,
              type: `${param.type} offset`,
              name: `${param.name} offset`,
              value: offsetValue,
              isOffset: true,
              offsetValue
            });
            
            // Calculate where this dynamic data should be
            // Note: this is an approximation and might not be accurate for all cases
            const dynamicDataStart = offsetValue * 2 - 8; // Convert bytes to hex chars and adjust for 0x
            
            // Try to estimate the length of dynamic data
            let dynamicLength = 64; // Default to 32 bytes
            
            // For strings and bytes, the first 32 bytes contain length
            if (param.type === 'string' || param.type === 'bytes') {
              try {
                const lengthHex = remainingCalldata.slice(dynamicDataStart, dynamicDataStart + 64);
                const length = parseInt(lengthHex, 16);
                // Length is in bytes, convert to hex chars (x2) and round up to nearest 32 bytes
                dynamicLength = 64 + (Math.ceil(length * 2 / 64) * 64);
              } catch (e) {
                // Fallback to default if we can't parse
              }
            }
            
            // Add an entry for the actual dynamic data
            dynamicSegments.push({
              start: dynamicDataStart,
              end: dynamicDataStart + dynamicLength,
              type: param.type,
              name: param.name,
              value: param.value,
              isDynamic: true
            });
            
          } catch (e) {
            // If we can't parse, just add a basic segment
            segments.push({
              start: staticParamPos,
              end: staticParamPos + 64,
              type: param.type,
              name: param.name,
              value: param.value
            });
          }
          
          staticParamPos += 64; // Still move forward 32 bytes for the offset
        } else {
          // For static parameters, just add them directly
          const type = param.baseType;
          const staticLength = type in typeLength ? typeLength[type] : 64;
          
          segments.push({
            start: staticParamPos,
            end: staticParamPos + staticLength,
            type: param.type,
            name: param.name,
            value: param.value
          });
          
          staticParamPos += staticLength;
        }
      });
      
      // Now add all the dynamic segments at the end
      segments.push(...dynamicSegments);
      
      // Sort segments by start position to ensure correct rendering order
      segments.sort((a, b) => a.start - b.start);
    }
    
    return segments;
  }, [parsedParameters, remainingCalldata]);
  
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
  const getParamColor = (segment: Segment) => {
    const { type, isOffset, isDynamic } = segment;
    
    // Special color for offset pointers
    if (isOffset) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
    
    // Basic type coloring
    if (type.includes("address")) return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
    if (type.includes("uint") || type.includes("int")) return "bg-green-500/20 text-green-700 dark:text-green-300";
    if (type.includes("bool")) return "bg-purple-500/20 text-purple-700 dark:text-purple-300";
    
    // Dynamic types
    if (isDynamic || type.includes("string") || type.includes("bytes")) {
      return "bg-orange-500/20 text-orange-700 dark:text-orange-300";
    }
    
    // Arrays
    if (type.includes("[")) return "bg-pink-500/20 text-pink-700 dark:text-pink-300";
    
    return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
  };

  // Format value for tooltip display
  const formatTooltipValue = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, (_, v) => 
          typeof v === 'bigint' ? v.toString() : v, 2);
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  };

  // Create colorized calldata using our calculated segments
  const renderColorizedCalldata = () => {
    if (calculateSegments.length === 0) {
      return (<span>{remainingCalldata}</span>);
    }

    const elements: React.ReactNode[] = [];
    let coveredUntil = 0;
    
    // Add each segment with appropriate coloring and tooltip
    calculateSegments.forEach((segment, index) => {
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
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-yellow-500/20"></span>
          <span>Offset Pointers</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-pink-500/20"></span>
          <span>Arrays</span>
        </div>
      </div>
    </div>
  );
});

export { ColorCodedCalldata };