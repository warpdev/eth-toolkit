'use client';

import { openDB, DBSchema, IDBPDatabase, IDBPCursorWithValue } from 'idb';
import { DecodedFunctionWithSignatures } from '@/lib/types';

// Define our value types first
interface ABIStoreValue {
  id: string;
  name: string;
  abi: string;
  createdAt: number;
  lastUsed: number;
  isFavorite: boolean;
}

interface SignatureHistoryValue {
  hexSignature: string;
  selectedSignature: string;
  lastUsed: number;
}

interface DecodingHistoryValue {
  id: string;
  calldata: string;
  result: DecodedFunctionWithSignatures;
  timestamp: number;
}

// This is a workaround to make TypeScript happy about DBSchema extension
// As documented in an issue: https://github.com/jakearchibald/idb/issues/275
type StoreValue = any;
type StoreKey = any;
type IndexKey = any;

// Define the database schema based on idb's expectations
interface ABIDatabase extends DBSchema {
  abis: {
    key: StoreKey;
    value: ABIStoreValue;
    indexes: {
      'by-last-used': IndexKey;
      'by-favorite': IndexKey;
    };
  };
  'signature-history': {
    key: StoreKey;
    value: SignatureHistoryValue;
    indexes: { 'by-last-used': IndexKey };
  };
  'decoding-history': {
    key: StoreKey;
    value: DecodingHistoryValue;
    indexes: { 'by-timestamp': IndexKey };
  };
}

// Database name and version
const DB_NAME = 'eth-toolkit-db';
const DB_VERSION = 4;

// Initialize the database
async function getDB(): Promise<IDBPDatabase<ABIDatabase>> {
  return openDB<ABIDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // When creating a new database
      if (oldVersion < 1) {
        // Create a store for ABIs
        const abiStore = db.createObjectStore('abis', { keyPath: 'id' });
        // Create an index for sorting by last used
        abiStore.createIndex('by-last-used', 'lastUsed');
        // Add favorite index
        abiStore.createIndex('by-favorite', 'isFavorite');
      }

      // Upgrade to version 2: Add signature history store
      if (oldVersion < 2) {
        // Create a store for signature selection history
        const signatureStore = db.createObjectStore('signature-history', {
          keyPath: 'hexSignature',
        });
        // Create an index for sorting by last used
        signatureStore.createIndex('by-last-used', 'lastUsed');
      }

      // Upgrade to version 3: Add favorite functionality
      if (oldVersion < 3) {
        try {
          // Get transaction to the ABIs store
          if (db.objectStoreNames.contains('abis')) {
            const abiStore = db.transaction('abis', 'readwrite').store;

            try {
              // Using function reference to avoid TypeScript error
              if (typeof abiStore.createIndex === 'function') {
                (abiStore.createIndex as Function)('by-favorite', 'isFavorite');
              }
            } catch (e) {
              // Index might already exist or other issue
              console.error('Error creating index:', e);
            }

            // Use a simple approach with a variable to track the cursor
            let cursorRequest = abiStore.openCursor();
            let processCursor = async () => {
              try {
                let cursor = await cursorRequest;
                if (cursor) {
                  // Type assertion with more specific approach
                  const value = cursor.value as Record<string, any>;
                  if (value && typeof value === 'object' && !('isFavorite' in value)) {
                    value.isFavorite = false;
                    cursor.update(value as any);
                  }
                  // Continue to next record
                  await cursor.continue().then(processCursor);
                }
              } catch (err) {
                console.error('Error processing cursor:', err);
              }
            };

            // Start processing
            cursorRequest.then(processCursor);
          }
        } catch (error) {
          console.error('Error during database upgrade:', error);
        }
      }

      // Upgrade to version 4: Add decoding history store
      if (oldVersion < 4) {
        // Create a store for decoding history
        if (!db.objectStoreNames.contains('decoding-history')) {
          const historyStore = db.createObjectStore('decoding-history', { keyPath: 'id' });
          // Create an index for sorting by timestamp
          historyStore.createIndex('by-timestamp', 'timestamp');
        }
      }
    },
  });
}

/**
 * Interface for ABI records
 */
export interface ABIRecord {
  id: string;
  name: string;
  abi: string;
  createdAt: number;
  lastUsed: number;
  isFavorite: boolean;
}

/**
 * Save an ABI to IndexedDB
 * @param name Name for the ABI
 * @param abi ABI JSON string
 * @returns Promise resolving to the ID of the saved ABI
 */
export async function saveABI(name: string, abi: string): Promise<string> {
  const db = await getDB();

  // Generate a unique ID
  const id = crypto.randomUUID();
  const timestamp = Date.now();

  // Create the ABI record
  const abiRecord: ABIRecord = {
    id,
    name,
    abi,
    createdAt: timestamp,
    lastUsed: timestamp,
    isFavorite: false,
  };

  // Save to the database
  await db.put('abis', abiRecord);
  return id;
}

/**
 * Load an ABI by ID
 * @param id ABI ID
 * @returns Promise resolving to the ABI record or null
 */
export async function loadABI(id: string): Promise<ABIRecord | null> {
  const db = await getDB();

  // Get the ABI record
  const abiRecord = await db.get('abis', id);

  if (abiRecord) {
    // Update last used timestamp
    await db.put('abis', {
      ...abiRecord,
      lastUsed: Date.now(),
    });
    return abiRecord;
  }

  return null;
}

/**
 * Get all saved ABIs
 * @param limit Maximum number of ABIs to return (default: 50)
 * @param prioritizeFavorites Whether to sort favorites first (default: true)
 * @returns Promise resolving to an array of ABI records
 */
export async function getAllABIs(limit = 50, prioritizeFavorites = true): Promise<ABIRecord[]> {
  const db = await getDB();

  // Get ABIs sorted by last used (most recent first)
  const index = db.transaction('abis').store.index('by-last-used');
  const abis = await index.getAll(null, limit);

  if (prioritizeFavorites) {
    // Sort first by favorite status (favorites first), then by last used time (descending)
    return abis.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      return b.lastUsed - a.lastUsed;
    });
  } else {
    // Sort by last used time only (descending)
    return abis.sort((a, b) => b.lastUsed - a.lastUsed);
  }
}

/**
 * Delete an ABI by ID
 * @param id ABI ID to delete
 * @returns Promise resolving when the ABI is deleted
 */
export async function deleteABI(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('abis', id);
}

export interface SignatureHistoryRecord {
  hexSignature: string; // Hex signature (e.g., 0x70a08231)
  selectedSignature: string; // Selected text signature (e.g., balanceOf(address))
  lastUsed: number;
}

export interface DecodingHistoryRecord {
  id: string;
  calldata: string;
  result: DecodedFunctionWithSignatures;
  timestamp: number;
}

/**
 * Save a signature selection to history
 * @param hexSignature Function selector (e.g., 0x70a08231)
 * @param selectedSignature The selected function signature text
 * @returns Promise resolving when saved
 */
export async function saveSignatureSelection(
  hexSignature: string,
  selectedSignature: string
): Promise<void> {
  const db = await getDB();

  // Always store the hex signature with 0x prefix
  const formattedHexSig = hexSignature.startsWith('0x') ? hexSignature : `0x${hexSignature}`;

  // Create or update the history record
  await db.put('signature-history', {
    hexSignature: formattedHexSig,
    selectedSignature,
    lastUsed: Date.now(),
  });
}

/**
 * Get the most recently selected signature for a given function selector
 * @param hexSignature Function selector to look up
 * @returns Promise resolving to the selected signature or null if not found
 */
export async function getLastSelectedSignature(hexSignature: string): Promise<string | null> {
  const db = await getDB();

  // Always query with 0x prefix
  const formattedHexSig = hexSignature.startsWith('0x') ? hexSignature : `0x${hexSignature}`;

  try {
    const record = await db.get('signature-history', formattedHexSig);
    return record ? record.selectedSignature : null;
  } catch (error) {
    console.error('Error getting signature history:', error);
    return null;
  }
}

/**
 * Get all saved signature history
 * @param limit Maximum number of records to return (default: 100)
 * @returns Promise resolving to an array of signature history records
 */
export async function getAllSignatureHistory(limit = 100): Promise<SignatureHistoryRecord[]> {
  const db = await getDB();

  try {
    // Get signature history sorted by last used (most recent first)
    const index = db.transaction('signature-history').store.index('by-last-used');
    const records = await index.getAll(null, limit);

    // Sort by last used time (descending)
    return records.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error getting all signature history:', error);
    return [];
  }
}

/**
 * Toggle favorite status for an ABI
 * @param id ABI ID to toggle favorite status
 * @returns Promise resolving to the updated favorite status
 */
export async function toggleABIFavorite(id: string): Promise<boolean> {
  const db = await getDB();

  try {
    // Get the current ABI record
    const abiRecord = await db.get('abis', id);

    if (!abiRecord) {
      throw new Error(`ABI with ID ${id} not found`);
    }

    // Toggle the favorite status
    const updatedRecord = {
      ...abiRecord,
      isFavorite: !abiRecord.isFavorite,
    };

    // Save the updated record
    await db.put('abis', updatedRecord);

    // Return the new favorite status
    return updatedRecord.isFavorite;
  } catch (error) {
    console.error('Error toggling ABI favorite status:', error);
    throw error;
  }
}

/**
 * Get all favorite ABIs
 * @param limit Maximum number of ABIs to return (default: 50)
 * @returns Promise resolving to an array of favorite ABI records
 */
export async function getFavoriteABIs(limit = 50): Promise<ABIRecord[]> {
  const db = await getDB();

  try {
    // Create a range to only get records where isFavorite is true
    const range = IDBKeyRange.only(true);

    // Get favorite ABIs using the by-favorite index
    const index = db.transaction('abis').store.index('by-favorite');
    const favorites = await index.getAll(range, limit);

    // Sort by last used time (descending)
    return favorites.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error getting favorite ABIs:', error);
    return [];
  }
}

export async function saveDecodingResult(
  calldata: string,
  result: DecodedFunctionWithSignatures
): Promise<string> {
  const db = await getDB();

  const id = crypto.randomUUID();
  const timestamp = Date.now();

  const historyRecord: DecodingHistoryRecord = {
    id,
    calldata,
    result,
    timestamp,
  };

  await db.put('decoding-history', historyRecord);
  return id;
}

export async function getDecodingHistory(limit = 20): Promise<DecodingHistoryRecord[]> {
  const db = await getDB();

  try {
    const index = db.transaction('decoding-history').store.index('by-timestamp');
    const histories = await index.getAll(null, limit);

    return histories.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting decoding history:', error);
    return [];
  }
}

export async function deleteDecodingRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('decoding-history', id);
}

export async function clearDecodingHistory(): Promise<void> {
  const db = await getDB();

  try {
    const tx = db.transaction('decoding-history', 'readwrite');
    await tx.objectStore('decoding-history').clear();
    await tx.done;
  } catch (error) {
    console.error('Error clearing decoding history:', error);
    throw error;
  }
}
