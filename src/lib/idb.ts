import type { Journal, LogEntry, Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

const DB_NAME = "captains-log";
const DB_VERSION = 1;

type MetaKey = "journals" | "entries" | "settings";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
      if (!db.objectStoreNames.contains("audio")) db.createObjectStore("audio");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function getMeta<T>(key: MetaKey): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("meta").objectStore("meta").get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function setMeta<T>(key: MetaKey, value: T): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction("meta", "readwrite");
    tx.objectStore("meta").put(value, key);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function loadJournals(): Promise<Journal[] | undefined> {
  return getMeta<Journal[]>("journals");
}

export async function saveJournals(journals: Journal[]): Promise<void> {
  return setMeta("journals", journals);
}

export async function loadEntries(): Promise<LogEntry[] | undefined> {
  return getMeta<LogEntry[]>("entries");
}

export async function saveEntries(entries: LogEntry[]): Promise<void> {
  return setMeta("entries", entries);
}

export async function loadSettings(): Promise<Settings> {
  const stored = await getMeta<Settings>("settings");
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  return setMeta("settings", settings);
}

export async function saveAudio(entryId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction("audio", "readwrite");
    tx.objectStore("audio").put(blob, entryId);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function loadAudio(entryId: string): Promise<Blob | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("audio").objectStore("audio").get(entryId);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteAudio(entryId: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction("audio", "readwrite");
    tx.objectStore("audio").delete(entryId);
    await txDone(tx);
  } finally {
    db.close();
  }
}
