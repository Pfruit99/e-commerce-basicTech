"use client";

import { useSyncExternalStore } from "react";

import { addItem, removeItem, sanitizeItems, setQuantity, type CartItem } from "./cart";
import type { Product } from "./mock-data";

const KEY = "basictech.cart.v1";
const EMPTY: CartItem[] = [];

let state: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitizeItems(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartItem[]) {
  state = next;
  loaded = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento disponible: el carrito vive solo en memoria.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
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

function getSnapshot() {
  if (!loaded) {
    state = read();
    loaded = true;
  }
  return state;
}

const getServerSnapshot = () => EMPTY;

/** Carrito solo de interfaz: persiste en localStorage hasta que exista backend. */
export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items,
    add: (product: Product, qty = 1) => commit(addItem(getSnapshot(), product, qty)),
    setQty: (product: Product, qty: number) => commit(setQuantity(getSnapshot(), product, qty)),
    remove: (productId: string) => commit(removeItem(getSnapshot(), productId)),
    clear: () => commit(EMPTY),
  };
}
