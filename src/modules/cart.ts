// src/modules/cart.ts — CartDrawer with full TypeScript

import type { ShopifyCart, ShopifyCartItem } from '../types/shopify';
import { CartAPI } from '../utils/api';
import { $, $$ } from '../utils/dom';
import { formatMoney } from '../utils/money';

class CartDrawer {
  private drawer   = $<HTMLElement>('#CartDrawer');
  private overlay  = $<HTMLElement>('#SiteOverlay');
  private body     = $<HTMLElement>('#CartDrawerBody');
  private totalEl  = $<HTMLElement>('#CartTotal');
  private countEls = $$<HTMLElement>('[data-cart-count]');
  private emptyEl  = $<HTMLElement>('#CartEmpty');
  private filledEl = $<HTMLElement>('#CartFilled');

  constructor() {
    this.bindEvents();
    void this.refresh();
  }

  open(): void {
    this.drawer?.classList.add('is-open');
    this.overlay?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.drawer?.classList.remove('is-open');
    this.overlay?.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  async addItem(variantId: number, quantity = 1): Promise<void> {
    try {
      await CartAPI.add({ id: variantId, quantity });
      await this.refresh();
      this.open();
    } catch (err) {
      console.error('Add to cart error:', err);
      this.showToast('Could not add to cart. Please try again.');
    }
  }

  async refresh(): Promise<void> {
    const cart = await CartAPI.get();
    this.updateCount(cart.item_count);
    this.renderItems(cart);
  }

  private updateCount(count: number): void {
    this.countEls.forEach(el => {
      el.textContent = String(count);
      el.classList.toggle('cart-count--hidden', count === 0);
      if (count > 0) {
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 400);
      }
    });
  }

  private renderItems(cart: ShopifyCart): void {
    const isEmpty = cart.item_count === 0;
    this.emptyEl?.classList.toggle('hidden', !isEmpty);
    this.filledEl?.classList.toggle('hidden', isEmpty);

    if (this.totalEl) {
      this.totalEl.textContent = formatMoney(cart.total_price);
    }
    if (!this.body || isEmpty) return;

    this.body.innerHTML = cart.items.map(item => this.itemHTML(item)).join('');
    this.bindItemEvents();
  }

  private itemHTML(item: ShopifyCartItem): string {
    const imgSrc = item.featured_image?.url ?? '';
    const variantLabel = item.variant_title && item.variant_title !== 'Default Title'
      ? `<p class="cart-item__variant">${item.variant_title}</p>`
      : '';

    return `
      <div class="cart-item" data-key="${item.key}">
        <a href="${item.url}" class="cart-item__image-link" tabindex="-1">
          ${imgSrc
            ? `<img src="${imgSrc.replace('?', '?width=150&')}" alt="${item.product_title}" width="80" height="80" loading="lazy">`
            : '<div class="cart-item__image-placeholder"></div>'
          }
        </a>
        <div class="cart-item__info">
          <a href="${item.url}" class="cart-item__title">${item.product_title}</a>
          ${variantLabel}
          <div class="cart-item__bottom">
            <div class="qty-input qty-input--sm">
              <button class="qty-input__btn" data-action="decrease" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Decrease quantity">−</button>
              <span class="qty-input__value">${item.quantity}</span>
              <button class="qty-input__btn" data-action="increase" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Increase quantity">+</button>
            </div>
            <p class="cart-item__price">${formatMoney(item.final_line_price)}</p>
          </div>
        </div>
        <button class="cart-item__remove" data-key="${item.key}" aria-label="Remove ${item.product_title}">×</button>
      </div>`;
  }

  private bindItemEvents(): void {
    this.body?.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key!;
        const qty = parseInt(btn.dataset.qty ?? '1', 10);
        const newQty = btn.dataset.action === 'increase' ? qty + 1 : Math.max(0, qty - 1);
        void CartAPI.change({ id: key, quantity: newQty }).then(() => this.refresh());
      });
    });

    this.body?.querySelectorAll<HTMLButtonElement>('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        void CartAPI.change({ id: btn.dataset.key!, quantity: 0 }).then(() => this.refresh());
      });
    });
  }

  private bindEvents(): void {
    $<HTMLButtonElement>('#CartToggle')?.addEventListener('click', () => this.open());
    $<HTMLButtonElement>('#CartDrawerClose')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    // Global Add-to-Cart delegation
    document.addEventListener('click', async (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-atc]');
      if (!btn) return;
      const variantId = Number(btn.dataset.variantId);
      if (!variantId) return;

      btn.disabled = true;
      const original = btn.textContent ?? 'Add to Cart';
      btn.textContent = 'Adding…';

      await this.addItem(variantId);

      btn.textContent = 'Added ✓';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    });
  }

  private showToast(msg: string): void {
    // TODO: wire up a real toast UI
    console.warn('[Cart]', msg);
  }
}

// Initialise and expose close globally
const cartDrawer = new CartDrawer();

(window as Window & { closeCartDrawer?: () => void }).closeCartDrawer =
  () => cartDrawer.close();
