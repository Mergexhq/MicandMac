// src/theme.ts — Main theme entry point

import { $, debounce } from './utils/dom';

// ── Sticky Header ─────────────────────────────────────────
const header = $<HTMLElement>('#SiteHeader');
if (header) {
  const onScroll = debounce(() => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }, 10);
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile Nav ────────────────────────────────────────────
const navToggle = $<HTMLButtonElement>('#NavToggle');
const navClose  = $<HTMLButtonElement>('#NavClose');
const mobileNav = $<HTMLElement>('#MobileNav');
const overlay   = $<HTMLElement>('#SiteOverlay');

const openNav = (): void => {
  mobileNav?.classList.add('is-open');
  navToggle?.setAttribute('aria-expanded', 'true');
  overlay?.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

const closeNav = (): void => {
  mobileNav?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  overlay?.classList.remove('is-active');
  document.body.style.overflow = '';
};

navToggle?.addEventListener('click', openNav);
navClose?.addEventListener('click', closeNav);
overlay?.addEventListener('click', closeNav);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// ── Search Bar ────────────────────────────────────────────
const searchBar   = $<HTMLElement>('#SearchBar');
const searchInput = $<HTMLInputElement>('.search-form__input');

$('#SearchToggle')?.addEventListener('click', () => {
  searchBar?.classList.add('is-open');
  searchBar?.setAttribute('aria-hidden', 'false');
  setTimeout(() => searchInput?.focus(), 50);
});

$('#SearchClose')?.addEventListener('click', () => {
  searchBar?.classList.remove('is-open');
  searchBar?.setAttribute('aria-hidden', 'true');
});

// ── Scroll-Reveal Animations ──────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));

// ── Announcement bar dismiss ──────────────────────────────
$<HTMLButtonElement>('[data-dismiss-announcement]')?.addEventListener('click', () => {
  const bar = $<HTMLElement>('.announcement-bar');
  if (bar) {
    bar.style.maxHeight = bar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      bar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
      bar.style.maxHeight = '0';
      bar.style.opacity = '0';
    });
    setTimeout(() => bar.remove(), 350);
  }
});
