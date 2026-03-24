/**
 * collection.ts
 * Filter drawer open/close (mobile)
 * Sort change → navigate, apply filters
 * Active filter pill removal
 */

export class Collection {
  private filterToggle: HTMLButtonElement | null;
  private filterDrawer: HTMLElement | null;
  private sortSelect:   HTMLSelectElement | null;

  constructor() {
    this.filterToggle = document.querySelector('#FilterToggle');
    this.filterDrawer = document.querySelector('#FilterDrawer');
    this.sortSelect   = document.querySelector('#SortBy');

    if (!this.filterDrawer) return;
    this._init();
  }

  private _init(): void {
    // Mobile toggle
    this.filterToggle?.addEventListener('click', () => {
      const isOpen = this.filterDrawer?.classList.contains('is-open');
      this.filterDrawer?.classList.toggle('is-open', !isOpen);
      this.filterToggle?.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Sort change → navigate
    this.sortSelect?.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', this.sortSelect!.value);
      url.searchParams.delete('page'); // reset to page 1
      window.location.assign(url.toString());
    });

    // Close filter drawer on overlay-like bg click (mobile)
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        this.filterDrawer?.classList.contains('is-open') &&
        !this.filterDrawer.contains(target) &&
        !this.filterToggle?.contains(target)
      ) {
        this.filterDrawer.classList.remove('is-open');
        this.filterToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Price range apply
    const priceApply = document.querySelector<HTMLButtonElement>('#FilterPriceApply');
    priceApply?.addEventListener('click', () => {
      const minInput = document.querySelector<HTMLInputElement>('#FilterMinPrice');
      const maxInput = document.querySelector<HTMLInputElement>('#FilterMaxPrice');
      const url = new URL(window.location.href);

      if (minInput?.name) url.searchParams.set(minInput.name, String(Number(minInput.value) * 100));
      if (maxInput?.name) url.searchParams.set(maxInput.name, String(Number(maxInput.value) * 100));

      window.location.assign(url.toString());
    });
  }
}
