import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface VideoRecord {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  blob: Blob;
  size: number; // bytes
  mimeType: string;
}

interface DisguiseDBSchema extends DBSchema {
  videos: {
    key: string;
    value: VideoRecord;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'ScreenDisguiseVaultDB';
const DB_VERSION = 1;

class IndexedDBVault {
  private dbPromise: Promise<IDBPDatabase<DisguiseDBSchema>>;

  constructor() {
    this.dbPromise = openDB<DisguiseDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('videos')) {
          const store = db.createObjectStore('videos', { keyPath: 'id' });
          store.createIndex('by-date', 'timestamp');
        }
      },
    });
  }

  public async saveVideo(blob: Blob, duration: number): Promise<string> {
    const db = await this.dbPromise;
    const id = `REC_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: VideoRecord = {
      id,
      timestamp: Date.now(),
      duration,
      blob,
      size: blob.size,
      mimeType: blob.type || 'video/webm',
    };
    await db.put('videos', record);
    return id;
  }

  public async getAllVideos(): Promise<VideoRecord[]> {
    const db = await this.dbPromise;
    const all = await db.getAllFromIndex('videos', 'by-date');
    return all.reverse(); // Newest first
  }

  public async deleteVideo(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('videos', id);
  }

  public async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('videos');
  }

  public async getCount(): Promise<number> {
    const db = await this.dbPromise;
    return await db.count('videos');
  }
}

export const indexedDBVault = new IndexedDBVault();
