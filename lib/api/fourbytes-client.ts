/**
 * Reusable API client for 4bytes.directory
 */

import type { Hex } from 'viem';
import { API_CONFIG } from '@/features/event-log-decoder/lib/constants';
import { ApiError, NetworkError } from '@/lib/errors/event-log-errors';

export interface FourBytesSignature {
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
}

export interface FourBytesResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface CacheEntry {
  data: FourBytesSignature[];
  timestamp: number;
}

export class FourBytesClient {
  private baseUrl: string;
  private cache: Map<string, CacheEntry>;
  private requestQueue: Map<string, Promise<FourBytesSignature[]>>;

  constructor(baseUrl: string = API_CONFIG.FOURBYTE_BASE_URL) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.requestQueue = new Map();
  }

  /**
   * Get event signatures by hex
   */
  async getEventSignature(hexSignature: Hex): Promise<FourBytesSignature[]> {
    const cleanSignature = hexSignature.startsWith('0x') ? hexSignature.slice(2) : hexSignature;

    // Check cache first with TTL
    const cached = this.cache.get(cleanSignature);
    if (cached && Date.now() - cached.timestamp < API_CONFIG.CACHE_TTL_MS) {
      return cached.data;
    }

    // Remove expired entry if exists
    if (cached) {
      this.cache.delete(cleanSignature);
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cleanSignature)) {
      return this.requestQueue.get(cleanSignature)!;
    }

    // Create new request
    const request = this.fetchEventSignature(cleanSignature);
    this.requestQueue.set(cleanSignature, request);

    try {
      const result = await request;
      this.setCacheEntry(cleanSignature, result);
      return result;
    } finally {
      this.requestQueue.delete(cleanSignature);
    }
  }

  /**
   * Get multiple event signatures in batches
   */
  async getEventSignatures(hexSignatures: Hex[]): Promise<Map<Hex, FourBytesSignature[]>> {
    const results = new Map<Hex, FourBytesSignature[]>();
    const uniqueSignatures = [...new Set(hexSignatures)];

    // Process in batches
    const batchSize = API_CONFIG.REQUEST_BATCH_SIZE;
    for (let i = 0; i < uniqueSignatures.length; i += batchSize) {
      const batch = uniqueSignatures.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((sig) => this.getEventSignature(sig)));

      batch.forEach((sig, index) => {
        results.set(sig, batchResults[index]);
      });

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < uniqueSignatures.length) {
        await this.delay(API_CONFIG.BATCH_DELAY_MS);
      }
    }

    return results;
  }

  /**
   * Get function signatures by hex
   */
  async getFunctionSignature(hexSignature: string): Promise<FourBytesSignature[]> {
    const cleanSignature = hexSignature.startsWith('0x') ? hexSignature.slice(2) : hexSignature;

    const url = `${this.baseUrl}/signatures/?hex_signature=${cleanSignature}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `Failed to fetch function signature from 4bytes.directory`,
          response.status,
          { signature: cleanSignature }
        );
      }

      const data = (await response.json()) as FourBytesResponse<FourBytesSignature>;
      return data.results || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new NetworkError('Failed to connect to 4bytes.directory', {
        originalError: error,
        signature: cleanSignature,
      });
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Private method to fetch event signature
   */
  private async fetchEventSignature(cleanSignature: string): Promise<FourBytesSignature[]> {
    const url = `${this.baseUrl}${API_CONFIG.FOURBYTE_EVENT_ENDPOINT}?hex_signature=${cleanSignature}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `Failed to fetch event signature from 4bytes.directory`,
          response.status,
          { signature: cleanSignature }
        );
      }

      const data = (await response.json()) as FourBytesResponse<FourBytesSignature>;
      return data.results || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing errors
      throw new NetworkError('Failed to connect to 4bytes.directory', {
        originalError: error,
        signature: cleanSignature,
      });
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set cache entry with size limit management
   */
  private setCacheEntry(key: string, data: FourBytesSignature[]): void {
    // If cache is at max size, remove oldest entries
    if (this.cache.size >= API_CONFIG.CACHE_MAX_SIZE) {
      // Remove expired entries first
      this.cleanExpiredEntries();

      // If still at max size, remove oldest entry
      if (this.cache.size >= API_CONFIG.CACHE_MAX_SIZE) {
        const oldestKey = this.findOldestEntry();
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > API_CONFIG.CACHE_TTL_MS) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.cache.delete(key));
  }

  /**
   * Find the oldest cache entry
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }
}

// Singleton instance
export const fourBytesClient = new FourBytesClient();
