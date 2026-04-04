/**
 * Hero Parallax — src/modules/hero-parallax.ts
 * ─────────────────────────────────────────────────────────────
 * Reads `data-parallax-speed` from each layer and applies a
 * proportional translateY on scroll via requestAnimationFrame.
 *
 * Speed semantics:
 *   0    → no movement  (product PNG — appears closest to viewer)
 *   0.15 → very slow    (background drifts gently)
 *   0.40 → medium       (heading text moves moderately)
 *
 * The depth illusion: the heading moves, the PNG doesn't
 * → the PNG appears to float in front of the text.
 *
 * Auto-disabled on:
 *   • Touch / mobile devices (parallax feels wrong on touch scroll)
 *   • prefers-reduced-motion: reduce (accessibility)
 */

interface ParallaxLayer {
  el: HTMLElement;
  speed: number;
}

function initHeroParallax(): void {
  const section = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (!section) return;

  // ── Accessibility: honour reduced-motion preference ──────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Disable on touch devices (phones / tablets) ──────────
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  // ── Collect all parallax layers ──────────────────────────
  const layers: ParallaxLayer[] = Array.from(
    section.querySelectorAll<HTMLElement>('[data-parallax-speed]')
  ).map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallaxSpeed ?? '0'),
  }));

  if (layers.length === 0) return;

  // ── Scroll handler (rAF-throttled) ──────────────────────
  let ticking = false;
  let lastScrollY = -1; // -1 forces first run

  function applyParallax(): void {
    const scrollY = window.scrollY;

    if (scrollY === lastScrollY) {
      ticking = false;
      return;
    }

    lastScrollY = scrollY;

    // Clamp so layers can't drift beyond the section height
    const sectionHeight = section!.offsetHeight;
    const clampedScroll = Math.min(scrollY, sectionHeight);

    layers.forEach(({ el, speed }) => {
      // Negative: elements move UP as user scrolls down, increasing depth
      const offset = -(clampedScroll * speed * 0.5);
      el.style.transform = `translateY(${offset}px)`;
    });

    ticking = false;
  }

  function onScroll(): void {
    if (!ticking) {
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }

  // ── Only listen while hero is near viewport ──────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          // Re-apply immediately in case already scrolled
          onScroll();
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    },
    { rootMargin: '300px' }
  );

  observer.observe(section);

  // Apply on load (user may have reloaded mid-scroll)
  applyParallax();
}

// Initialise when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroParallax);
} else {
  initHeroParallax();
}
