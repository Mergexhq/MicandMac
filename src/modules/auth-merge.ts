/**
 * auth-merge.ts
 * After a guest purchases and then logs in/creates account,
 * merge localhost wishlist handles into customer account.
 * 
 * Ships a POST to a Shopify metafield-writing function endpoint
 * (or falls back to just clearing local storage).
 */

import { GuestStore } from './guest-store';

const WISHLIST_KEY = 'mm_wishlist';

export class AuthMerge {
  constructor() {
    const isLoggedIn = (window as Window & { customerLoggedIn?: boolean }).customerLoggedIn;
    if (isLoggedIn) {
      this._mergePendingData();
    }
  }

  private async _mergePendingData(): Promise<void> {
    const handles = GuestStore.get<string[]>(WISHLIST_KEY, []);
    if (handles.length === 0) return;

    try {
      // Attempt to sync to a custom Shopify app function endpoint if configured
      const endpoint = (window as Window & { wishlistSyncUrl?: string }).wishlistSyncUrl;
      if (endpoint) {
        await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ handles }),
        });
      }
      // Clear local handles after sync
      GuestStore.remove(WISHLIST_KEY);
    } catch (err) {
      console.warn('[AuthMerge] Could not sync wishlist:', err);
    }
  }
}
