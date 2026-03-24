/**
 * search.ts
 * Predictive search drawer:
 *  - Debounced fetch to /search/suggest.json (products + pages)
 *  - Recent searches stored in localStorage
 *  - Clear button, close button, overlay/ESC dismiss
 */

import { Overlay } from './header';

const STORAGE_KEY = 'mm_recent_searches';
const MAX_RECENT  = 5;

const SELECTORS = {
  drawer:     '#SearchDrawer',
  toggle:     '#SearchToggle',
  close:      '#SearchDrawerClose',
  input:      '#SearchDrawerInput',
  clearBtn:   '#SearchDrawerClear',
  results:    '#SearchResults',
  recentWrap: '#SearchRecent',
  recentList: '#SearchRecentList',
} as const;

type SearchResult = {
  title: string;
  url:   string;
  image?: string;
  price?: number;
};

export class Search {
  private drawer:     HTMLElement | null;
  private toggle:     HTMLElement | null;
  private closeBtn:   HTMLElement | null;
  private input:      HTMLInputElement | null;
  private clearBtn:   HTMLElement | null;
  private results:    HTMLElement | null;
  private recentWrap: HTMLElement | null;
  private recentList: HTMLElement | null;

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _currentQuery  = '';

  constructor() {
    this.drawer     = document.querySelector(SELECTORS.drawer);
    this.toggle     = document.querySelector(SELECTORS.toggle);
    this.closeBtn   = document.querySelector(SELECTORS.close);
    this.input      = document.querySelector(SELECTORS.input);
    this.clearBtn   = document.querySelector(SELECTORS.clearBtn);
    this.results    = document.querySelector(SELECTORS.results);
    this.recentWrap = document.querySelector(SELECTORS.recentWrap);
    this.recentList = document.querySelector(SELECTORS.recentList);

    if (!this.drawer) return;
    this._init();
  }

  private _init(): void {
    // Open drawer
    this.toggle?.addEventListener('click', () => this._open());

    // Close button
    this.closeBtn?.addEventListener('click', () => this._close());

    // Overlay click
    Overlay.onClose(() => this._close());

    // ESC
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this._close();
    });

    // Input
    this.input?.addEventListener('input', (e: Event) => {
      const val = (e.target as HTMLInputElement).value.trim();
      this._onInput(val);
    });

    // Clear
    this.clearBtn?.addEventListener('click', () => {
      if (this.input) this.input.value = '';
      this._onInput('');
      this.input?.focus();
    });
  }

  private _open(): void {
    this.drawer?.classList.add('is-open');
    this.drawer?.setAttribute('aria-hidden', 'false');
    Overlay.show();
    this._renderRecent();
    setTimeout(() => this.input?.focus(), 80);
  }

  private _close(): void {
    this.drawer?.classList.remove('is-open');
    this.drawer?.setAttribute('aria-hidden', 'true');
    Overlay.hide();
  }

  private _onInput(query: string): void {
    this._currentQuery = query;

    // Show / hide clear button
    if (this.clearBtn) {
      (this.clearBtn as HTMLButtonElement).hidden = query.length === 0;
    }

    if (query.length === 0) {
      this._clearResults();
      this._showRecent(true);
      return;
    }

    this._showRecent(false);

    // Debounce 280ms
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      if (this._currentQuery.length > 0) this._fetchResults(this._currentQuery);
    }, 280);
  }

  private async _fetchResults(query: string): Promise<void> {
    const url = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,page&resources[limit]=5&resources[options][unavailable_products]=last`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      const products = data?.resources?.results?.products || [];
      const pages    = data?.resources?.results?.pages    || [];

      if (query !== this._currentQuery) return; // stale

      if (products.length === 0 && pages.length === 0) {
        this._renderNoResults(query);
        return;
      }

      this._renderResults(products, pages, query);
    } catch (err) {
      console.warn('[Search] fetch error', err);
    }
  }

  private _renderResults(products: SearchResult[], pages: SearchResult[], query: string): void {
    if (!this.results) return;

    const productHTML = products.map(p => `
      <a href="${p.url}" class="search-result-item" data-query="${this._escape(query)}">
        ${p.image
          ? `<img class="search-result-img" src="${p.image}" alt="" width="52" height="52" loading="lazy">`
          : `<div class="search-result-img"></div>`
        }
        <div class="search-result-info">
          <p class="search-result-title">${this._highlight(p.title, query)}</p>
          ${p.price != null ? `<p class="search-result-price">₹${(p.price / 100).toFixed(0)}</p>` : ''}
        </div>
      </a>
    `).join('');

    const pagesHTML = pages.length
      ? `<div class="search-drawer__label" style="margin-top:var(--space-4)">Pages</div>` +
        pages.map(p => `
          <a href="${p.url}" class="search-result-item">
            <div class="search-result-info">
              <p class="search-result-title">${this._highlight(p.title, query)}</p>
            </div>
          </a>
        `).join('')
      : '';

    this.results.innerHTML = `
      <p class="search-drawer__label">Products</p>
      ${productHTML}
      ${pagesHTML}
    `;

    // Save to recent on click
    this.results.querySelectorAll('[data-query]').forEach(el => {
      el.addEventListener('click', () => this._saveRecent(query));
    });
  }

  private _renderNoResults(query: string): void {
    if (!this.results) return;
    this.results.innerHTML = `
      <div class="search-no-results">
        <p>No results for "<strong>${this._escape(query)}</strong>"</p>
        <p style="margin-top:var(--space-2)">Try a different keyword</p>
      </div>
    `;
  }

  private _clearResults(): void {
    if (this.results) this.results.innerHTML = '';
  }

  // -- Recent searches --
  private _getRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  private _saveRecent(query: string): void {
    const recent = this._getRecent().filter(q => q.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    if (recent.length > MAX_RECENT) recent.pop();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recent)); } catch {}
  }

  private _renderRecent(): void {
    const recent = this._getRecent();
    if (!this.recentList) return;
    if (recent.length === 0) { this._showRecent(false); return; }

    this._showRecent(true);
    this.recentList.innerHTML = recent.map(q => `
      <a href="/search?type=product&q=${encodeURIComponent(q)}" class="search-drawer__recent-tag">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        ${this._escape(q)}
      </a>
    `).join('');
  }

  private _showRecent(show: boolean): void {
    if (this.recentWrap) {
      this.recentWrap.style.display = show ? '' : 'none';
    }
  }

  // Helpers
  private _escape(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private _highlight(text: string, query: string): string {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }
}
