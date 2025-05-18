"use client";

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface ABIDatabase extends DBSchema {
  'abis': {
    key: string;
    value: {
      id: string;
      name: string;
      abi: string;
      createdAt: number;
      lastUsed: number;
    };
    indexes: { 'by-last-used': number };
  };
  'signature-history': {
    key: string; // hex signature
    value: {
      hexSignature: string;
      selectedSignature: string;
      lastUsed: number;
    };
    indexes: { 'by-last-used': number };
  };
}

// Database name and version
const DB_NAME = 'eth-toolkit-db';
const DB_VERSION = 2;

// Initialize the database
async function getDB(): Promise<IDBPDatabase<ABIDatabase>> {
  return openDB<ABIDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // When creating a new database
      if (oldVersion < 1) {
        // Create a store for ABIs
        const abiStore = db.createObjectStore('abis', { keyPath: 'id' });
        // Create an index for sorting by last used
        abiStore.createIndex('by-last-used', 'lastUsed');
      }

      // Upgrade to version 2: Add signature history store
      if (oldVersion < 2) {
        // Create a store for signature selection history
        const signatureStore = db.createObjectStore('signature-history', { keyPath: 'hexSignature' });
        // Create an index for sorting by last used
        signatureStore.createIndex('by-last-used', 'lastUsed');
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
    lastUsed: timestamp
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
      lastUsed: Date.now()
    });
    return abiRecord;
  }
  
  return null;
}

/**
 * Get all saved ABIs
 * @param limit Maximum number of ABIs to return (default: 50)
 * @returns Promise resolving to an array of ABI records
 */
export async function getAllABIs(limit = 50): Promise<ABIRecord[]> {
  const db = await getDB();
  
  // Get ABIs sorted by last used (most recent first)
  const index = db.transaction('abis').store.index('by-last-used');
  const abis = await index.getAll(null, limit);
  
  // Sort by last used time (descending)
  return abis.sort((a, b) => b.lastUsed - a.lastUsed);
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

/**
 * Interface for signature history records
 */
export interface SignatureHistoryRecord {
  hexSignature: string;  // Hex signature (e.g., 0x70a08231)
  selectedSignature: string; // Selected text signature (e.g., balanceOf(address))
  lastUsed: number;
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
    lastUsed: Date.now()
  });
}

/**
 * Get the most recently selected signature for a given function selector
 * @param hexSignature Function selector to look up
 * @returns Promise resolving to the selected signature or null if not found
 */
export async function getLastSelectedSignature(
  hexSignature: string
): Promise<string | null> {
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