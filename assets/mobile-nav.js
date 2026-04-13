/**
 * mobile-nav.js
 * Handles: Mobile Top Bar scroll state, Sidebar Drawer (tabs), Bottom Dock cart trigger
 * Mic & Mac — loaded via theme.liquid defer
 */
'use strict';

(function () {

  /* ---- Overlay helper (shared with existing theme.js) ---- */
  const overlay = document.getElementById('SiteOverlay');

  function showOverlay() {
    overlay?.classList.add('is-active');
  }
  function hideOverlay() {
    overlay?.classList.remove('is-active');
  }

  /* ===================================================
     1. TOP BAR — scroll shadow
     =================================================== */
  const topBar = document.getElementById('MobileTopBar');

  if (topBar) {
    window.addEventListener('scroll', function () {
      topBar.classList.toggle('is-scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ===================================================
     2. SIDEBAR DRAWER
     =================================================== */
  const drawer      = document.getElementById('MobileNav');
  const navToggle   = document.getElementById('NavToggle');
  const navClose    = document.getElementById('MNavClose');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    navToggle?.classList.add('is-open');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    showOverlay();
    // focus first tab for accessibility
    drawer.querySelector('.mnav__tab')?.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hideOverlay();
  }

  navToggle?.addEventListener('click', openDrawer);
  navClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---- Tab switching ---- */
  const tabs   = drawer?.querySelectorAll('.mnav__tab');
  const panels = drawer?.querySelectorAll('.mnav__panel');

  tabs?.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.tab;

      // Deactivate all
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels?.forEach(function (p) {
        p.classList.remove('is-active');
      });

      // Activate clicked
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const panel = drawer?.querySelector('#mnav-' + target);
      panel?.classList.add('is-active');

      // Scroll tab into view (for narrow phones)
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  /* ---- Accordion toggles ---- */
  const accordions = drawer?.querySelectorAll('[data-accordion]');

  accordions?.forEach(function (acc) {
    const trigger = acc.querySelector('[data-trigger]');
    const body    = acc.querySelector('[data-body]');

    if (!trigger || !body) return;

    trigger.addEventListener('click', function () {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (isOpen) {
        body.classList.add('mnav__accordion-body--closed');
      } else {
        body.classList.remove('mnav__accordion-body--closed');
      }
    });
  });

  /* ===================================================
     3. MOBILE SEARCH BUTTON
     =================================================== */
  const searchToggleMobile = document.getElementById('SearchToggleMobile');
  const searchDrawer       = document.getElementById('SearchDrawer');
  const searchBar          = document.getElementById('SearchBar');  // fallback

  searchToggleMobile?.addEventListener('click', function () {
    if (searchDrawer) {
      // open the existing search drawer if present
      searchDrawer.classList.add('is-open');
      searchDrawer.setAttribute('aria-hidden', 'false');
      showOverlay();
      searchDrawer.querySelector('input')?.focus();
    } else if (searchBar) {
      // fallback: toggle inline search bar
      const isOpen = searchBar.classList.contains('is-open');
      searchBar.classList.toggle('is-open', !isOpen);
      searchBar.setAttribute('aria-hidden', String(isOpen));
      if (!isOpen) searchBar.querySelector('input')?.focus();
    }
  });

  /* ===================================================
     4. MOBILE CART BUTTONS (top bar + bottom dock)
        Trigger the existing cart drawer (#CartDrawer)
     =================================================== */
  const cartDrawer         = document.getElementById('CartDrawer');
  const cartToggleMobile   = document.getElementById('CartToggleMobile');
  const cartToggleDock     = document.getElementById('CartToggleDock');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showOverlay();
  }

  cartToggleMobile?.addEventListener('click', openCart);
  cartToggleDock?.addEventListener('click', openCart);

  /* ===================================================
     5. CART COUNT SYNC
        Keep top-bar badge + dock badge in sync with
        the existing CartCount when cart.js updates it.
     =================================================== */
  function syncCartBadges(count) {
    const badges = [
      document.getElementById('MtbCartCount'),
      document.getElementById('DockCartCount'),
      document.getElementById('CartCount'),
    ];

    badges.forEach(function (badge) {
      if (!badge) return;
      if (count > 0) {
        badge.textContent = String(count);
        badge.classList.remove('mtb__cart-badge--hidden', 'bdock__badge--hidden', 'cart-count--hidden');
      } else {
        badge.textContent = '';
        badge.classList.add('mtb__cart-badge--hidden', 'bdock__badge--hidden', 'cart-count--hidden');
      }
    });
  }

  // Watch the existing CartCount for mutations (cart.js updates it)
  const masterBadge = document.getElementById('CartCount') ||
                      document.getElementById('MtbCartCount');

  if (masterBadge && 'MutationObserver' in window) {
    new MutationObserver(function () {
      const n = parseInt(masterBadge.textContent || '0', 10);
      syncCartBadges(n);
    }).observe(masterBadge, { childList: true, characterData: true, subtree: true });
  }

  /* ===================================================
     6. BOTTOM DOCK — active state on page load
     =================================================== */
  const dockItems  = document.querySelectorAll('.bdock__item');
  const currentUrl = window.location.pathname;

  dockItems.forEach(function (item) {
    const href = item.getAttribute('href');
    if (!href) return;
    if (href === '/' ? currentUrl === '/' : currentUrl.startsWith(href)) {
      item.classList.add('is-active');
    }
  });

})();
