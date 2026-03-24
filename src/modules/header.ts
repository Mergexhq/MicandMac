/**
 * header.ts
 * Handles:
 *  - Sticky header (adds .is-scrolled on scroll)
 *  - Mobile nav open / close
 *  - Cart drawer toggle
 *  - Wishlist count badge update
 *  - Shared overlay management
 *  - ESC key closes all drawers
 */

import { Overlay } from './overlay';

const SELECTORS = {
  header:       '#SiteHeader',
  burger:       '#NavToggle',
  mobileNav:    '#MobileNav',
  navClose:     '#NavClose',
  cartToggle:   '#CartToggle',
  cartDrawer:   '#CartDrawer',
  cartCount:    '#CartCount',
  wishlistCount: '.wishlist-count',
} as const;

export class Header {
  private header: HTMLElement;
  private burger: HTMLButtonElement | null;
  private mobileNav: HTMLElement | null;
  private navClose: HTMLButtonElement | null;
  private cartToggle: HTMLButtonElement | null;
  private cartDrawer: HTMLElement | null;
  private _scrollBound: () => void;

  constructor() {
    this.header     = document.querySelector(SELECTORS.header) as HTMLElement;
    this.burger     = document.querySelector(SELECTORS.burger);
    this.mobileNav  = document.querySelector(SELECTORS.mobileNav);
    this.navClose   = document.querySelector(SELECTORS.navClose);
    this.cartToggle = document.querySelector(SELECTORS.cartToggle);
    this.cartDrawer = document.querySelector(SELECTORS.cartDrawer);

    if (!this.header) return;

    this._scrollBound = this._onScroll.bind(this);
    this._init();
  }

  private _init(): void {
    // Sticky behaviour
    window.addEventListener('scroll', this._scrollBound, { passive: true });
    this._onScroll();

    // Burger → open mobile nav
    this.burger?.addEventListener('click', () => this._openMobileNav());

    // Nav close button
    this.navClose?.addEventListener('click', () => this._closeMobileNav());

    // Cart toggle
    this.cartToggle?.addEventListener('click', () => this._toggleCart());

    // Overlay click → close everything
    Overlay.onClose(() => {
      this._closeMobileNav();
      this._closeCart();
    });

    // ESC closes all drawers
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._closeMobileNav();
        this._closeCart();
      }
    });
  }

  private _onScroll(): void {
    this.header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  private _openMobileNav(): void {
    this.mobileNav?.classList.add('is-open');
    this.mobileNav?.setAttribute('aria-hidden', 'false');
    this.burger?.classList.add('is-open');
    this.burger?.setAttribute('aria-expanded', 'true');
    Overlay.show();
    document.body.style.overflow = 'hidden';
  }

  private _closeMobileNav(): void {
    this.mobileNav?.classList.remove('is-open');
    this.mobileNav?.setAttribute('aria-hidden', 'true');
    this.burger?.classList.remove('is-open');
    this.burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    Overlay.hide();
  }

  private _toggleCart(): void {
    const isOpen = this.cartDrawer?.classList.contains('is-open');
    if (isOpen) {
      this._closeCart();
    } else {
      this._openCart();
    }
  }

  private _openCart(): void {
    this.cartDrawer?.classList.add('is-open');
    this.cartDrawer?.setAttribute('aria-hidden', 'false');
    Overlay.show();
    document.body.style.overflow = 'hidden';
  }

  private _closeCart(): void {
    this.cartDrawer?.classList.remove('is-open');
    this.cartDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    Overlay.hide();
  }

  /** Called by cart.ts when item count changes */
  static updateCartCount(count: number): void {
    const badge = document.querySelector<HTMLElement>('#CartCount');
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle('cart-count--hidden', count === 0);

    // Bump animation
    badge.classList.remove('bump');
    void badge.offsetWidth; // reflow
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 400);
  }

  /** Called by wishlist.ts when wishlist count changes */
  static updateWishlistCount(count: number): void {
    const badges = document.querySelectorAll<HTMLElement>(SELECTORS.wishlistCount);
    badges.forEach(badge => {
      badge.textContent = count > 0 ? String(count) : '';
      badge.classList.toggle('is-hidden', count === 0);
    });
  }
}

/**
 * Lightweight overlay singleton (re-exported for cart, nav, search)
 */
export const Overlay = (() => {
  const el = document.querySelector<HTMLElement>('#SiteOverlay');
  const callbacks: Array<() => void> = [];

  el?.addEventListener('click', () => callbacks.forEach(fn => fn()));

  return {
    show() { el?.classList.add('is-active'); el?.setAttribute('aria-hidden', 'false'); },
    hide() { el?.classList.remove('is-active'); el?.setAttribute('aria-hidden', 'true'); },
    onClose(fn: () => void) { callbacks.push(fn); },
  };
})();
