/**
 * recently-viewed.ts
 * Tracks up to 8 recently viewed product handles in localStorage.
 * Renders product cards into #RecentlyViewedGrid on the PDP and cart page.
 */

import { GuestStore } from './guest-store';

const STORAGE_KEY = 'mm_recently_viewed';
const MAX_ITEMS   = 8;

export class RecentlyViewed {
  constructor() {
    this._trackCurrentProduct();
    this._renderGrid();
  }

  // ------------------------------------------------------------------
  // Tracking
  // ------------------------------------------------------------------
  private _getHandles(): string[] {
    return GuestStore.get<string[]>(STORAGE_KEY, []);
  }

  private _trackCurrentProduct(): void {
    const handle = (window as Window & { productHandle?: string }).productHandle;
    if (!handle) return;

    const handles = this._getHandles().filter(h => h !== handle);
    handles.unshift(handle);
    if (handles.length > MAX_ITEMS) handles.pop();

    GuestStore.set(STORAGE_KEY, handles);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  private async _renderGrid(): Promise<void> {
    const section = document.getElementById('RecentlyViewedSection');
    const grid    = document.getElementById('RecentlyViewedGrid');
    if (!section || !grid) return;

    const currentHandle = (window as Window & { productHandle?: string }).productHandle;
    const handles = this._getHandles().filter(h => h !== currentHandle).slice(0, 4);

    if (handles.length === 0) return;

    const cards = await Promise.all(handles.map(h => this._fetchCard(h)));
    const html  = cards.filter(Boolean).join('');

    if (!html) return;

    grid.innerHTML = html;
    section.style.display = '';
  }

  private async _fetchCard(handle: string): Promise<string> {
    try {
      const res  = await fetch(`/products/${handle}.json`);
      const data = await res.json();
      const p    = data.product;
      const v    = p.variants?.[0];
      const img  = p.images?.[0]?.src?.replace('?', '?width=600&') || '';

      return `
        <div class="product-card">
          <div class="product-card__media">
            <a href="/products/${p.handle}" class="product-card__img-link">
              ${img ? `<img src="${img}" alt="${p.title}" width="600" height="600" loading="lazy" class="product-card__img product-card__img--primary">` : ''}
            </a>
          </div>
          <div class="product-card__info">
            <h3 class="product-card__title"><a href="/products/${p.handle}">${p.title}</a></h3>
            ${v ? `<div><span class="price__current">₹${(v.price / 100).toFixed(0)}</span></div>` : ''}
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
}
