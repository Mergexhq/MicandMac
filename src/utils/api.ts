// src/utils/api.ts — Shopify Storefront Ajax API wrappers

import type {
  ShopifyCart,
  ShopifyCartItem,
  CartAddPayload,
  CartChangePayload,
} from '../types/shopify';

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function shopifyFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: HEADERS });
  if (!res.ok) {
    const error = await res.json().catch(() => ({})) as { description?: string };
    throw new Error(error.description ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const CartAPI = {
  get: (): Promise<ShopifyCart> =>
    shopifyFetch('/cart.js'),

  add: (payload: CartAddPayload): Promise<ShopifyCartItem> =>
    shopifyFetch('/cart/add.js', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  change: (payload: CartChangePayload): Promise<ShopifyCart> =>
    shopifyFetch('/cart/change.js', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (updates: Record<string, number>): Promise<ShopifyCart> =>
    shopifyFetch('/cart/update.js', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    }),

  addNote: (note: string): Promise<ShopifyCart> =>
    shopifyFetch('/cart/update.js', {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
};
