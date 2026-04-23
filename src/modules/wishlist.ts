/**
 * wishlist.ts
 * localStorage-backed wishlist with AJAX product card rendering.
 * Also updates the wishlist badge count in the header.
 * 
 * Heart toggle: data-wishlist-toggle + data-product-handle
 * Wishlist page grid: #WishlistGrid populated by rendering /products/<handle>.json
 */

import { GuestStore } from './guest-store';
import { Header }     from './header';

const STORAGE_KEY = 'mm_wishlist';
const GRID_ID     = 'WishlistGrid';
const EMPTY_ID    = 'WishlistEmpty';

export class Wishlist {
  constructor() {
    this._initToggleButtons();
    this._updateAllHearts();
    this._renderWishlistPage();
    Header.updateWishlistCount(this._getHandles().length);
  }

  // ------------------------------------------------------------------
  // Get / save
  // ------------------------------------------------------------------
  private _getHandles(): string[] {
    return GuestStore.get<string[]>(STORAGE_KEY, []);
  }

  private _saveHandles(handles: string[]): void {
    GuestStore.set(STORAGE_KEY, handles);
  }

  private _contains(handle: string): boolean {
    return this._getHandles().includes(handle);
  }

  private _toggle(handle: string): boolean {
    const handles = this._getHandles();
    const idx = handles.indexOf(handle);
    if (idx >= 0) {
      handles.splice(idx, 1);
    } else {
      handles.unshift(handle);
    }
    this._saveHandles(handles);
    Header.updateWishlistCount(handles.length);
    return idx < 0; // true = added
  }

  // ------------------------------------------------------------------
  // Heart buttons
  // ------------------------------------------------------------------
  private _initToggleButtons(): void {
    document.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-wishlist-toggle]');
      if (!btn) return;

      const handle = btn.dataset.productHandle;
      if (!handle) return;

      const added = this._toggle(handle);
      this._setButtonState(btn, added);

      // If we are on the wishlist page and it was removed, hide the card
      if (!added && window.location.pathname.includes('wishlist')) {
        const card = btn.closest('.pc') as HTMLElement;
        if (card) {
          card.style.transition = 'opacity 0.3s ease';
          card.style.opacity = '0';
          setTimeout(() => {
            card.remove();
            this._checkEmpty();
          }, 300);
        }
      }
    });
  }

  private _setButtonState(btn: HTMLButtonElement, wishlisted: boolean): void {
    btn.classList.toggle('is-wishlisted', wishlisted);
    btn.setAttribute('aria-pressed', String(wishlisted));
    const label = btn.querySelector('span');
    if (label) label.textContent = wishlisted ? 'Saved ♥' : 'Save to Wishlist';
  }

  private _updateAllHearts(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-wishlist-toggle]').forEach(btn => {
      const handle = btn.dataset.productHandle;
      if (handle) this._setButtonState(btn, this._contains(handle));
    });
  }

  // ------------------------------------------------------------------
  // Wishlist page
  // ------------------------------------------------------------------
  private async _renderWishlistPage(): Promise<void> {
    const grid  = document.getElementById(GRID_ID);
    if (!grid) return;

    const handles = this._getHandles();

    if (handles.length === 0) {
      this._checkEmpty();
      return;
    }

    // Fetch each product and render
    const cards = await Promise.all(handles.map(h => this._fetchProductCard(h)));
    grid.innerHTML = cards.filter(Boolean).join('');

    this._checkEmpty();
  }

  private async _fetchProductCard(handle: string): Promise<string> {
    try {
      const res = await fetch(`/products/${handle}?section_id=wishlist-item`);
      if (!res.ok) return '';
      const text = await res.text();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      
      const card = tempDiv.querySelector('.pc');
      if (card) {
        return card.outerHTML;
      }
      return '';
    } catch {
      return '';
    }
  }

  private _checkEmpty(): void {
    const grid  = document.getElementById(GRID_ID);
    const empty = document.getElementById(EMPTY_ID);
    const actions = document.getElementById('WishlistActions');
    
    if (!grid || !empty) return;

    const hasCards = grid.querySelector('.pc');
    empty.style.display = hasCards ? 'none' : '';
    grid.style.display = hasCards ? 'grid' : 'none';
    
    if (actions) {
      actions.style.display = hasCards ? 'block' : 'none';
    }
  }
}
