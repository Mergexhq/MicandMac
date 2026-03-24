/**
 * home.ts
 * Homepage-specific JS:
 *  - FAQ accordion is handled inline in faq-accordion.liquid
 *  - Video strip lightbox is handled inline in video-strip.liquid
 *  - Promo banner countdown timer
 *  - Scroll-reveal animations via IntersectionObserver
 */

export class Home {
  constructor() {
    this._initCountdowns();
    this._initScrollReveal();
  }

  // ------------------------------------------------------------------
  // Countdown timers (reads data-end from .promo-banner__countdown)
  // ------------------------------------------------------------------
  private _initCountdowns(): void {
    document.querySelectorAll<HTMLElement>('[id^="PromoCountdown-"]').forEach(el => {
      const endStr = el.dataset.end;
      if (!endStr) return;

      const endTime = new Date(endStr).getTime();
      if (isNaN(endTime)) return;

      const tick = () => {
        const now  = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          el.style.display = 'none';
          return;
        }

        const days    = Math.floor(diff / 86400000);
        const hours   = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000)  / 60000);
        const seconds = Math.floor((diff % 60000)    / 1000);

        const pad = (n: number) => String(n).padStart(2, '0');

        el.querySelector<HTMLElement>('[data-unit="days"]')!.textContent    = pad(days);
        el.querySelector<HTMLElement>('[data-unit="hours"]')!.textContent   = pad(hours);
        el.querySelector<HTMLElement>('[data-unit="minutes"]')!.textContent = pad(minutes);
        el.querySelector<HTMLElement>('[data-unit="seconds"]')!.textContent = pad(seconds);
      };

      tick();
      setInterval(tick, 1000);
    });
  }

  // ------------------------------------------------------------------
  // Scroll reveal — adds .is-visible when element enters viewport
  // Any element with class .reveal will animate in
  // ------------------------------------------------------------------
  private _initScrollReveal(): void {
    const revealItems = document.querySelectorAll<HTMLElement>('.reveal');
    if (!revealItems.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    revealItems.forEach(el => observer.observe(el));
  }
}
