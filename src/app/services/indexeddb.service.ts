import { Injectable } from '@angular/core';
import { Board, List, Task } from '../models/board.model';

export interface AppState {
  boards: Board[];
  lists: List[];
  tasks: Task[];
  activeBoardId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private readonly DB_NAME = 'pulse-db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'app-state';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  async saveState(state: AppState): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(state, 'current-state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadState(): Promise<AppState | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get('current-state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            ...result,
            boards: result.boards.map((b: any) => ({
              ...b,
              createdAt: new Date(b.createdAt),
              updatedAt: new Date(b.updatedAt)
            })),
            lists: result.lists.map((l: any) => ({
              ...l,
              createdAt: new Date(l.createdAt),
              updatedAt: new Date(l.updatedAt)
            })),
            tasks: result.tasks.map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
              dueDate: t.dueDate ? new Date(t.dueDate) : undefined
            }))
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async clearState(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete('current-state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
