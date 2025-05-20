// Main calldata-decoder feature exports
import { CalldataDecoder } from './components/calldata-decoder';

// Export main components
export { CalldataDecoder };
export * from './lib/types';

// Export hooks for external use
export { useDecodeCalldata } from './hooks/use-decode-calldata';
export { useParseParameters } from './hooks/use-parse-parameters';