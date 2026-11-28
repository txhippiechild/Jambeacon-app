export type SavedTake = { id: number; title: string; createdAt: number; audio: Blob };

const LIMIT = 20;

function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("jambeacon-track-vault", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("takes", { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listTakes(): Promise<SavedTake[]> {
  const db = await openVault();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("takes", "readonly");
      const req = tx.objectStore("takes").getAll();
      req.onsuccess = () => resolve((req.result as SavedTake[]).sort((a,b) => b.id-a.id));
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function saveTake(title: string, audio: Blob): Promise<void> {
  if (!audio.size) throw new Error("Recording is empty");
  const db = await openVault();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("takes", "readwrite");
      const store = tx.objectStore("takes");
      store.add({ title, audio, createdAt: Date.now() });
      const keys = store.getAllKeys();
      keys.onsuccess = () => {
        for (const key of keys.result.slice(0, Math.max(0, keys.result.length - LIMIT))) store.delete(key);
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error("Save aborted"));
      tx.onerror = () => reject(tx.error || new Error("Save failed"));
    });
  } finally { db.close(); }
}

export async function deleteTake(id: number): Promise<void> {
  const db = await openVault();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("takes", "readwrite");
      tx.objectStore("takes").delete(id);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
