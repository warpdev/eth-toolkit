// Main calldata-encoder feature exports
import { CalldataEncoder } from './components/calldata-encoder';

// Export main component
export { CalldataEncoder };

// Export types for external use
export * from './lib/types';

// Export hooks for external use
export { useEncodeCalldata } from './hooks/use-encode-calldata';
export { useFunctionSelector } from './hooks/use-function-selector';