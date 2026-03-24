/**
 * product.ts
 * PDP logic:
 *  - Variant selection → update price, image, ATC button
 *  - Gallery thumbnail click + mobile swipe
 *  - Sticky ATC show/hide via IntersectionObserver
 *  - Qty stepper + / –
 */

import { Header } from './header';

export class Product {
  private productData: ShopifyProduct | null = null;

  constructor() {
    const variantInput = document.querySelector<HTMLInputElement>('#ProductVariantId');
    if (!variantInput) return;

    this._loadProductJSON();
    this._initVariantPicker();
    this._initGallery();
    this._initStickyAtc();
    this._initQtyStepper();
  }

  private async _loadProductJSON(): Promise<void> {
    try {
      const path = window.location.pathname.replace(/\/$/, '') + '.json';
      const res  = await fetch(path);
      const data = await res.json();
      this.productData = data.product;
    } catch {}
  }

  // ------------------------------------------------------------------
  // Variant picker
  // ------------------------------------------------------------------
  private _initVariantPicker(): void {
    const container = document.querySelector<HTMLElement>('#ProductVariants');
    if (!container) return;

    container.addEventListener('click', (e: Event) => {
      const pill = (e.target as HTMLElement).closest<HTMLButtonElement>('.variant-pill');
      if (!pill) return;

      const optionIndex  = Number(pill.dataset.optionIndex);
      const optionValue  = pill.dataset.optionValue!;

      // Update UI — deselect others in this option group
      container
        .querySelectorAll<HTMLButtonElement>(`.variant-pill[data-option-index="${optionIndex}"]`)
        .forEach(p => {
          p.classList.toggle('is-selected', p === pill);
          p.setAttribute('aria-pressed', String(p === pill));
        });

      // Update visible selected value label
      const label = document.querySelector<HTMLElement>(`#OptionValue-${optionIndex + 1}`);
      if (label) label.textContent = optionValue;

      // Find matching variant
      this._resolveVariant(container);
    });
  }

  private _resolveVariant(container: HTMLElement): void {
    const selectedValues: string[] = [];
    container.querySelectorAll<HTMLElement>('[data-option-index]').forEach(group => {
      const selectedPill = group.closest('.product-form__option')
        ?.querySelector<HTMLButtonElement>('.variant-pill.is-selected');
      if (selectedPill) selectedValues.push(selectedPill.dataset.optionValue!);
    });

    if (!this.productData) return;

    const match = this.productData.variants.find(v =>
      v.options.every((o, i) => o === selectedValues[i])
    );

    if (!match) return;

    // Update hidden input
    const input = document.querySelector<HTMLInputElement>('#ProductVariantId');
    if (input) input.value = String(match.id);

    // Update ATC button
    const atcBtn = document.querySelector<HTMLButtonElement>('#ProductATC');
    if (atcBtn) atcBtn.dataset.variantId = String(match.id);

    // Update price
    this._updatePrice(match);

    // Swap gallery image if variant has featured_image
    if (match.featured_image) {
      const imgIndex = this.productData.images.findIndex(img => img.id === match.featured_image?.id);
      if (imgIndex >= 0) this._goToSlide(imgIndex);
    }

    // Sold out state
    const formAtc = document.querySelector<HTMLButtonElement>('.product-form__atc');
    if (formAtc) {
      formAtc.disabled = !match.available;
      formAtc.textContent = match.available ? 'Add to Cart' : 'Sold Out';
    }
  }

  private _updatePrice(variant: ShopifyVariant): void {
    const priceEl = document.querySelector<HTMLElement>('#PdpPrice');
    if (!priceEl) return;

    const current  = (variant.price / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
    const compare  = variant.compare_at_price && variant.compare_at_price > variant.price
      ? (variant.compare_at_price / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
      : null;

    const savings = compare
      ? Math.round((variant.compare_at_price! - variant.price) * 100 / variant.compare_at_price!)
      : null;

    priceEl.innerHTML = `
      <div class="price ${compare ? 'price--on-sale' : ''}">
        <span class="price__current">${current}</span>
        ${compare ? `<span class="price__compare">${compare}</span>` : ''}
        ${savings ? `<span class="price__badge badge badge--forest">${savings}% Off</span>` : ''}
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Gallery
  // ------------------------------------------------------------------
  private _currentIndex = 0;

  private _initGallery(): void {
    const navPrev  = document.querySelector<HTMLButtonElement>('#GalleryPrev');
    const navNext  = document.querySelector<HTMLButtonElement>('#GalleryNext');
    const thumbWrap = document.querySelector<HTMLElement>('#GalleryThumbs');

    navPrev?.addEventListener('click', () => this._goToSlide(this._currentIndex - 1));
    navNext?.addEventListener('click', () => this._goToSlide(this._currentIndex + 1));

    thumbWrap?.querySelectorAll<HTMLButtonElement>('.product-gallery__thumb').forEach((btn, i) => {
      btn.addEventListener('click', () => this._goToSlide(i));
    });

    // Mobile swipe
    const main = document.querySelector<HTMLElement>('#GalleryMain');
    if (main) this._initSwipe(main);
  }

  private _goToSlide(index: number): void {
    const slides = document.querySelectorAll<HTMLElement>('.product-gallery__slide');
    const thumbs = document.querySelectorAll<HTMLButtonElement>('.product-gallery__thumb');
    const count  = slides.length;

    if (count === 0) return;
    index = ((index % count) + count) % count; // wrap

    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === index));

    const counter = document.querySelector<HTMLElement>('#GalleryCurrentNum');
    if (counter) counter.textContent = String(index + 1);

    this._currentIndex = index;
  }

  private _initSwipe(el: HTMLElement): void {
    let startX: number | null = null;
    el.addEventListener('touchstart', (e: TouchEvent) => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (e: TouchEvent) => {
      if (startX === null) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) this._goToSlide(this._currentIndex + (diff > 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  // ------------------------------------------------------------------
  // Sticky ATC
  // ------------------------------------------------------------------
  private _initStickyAtc(): void {
    const mainAtc  = document.querySelector<HTMLElement>('#ProductATC');
    const stickyEl = document.querySelector<HTMLElement>('#StickyAtc');
    if (!mainAtc || !stickyEl) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        stickyEl.classList.toggle('is-visible', !entry.isIntersecting);
        stickyEl.setAttribute('aria-hidden', String(entry.isIntersecting));
      },
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );

    obs.observe(mainAtc);

    // Sticky variant select syncs with sticky ATC button
    const stickySelect = document.querySelector<HTMLSelectElement>('#StickyVariantSelect');
    const stickyBtn    = document.querySelector<HTMLButtonElement>('#StickyAtcBtn');
    stickySelect?.addEventListener('change', () => {
      if (stickyBtn) stickyBtn.dataset.variantId = stickySelect.value;
    });
  }

  // ------------------------------------------------------------------
  // Qty stepper
  // ------------------------------------------------------------------
  private _initQtyStepper(): void {
    const input   = document.querySelector<HTMLInputElement>('#ProductQty');
    const minusBtn = document.querySelector<HTMLButtonElement>('#QtyMinus');
    const plusBtn  = document.querySelector<HTMLButtonElement>('#QtyPlus');

    minusBtn?.addEventListener('click', () => {
      if (!input) return;
      input.value = String(Math.max(1, Number(input.value) - 1));
    });

    plusBtn?.addEventListener('click', () => {
      if (!input) return;
      input.value = String(Number(input.value) + 1);
    });
  }
}

// ------------------------------------------------------------------
// Minimal Shopify product type stubs
// ------------------------------------------------------------------
interface ShopifyProduct {
  variants: ShopifyVariant[];
  images: Array<{ id: number }>;
}

interface ShopifyVariant {
  id: number;
  options: string[];
  price: number;
  compare_at_price: number | null;
  available: boolean;
  featured_image?: { id: number } | null;
}
