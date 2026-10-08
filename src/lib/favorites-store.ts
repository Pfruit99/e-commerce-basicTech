"use client";

import { useSyncExternalStore } from "react";

import { sanitizeIds, toggleFavorite } from "./favorites";
import { createPersistedStore } from "./persisted-store";

const EMPTY: string[] = [];
const store = createPersistedStore<string[]>("basictech.favorites.v1", EMPTY, sanitizeIds);

/** Favoritos solo de interfaz: persisten en localStorage hasta que exista backend. */
export function useFavorites() {
  const ids = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return {
    ids,
    isFavorite: (id: string) => ids.includes(id),
    toggle: (id: string) => store.commit(toggleFavorite(store.getSnapshot(), id)),
  };
}
