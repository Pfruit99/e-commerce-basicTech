"use client";

import { useSyncExternalStore } from "react";

import { addItem, removeItem, sanitizeItems, setQuantity, type CartItem } from "./cart";
import type { CatalogProduct } from "./catalog-types";
import { createPersistedStore } from "./persisted-store";

const EMPTY: CartItem[] = [];
const store = createPersistedStore<CartItem[]>("basictech.cart.v1", EMPTY, sanitizeItems);

/** Carrito solo de interfaz: persiste en localStorage hasta que exista backend. */
export function useCart() {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return {
    items,
    add: (product: CatalogProduct, qty = 1) => store.commit(addItem(store.getSnapshot(), product, qty)),
    setQty: (product: CatalogProduct, qty: number) => store.commit(setQuantity(store.getSnapshot(), product, qty)),
    remove: (productId: string) => store.commit(removeItem(store.getSnapshot(), productId)),
    clear: () => store.commit(EMPTY),
  };
}
