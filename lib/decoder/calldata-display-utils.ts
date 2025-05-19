import { ParsedParameter } from "./types";

export interface Segment {
  start: number;
  end: number;
  type: string;
  name: string;
  value: unknown;
  isDynamic?: boolean;
  isOffset?: boolean;
  offsetValue?: number;
}

// Type definitions for static parameter types
export const TYPE_LENGTHS: Record<string, number> = {
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

// Helper function to determine if a type is dynamic
export const isDynamicType = (type: string): boolean => {
  // Basic dynamic types
  if (type === 'string' || type === 'bytes') return true;
  
  // Arrays
  if (type.endsWith('[]')) return true;
  
  // Dynamic length arrays of form type[N] are not dynamic themselves
  if (type.match(/\[\d+\]$/)) return false;
  
  return false;
};

// Colors for different parameter types
export const getParamColor = (segment: Segment): string => {
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
export const formatTooltipValue = (value: unknown): string => {
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

// Calculate parameter segments with handling of dynamic types
export const calculateSegments = (
  parsedParameters: ParsedParameter[] | undefined, 
  remainingCalldata: string
): Segment[] => {
  if (!parsedParameters || parsedParameters.length === 0) return [];
  
  const segments: Segment[] = [];
  
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
      if (type in TYPE_LENGTHS) {
        segments.push({
          start: currentPos,
          end: currentPos + TYPE_LENGTHS[type],
          type: param.type,
          name: param.name,
          value: param.value
        });
        currentPos += TYPE_LENGTHS[type];
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
    const dynamicSegments: Segment[] = [];
    
    // Calculate positions for static parts and placeholders for dynamic data
    parameterTypes.forEach((param) => {
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
            } catch {
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
          
        } catch {
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
        const staticLength = type in TYPE_LENGTHS ? TYPE_LENGTHS[type] : 64;
        
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
};