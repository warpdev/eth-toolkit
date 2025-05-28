/**
 * Configuration constants for Event Log Decoder
 */

// API Configuration
export const API_CONFIG = {
  FOURBYTE_BASE_URL: 'https://www.4byte.directory/api/v1',
  FOURBYTE_EVENT_ENDPOINT: '/event-signatures/',
  REQUEST_BATCH_SIZE: 5,
  BATCH_DELAY_MS: 100,
  CACHE_TTL_MS: 3600000, // 1 hour in milliseconds
  CACHE_MAX_SIZE: 1000, // Maximum number of cached signatures
} as const;

// Storage Limits
export const STORAGE_LIMITS = {
  HISTORY_MAX_ITEMS: 20,
} as const;

// Validation
export const VALIDATION = {
  TX_HASH_LENGTH: 66, // 0x + 64 hex characters
  MIN_HEX_LENGTH: 10, // For display truncation
  ADDRESS_LENGTH: 42, // 0x + 40 hex characters
} as const;

// Display Configuration
export const DISPLAY_CONFIG = {
  TRUNCATE_PREFIX_LENGTH: 6,
  TRUNCATE_SUFFIX_LENGTH: 4,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_TX_HASH:
    'Invalid transaction hash format. Expected 66 characters (0x + 64 hex characters)',
  NO_EVENT_LOGS:
    'No event logs found in this transaction. The transaction may not have emitted any events.',
  DECODE_FAILED_AUTO:
    'Unable to decode event logs. Event signatures not found in 4bytes.directory. Try manual mode with ABI.',
  DECODE_FAILED_MANUAL:
    'Unable to decode event logs with the provided ABI. Please check if the ABI matches the contract.',
  INVALID_EVENT_DATA: 'Please provide both event data and topics to decode',
  INVALID_TOPICS_FORMAT:
    'Invalid topics format. Topics should be hex strings separated by newlines or commas.',
  DECODE_SINGLE_FAILED_AUTO:
    'Failed to decode event log. Event signature not found in 4bytes.directory. Try manual mode with ABI.',
  DECODE_SINGLE_FAILED_MANUAL:
    'Failed to decode event log. Please check if the ABI matches the event data.',
  GENERIC_ERROR: 'Failed to decode event logs. Please check your input and try again.',
  GENERIC_RAW_ERROR: 'Failed to decode event data. Please check your input format.',
} as const;
