/**
 * Reusable API client for 4bytes.directory
 * Uses Next.js API routes with built-in HTTP caching
 */

import type { Hex } from 'viem';
import { ApiError, NetworkError } from '@/lib/errors/event-log-errors';

export interface FourBytesSignature {
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
  id?: number;
}

export interface FourBytesResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface BatchResponse {
  [signature: string]: {
    results: FourBytesSignature[];
    error?: string;
  };
}

export class FourBytesClient {
  private requestQueue: Map<string, Promise<FourBytesSignature[]>>;

  constructor() {
    this.requestQueue = new Map();
  }

  /**
   * Get event signatures by hex
   */
  async getEventSignature(hexSignature: Hex): Promise<FourBytesSignature[]> {
    // Check if request is already in progress
    if (this.requestQueue.has(hexSignature)) {
      return this.requestQueue.get(hexSignature)!;
    }

    // Create new request
    const request = this.fetchEventSignature(hexSignature);
    this.requestQueue.set(hexSignature, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.requestQueue.delete(hexSignature);
    }
  }

  /**
   * Get multiple event signatures in batches
   */
  async getEventSignatures(hexSignatures: Hex[]): Promise<Map<Hex, FourBytesSignature[]>> {
    const uniqueSignatures = [...new Set(hexSignatures)];

    // Use batch API for better performance
    if (uniqueSignatures.length === 0) {
      return new Map();
    }

    try {
      const response = await fetch('/api/signatures/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatures: uniqueSignatures,
          type: 'event',
        }),
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch event signatures', response.status);
      }

      const batchResults: BatchResponse = await response.json();
      const results = new Map<Hex, FourBytesSignature[]>();

      // Convert batch response to Map
      uniqueSignatures.forEach((sig) => {
        const result = batchResults[sig];
        if (result && !result.error) {
          results.set(sig, result.results);
        } else {
          results.set(sig, []);
        }
      });

      return results;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new NetworkError('Failed to fetch event signatures', {
        originalError: error,
      });
    }
  }

  /**
   * Get function signatures by hex
   */
  async getFunctionSignature(hexSignature: string): Promise<FourBytesSignature[]> {
    try {
      const response = await fetch(`/api/signatures/function/${hexSignature}`);

      if (!response.ok) {
        throw new ApiError('Failed to fetch function signature', response.status, {
          signature: hexSignature,
        });
      }

      const data = (await response.json()) as FourBytesResponse<FourBytesSignature>;
      return data.results || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new NetworkError('Failed to fetch function signature', {
        originalError: error,
        signature: hexSignature,
      });
    }
  }

  /**
   * Private method to fetch event signature
   */
  private async fetchEventSignature(hexSignature: string): Promise<FourBytesSignature[]> {
    try {
      const response = await fetch(`/api/signatures/event/${hexSignature}`);

      if (!response.ok) {
        throw new ApiError('Failed to fetch event signature', response.status, {
          signature: hexSignature,
        });
      }

      const data = (await response.json()) as FourBytesResponse<FourBytesSignature>;
      return data.results || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing errors
      throw new NetworkError('Failed to fetch event signature', {
        originalError: error,
        signature: hexSignature,
      });
    }
  }
}

// Singleton instance
export const fourBytesClient = new FourBytesClient();
