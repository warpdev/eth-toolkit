/**
 * Standardized error handling utility functions for the application
 */

/**
 * Standardized error types for the application
 */
export enum ErrorType {
  INVALID_CALLDATA = 'invalid_calldata',
  INVALID_ABI = 'invalid_abi',
  INVALID_SIGNATURE = 'invalid_signature',
  ENCODING_ERROR = 'encoding_error',
  DECODING_ERROR = 'decoding_error',
  PARAMETER_ERROR = 'parameter_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Interface for standardized error responses
 */
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: string;
}

/**
 * Format an error into a standardized error response
 * 
 * @param type - Type of error
 * @param message - Human-readable error message
 * @param details - Optional additional details about the error
 * @returns Formatted error response
 */
export function formatError(
  type: ErrorType,
  message: string,
  details?: string
): ErrorResponse {
  return {
    type,
    message,
    details
  };
}

/**
 * Convert an unknown error into a standardized error response
 * 
 * @param error - Error object or string
 * @param defaultType - Default error type to use if not specified
 * @returns Formatted error response
 */
export function normalizeError(
  error: unknown,
  defaultType: ErrorType = ErrorType.UNKNOWN_ERROR
): ErrorResponse {
  if (error instanceof Error) {
    return formatError(
      defaultType,
      error.message,
      error.stack
    );
  }
  
  if (typeof error === 'string') {
    return formatError(defaultType, error);
  }
  
  return formatError(
    defaultType,
    'An unknown error occurred',
    JSON.stringify(error)
  );
}

/**
 * Get a standardized error message for calldata validation
 */
export function getCalldataValidationError(): ErrorResponse {
  return formatError(
    ErrorType.INVALID_CALLDATA,
    'Invalid calldata format',
    'Calldata must be a hex string, start with 0x, and have at least 4 bytes for the function selector'
  );
}

/**
 * Get a standardized error message for ABI validation
 * 
 * @param details - Optional specific validation error
 */
export function getAbiValidationError(details?: string): ErrorResponse {
  return formatError(
    ErrorType.INVALID_ABI,
    'Invalid ABI format',
    details || 'Please check your ABI input and try again'
  );
}

/**
 * Get a standardized error message for encoding errors
 * 
 * @param details - Optional specific encoding error
 */
export function getEncodingError(details?: string): ErrorResponse {
  return formatError(
    ErrorType.ENCODING_ERROR,
    'Error encoding calldata',
    details || 'Unable to encode function call with provided parameters'
  );
}

/**
 * Get a standardized error message for decoding errors
 * 
 * @param details - Optional specific decoding error
 */
export function getDecodingError(details?: string): ErrorResponse {
  return formatError(
    ErrorType.DECODING_ERROR,
    'Error decoding calldata',
    details || 'Unable to decode calldata with the provided information'
  );
}

/**
 * Get a standardized error message for parameter errors
 * 
 * @param details - Optional specific parameter error details
 */
export function getParameterError(details?: string): ErrorResponse {
  return formatError(
    ErrorType.PARAMETER_ERROR,
    'Invalid function parameter',
    details || 'One or more function parameters have invalid values'
  );
}

/**
 * Get a standardized error message for network errors
 * 
 * @param details - Optional specific network error details
 */
export function getNetworkError(details?: string): ErrorResponse {
  return formatError(
    ErrorType.NETWORK_ERROR,
    'Network error',
    details || 'Unable to complete the request due to a network issue'
  );
}

/**
 * Format an error message from an error response
 * 
 * @param error - Error response object
 * @returns Formatted error message string
 */
export function getErrorMessage(error: ErrorResponse): string {
  return error.details ? `${error.message}: ${error.details}` : error.message;
}