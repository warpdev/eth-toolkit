import { ParsedParameter } from "./types";
import { isDynamicType } from "./calldata-common";

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

/**
 * Analyze parameters and identify static vs dynamic types
 */
function analyzeParameters(parsedParameters: ParsedParameter[]): {
  parameterTypes: Array<ParsedParameter & { baseType: string; isDynamic: boolean }>;
  hasAnyDynamicParams: boolean;
} {
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
  
  return { parameterTypes, hasAnyDynamicParams };
}

/**
 * Handle static parameters with simple allocation
 */
function processStaticParameters(
  parameterTypes: Array<ParsedParameter & { baseType: string; isDynamic: boolean }>
): Segment[] {
  const segments: Segment[] = [];
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
  
  return segments;
}

/**
 * Process a dynamic parameter and extract its offset information
 */
function processDynamicParameter(
  param: ParsedParameter & { baseType: string; isDynamic: boolean },
  staticParamPos: number,
  remainingCalldata: string
): {
  staticSegment: Segment | null;
  dynamicSegment: Segment | null;
} {
  // For dynamic parameters, in the static section we have a pointer (offset)
  try {
    const offsetHex = remainingCalldata.slice(staticParamPos, staticParamPos + 64);
    const offsetValue = parseInt(offsetHex, 16);
    
    // Create static segment for the offset pointer
    const staticSegment: Segment = {
      start: staticParamPos,
      end: staticParamPos + 64,
      type: `${param.type} offset`,
      name: `${param.name} offset`,
      value: offsetValue,
      isOffset: true,
      offsetValue
    };
    
    // Calculate where the dynamic data should be
    const dynamicDataStart = offsetValue * 2 - 8; // Convert bytes to hex chars and adjust for 0x
    
    // Estimate the length of dynamic data
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
    
    // Create dynamic segment for the actual data
    const dynamicSegment: Segment = {
      start: dynamicDataStart,
      end: dynamicDataStart + dynamicLength,
      type: param.type,
      name: param.name,
      value: param.value,
      isDynamic: true
    };
    
    return { staticSegment, dynamicSegment };
  } catch {
    // If we can't parse, return a basic segment
    const staticSegment: Segment = {
      start: staticParamPos,
      end: staticParamPos + 64,
      type: param.type,
      name: param.name,
      value: param.value
    };
    
    return { staticSegment, dynamicSegment: null };
  }
}

/**
 * Process a static parameter and create its segment
 */
function processStaticParameter(
  param: ParsedParameter & { baseType: string; isDynamic: boolean },
  staticParamPos: number
): Segment {
  const type = param.baseType;
  const staticLength = type in TYPE_LENGTHS ? TYPE_LENGTHS[type] : 64;
  
  return {
    start: staticParamPos,
    end: staticParamPos + staticLength,
    type: param.type,
    name: param.name,
    value: param.value
  };
}

/**
 * Handle parameters with mixed static and dynamic types
 */
function processMixedParameters(
  parameterTypes: Array<ParsedParameter & { baseType: string; isDynamic: boolean }>,
  remainingCalldata: string
): Segment[] {
  const segments: Segment[] = [];
  const dynamicSegments: Segment[] = [];
  let staticParamPos = 0;
  
  // Process each parameter
  parameterTypes.forEach((param) => {
    if (param.isDynamic) {
      // Handle dynamic parameter
      const { staticSegment, dynamicSegment } = processDynamicParameter(
        param, staticParamPos, remainingCalldata
      );
      
      if (staticSegment) segments.push(staticSegment);
      if (dynamicSegment) dynamicSegments.push(dynamicSegment);
    } else {
      // Handle static parameter
      segments.push(processStaticParameter(param, staticParamPos));
    }
    
    // Always move position forward by 32 bytes (64 hex chars)
    staticParamPos += 64;
  });
  
  // Combine static and dynamic segments
  segments.push(...dynamicSegments);
  
  // Sort by position for correct rendering order
  return segments.sort((a, b) => a.start - b.start);
}

/**
 * Calculate parameter segments with handling of dynamic types
 */
export const calculateSegments = (
  parsedParameters: ParsedParameter[] | undefined, 
  remainingCalldata: string
): Segment[] => {
  if (!parsedParameters || parsedParameters.length === 0) return [];
  
  // Analyze parameters to identify static vs dynamic types
  const { parameterTypes, hasAnyDynamicParams } = analyzeParameters(parsedParameters);
  
  // Choose processing strategy based on parameter types
  if (!hasAnyDynamicParams) {
    // Simple case: all static parameters
    return processStaticParameters(parameterTypes);
  } else {
    // Complex case: mixed static and dynamic parameters
    return processMixedParameters(parameterTypes, remainingCalldata);
  }
};