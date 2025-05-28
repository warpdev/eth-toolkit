/**
 * Custom error types for Event Log Decoder
 */

import { ERROR_MESSAGES } from '@/features/event-log-decoder/lib/constants';

export enum EventLogErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DECODING_ERROR = 'DECODING_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class EventLogError extends Error {
  code: EventLogErrorCode;
  details?: unknown;

  constructor(code: EventLogErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'EventLogError';
    this.code = code;
    this.details = details;
  }
}

export class InvalidInputError extends EventLogError {
  constructor(message: string = ERROR_MESSAGES.INVALID_EVENT_DATA, details?: unknown) {
    super(EventLogErrorCode.INVALID_INPUT, message, details);
    this.name = 'InvalidInputError';
  }
}

export class NetworkError extends EventLogError {
  constructor(message: string = 'Network request failed', details?: unknown) {
    super(EventLogErrorCode.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

export class DecodingError extends EventLogError {
  constructor(message: string = ERROR_MESSAGES.GENERIC_ERROR, details?: unknown) {
    super(EventLogErrorCode.DECODING_ERROR, message, details);
    this.name = 'DecodingError';
  }
}

export class ApiError extends EventLogError {
  statusCode?: number;

  constructor(message: string = 'API request failed', statusCode?: number, details?: unknown) {
    super(EventLogErrorCode.API_ERROR, message, details);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends EventLogError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(EventLogErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error handler utility
 */
export function handleEventLogError(error: unknown): string {
  // Handle our custom errors
  if (error instanceof EventLogError) {
    return error.message;
  }

  // Handle viem errors
  if (error instanceof Error) {
    // Check for specific viem error patterns
    if (error.message.includes('Invalid ABI')) {
      return ERROR_MESSAGES.DECODE_FAILED_MANUAL;
    }
    if (error.message.includes('network')) {
      return 'Network error occurred. Please check your connection and try again.';
    }
    return error.message;
  }

  // Handle unknown errors
  return ERROR_MESSAGES.GENERIC_ERROR;
}

/**
 * Create user-friendly error message
 */
export function createUserMessage(error: unknown, context?: string): string {
  let message = handleEventLogError(error);

  if (context) {
    message = `${context}: ${message}`;
  }

  return message;
}
