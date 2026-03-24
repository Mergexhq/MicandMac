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
    });

    // Remove buttons on wishlist page
    document.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-wishlist-remove]');
      if (!btn) return;

      const handle = btn.dataset.wishlistRemove;
      if (!handle) return;

      const handles = this._getHandles().filter(h => h !== handle);
      this._saveHandles(handles);
      Header.updateWishlistCount(handles.length);

      const card = document.querySelector(`.wishlist-card[data-product-handle="${handle}"]`);
      card?.remove();

      this._checkEmpty();
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
      const res  = await fetch(`/products/${handle}.json`);
      const data = await res.json();
      const p    = data.product;
      const v    = p.variants?.[0];
      const img  = p.images?.[0]?.src || '';
      const imgSrc = img ? img.replace('?', '?width=600&') : '';

      return `
        <div class="product-card wishlist-card" data-product-handle="${p.handle}">
          <div class="product-card__media">
            <a href="/products/${p.handle}" class="product-card__img-link">
              ${imgSrc ? `<img src="${imgSrc}" alt="${p.title}" width="600" height="600" loading="lazy" class="product-card__img product-card__img--primary">` : ''}
            </a>
            <button class="product-card__badge-btn wishlist-card__remove" data-wishlist-remove="${p.handle}" aria-label="Remove from wishlist">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="product-card__info">
            <h3 class="product-card__title"><a href="/products/${p.handle}">${p.title}</a></h3>
            ${v ? `<p class="price__current">₹${(v.price / 100).toFixed(0)}</p>` : ''}
            ${v?.available
              ? `<button class="btn btn--primary btn--sm btn--full" data-atc data-variant-id="${v.id}">Add to Cart</button>`
              : `<button class="btn btn--secondary btn--sm btn--full" disabled>Sold Out</button>`
            }
          </div>
        </div>
      `;
    } catch {
      return '';
    }
  }

  private _checkEmpty(): void {
    const grid  = document.getElementById(GRID_ID);
    const empty = document.getElementById(EMPTY_ID);
    if (!grid || !empty) return;

    const hasCards = grid.querySelector('.wishlist-card');
    empty.style.display = hasCards ? 'none' : '';
  }
}
