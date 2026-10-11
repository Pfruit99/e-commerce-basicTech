"use client";

import { useEffect, useSyncExternalStore } from "react";

import { MAX_IDS, chunk } from "./catalog-api";
import type { CatalogProduct } from "./catalog-types";

/**
 * Caché de productos compartida por el carrito, el checkout y los favoritos, para no pedir dos veces
 * el mismo producto en una visita. `null` marca un id que la API no devolvió (borrado o archivado).
 */
const cache = new Map<string, CatalogProduct | null>();
const pending = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;
let failed = false;

function emit() {
  version++;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function load(ids: string[]) {
  const missing = ids.filter((id) => !cache.has(id) && !pending.has(id));
  if (missing.length === 0) return;
  for (const id of missing) pending.add(id);
  failed = false;
  try {
    await Promise.all(
      chunk(missing, MAX_IDS).map(async (part) => {
        const res = await fetch(`/api/products?ids=${encodeURIComponent(part.join(","))}`);
        if (!res.ok) throw new Error(`GET /api/products respondió ${res.status}`);
        const { items } = (await res.json()) as { items: CatalogProduct[] };
        const found = new Map(items.map((p) => [p.id, p]));
        for (const id of part) cache.set(id, found.get(id) ?? null);
      }),
    );
  } catch (err) {
    failed = true;
    console.error(err);
  } finally {
    for (const id of missing) pending.delete(id);
    emit();
  }
}

/** Resuelve productos por id contra la API. Mientras carga, `find` devuelve `undefined` para los que faltan. */
export function useCatalogProducts(ids: string[]) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const key = ids.join(",");

  useEffect(() => {
    if (key) void load(key.split(","));
  }, [key]);

  return {
    find: (id: string) => cache.get(id) ?? undefined,
    loading: ids.some((id) => !cache.has(id)) && !failed,
    error: failed,
    retry: () => {
      failed = false;
      void load(ids);
    },
  };
}
