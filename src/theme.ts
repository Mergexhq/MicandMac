// src/theme.ts — Main theme entry point
// Imports and conditionally initialises all feature modules.

import { Header }         from './modules/header';
import { Search }         from './modules/search';
import { Wishlist }       from './modules/wishlist';
import { AuthMerge }      from './modules/auth-merge';
import { Auth }           from './modules/auth';
import { Account }        from './modules/account';
import { Collection }     from './modules/collection';
import { Product }        from './modules/product';
import { RecentlyViewed } from './modules/recently-viewed';
import { Home }           from './modules/home';
import { Contact }        from './modules/contact';

// ── Global modules (run on every page) ────────────────────
new Header();    // sticky header, mobile nav, cart toggle (replaces inline code)
new Search();    // predictive search drawer
new Wishlist();  // heart toggles + wishlist badge count
new AuthMerge(); // merge guest wishlist on login

// ── Scroll-reveal (used site-wide via [data-animate]) ─────
{
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
}

// ── Announcement bar dismiss ──────────────────────────────
document.querySelector<HTMLButtonElement>('[data-dismiss-announcement]')
  ?.addEventListener('click', () => {
    const bar = document.querySelector<HTMLElement>('.announcement-bar');
    if (bar) {
      bar.style.maxHeight = bar.offsetHeight + 'px';
      requestAnimationFrame(() => {
        bar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        bar.style.maxHeight  = '0';
        bar.style.opacity    = '0';
      });
      setTimeout(() => bar.remove(), 350);
    }
  });

// ── Page-specific module init ─────────────────────────────
// Shopify sets body classes: template-{name} and (if suffix) template-{name}-{suffix}
const tpl = (cls: string): boolean => document.body.classList.contains(cls);

// Home
if (tpl('template-index')) {
  new Home();
}

// Product detail page
if (tpl('template-product')) {
  new Product();
  new RecentlyViewed();
}

// Collection + Search results (both use filter/sort UI)
if (tpl('template-collection') || tpl('template-search')) {
  new Collection();
}

// Auth pages  (login / register / recover / reset)
if (
  tpl('template-customers-login')          ||
  tpl('template-customers-register')       ||
  tpl('template-customers-reset_password') ||
  tpl('template-customers-activate_account')
) {
  new Auth();
}

// Account dashboard + addresses page
if (tpl('template-customers') || tpl('template-customers-account') || tpl('template-customers-addresses')) {
  new Account();
}

// Contact page  (page.contact template adds suffix "contact")
if (tpl('template-page-contact')) {
  new Contact();
}
