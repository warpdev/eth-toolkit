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
}

// Database name and version
const DB_NAME = 'eth-toolkit-db';
const DB_VERSION = 1;

// Initialize the database
async function getDB(): Promise<IDBPDatabase<ABIDatabase>> {
  return openDB<ABIDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store for ABIs
      const abiStore = db.createObjectStore('abis', { keyPath: 'id' });
      // Create an index for sorting by last used
      abiStore.createIndex('by-last-used', 'lastUsed');
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