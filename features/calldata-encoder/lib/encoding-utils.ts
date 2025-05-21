'use client';

/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/lib/utils/calldata-processing.ts and @/lib/utils/abi-utils.ts instead.
 */

import { 
  encodeCalldataWithAbi,
  transformInputForType,
  transformInputsForEncoding
} from '@/lib/utils/calldata-processing';

import {
  parseAbiFromString,
  extractFunctionsFromAbi
} from '@/lib/utils/abi-utils';

// Re-export utility functions to maintain backward compatibility
export {
  encodeCalldataWithAbi,
  parseAbiFromString,
  extractFunctionsFromAbi,
  transformInputForType,
  transformInputsForEncoding
};