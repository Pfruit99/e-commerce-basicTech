"use client";

/**
 * Store externo respaldado por localStorage, para usar con useSyncExternalStore.
 * `parse` valida lo leído porque el almacenamiento no es de confianza.
 */
export function createPersistedStore<T>(key: string, empty: T, parse: (raw: unknown) => T) {
  let state = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  function read(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? parse(JSON.parse(raw)) : empty;
    } catch {
      return empty;
    }
  }

  function getSnapshot() {
    if (!loaded) {
      state = read();
      loaded = true;
    }
    return state;
  }

  function commit(next: T) {
    state = next;
    loaded = true;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Sin almacenamiento disponible: el estado vive solo en memoria.
    }
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        state = read();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { subscribe, getSnapshot, getServerSnapshot: () => empty, commit };
}
