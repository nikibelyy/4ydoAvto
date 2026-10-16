import type { CalendarEvent } from "@/types/calendar";

const DB_NAME = "work-calendar";
const DB_VERSION = 1;
const STORE_NAME = "events";

function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB недоступен в этом окружении."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("start", "start");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Не удалось открыть базу."));
    request.onblocked = () => reject(new Error("Обновление базы заблокировано другой вкладкой."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = action(tx.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Операция с базой не удалась."));
      tx.onabort = () => reject(tx.error ?? new Error("Транзакция отменена."));
    });
  } finally {
    db.close();
  }
}

export const eventStorage = {
  async getAll(): Promise<CalendarEvent[]> {
    const items = await withStore<CalendarEvent[]>("readonly", store => store.getAll());
    return items.sort((a, b) => a.start.localeCompare(b.start));
  },
  async put(event: CalendarEvent): Promise<void> {
    await withStore<IDBValidKey>("readwrite", store => store.put(event));
  },
  async remove(id: string): Promise<void> {
    await withStore<undefined>("readwrite", store => store.delete(id));
  },
  async replaceAll(events: CalendarEvent[]): Promise<void> {
    const db = await openDB();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        for (const event of events) store.put(event);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Не удалось заменить события."));
        tx.onabort = () => reject(tx.error ?? new Error("Импорт отменён."));
      });
    } finally {
      db.close();
    }
  }
};
