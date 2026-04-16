/**
 * MicandMac — Scroll Reveal Engine v2.0
 * ─────────────────────────────────────
 * Zero dependencies. Pure IntersectionObserver + CSS transitions.
 * Replaces GSAP/ScrollTrigger entirely.
 */
(function () {
  'use strict';

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip on cart page entirely — no animations needed there
  if (document.body.classList.contains('template-cart')) return;

  /* ─────────────────────────────────────────────────────────────
   * 1. CSS INJECTION — define the reveal transition states
   * ───────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .sr-hidden {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .sr-hidden.sr-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .sr-hidden-left {
      opacity: 0;
      transform: translateX(-24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .sr-hidden-left.sr-visible {
      opacity: 1;
      transform: translateX(0);
    }
    .sr-hidden-scale {
      opacity: 0;
      transform: scale(1.04);
      transition: opacity 0.9s ease, transform 0.9s ease;
    }
    .sr-hidden-scale.sr-visible {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────────────────────
   * 2. OBSERVER — watches elements and flips class when in view
   * ───────────────────────────────────────────────────────────── */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('sr-visible');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  /* ─────────────────────────────────────────────────────────────
   * 3. TARGET ELEMENTS — tag + observe
   * ───────────────────────────────────────────────────────────── */
  function init() {
    // Section headings — slide up
    document.querySelectorAll('h2, h3.section-title, .section-eyebrow').forEach(function (el, i) {
      if (el.closest('.site-header, .site-footer, .the-act-hero')) return;
      el.classList.add('sr-hidden');
      el.style.transitionDelay = '0s';
      observer.observe(el);
    });

    // Cards — staggered slide up
    document.querySelectorAll('.product-card, .ingredient-feature, [class*="-card"]').forEach(function (el, i) {
      if (el.closest('.site-header, .site-footer, .the-act-hero')) return;
      el.classList.add('sr-hidden');
      el.style.transitionDelay = ((i % 4) * 0.08) + 's';
      observer.observe(el);
    });

    // Images — scale in
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      if (img.closest('.site-header, .site-footer, .the-act-hero, .cart-card')) return;
      img.classList.add('sr-hidden-scale');
      observer.observe(img);
    });

    // FAQ items — slide from left
    document.querySelectorAll('.faq__item, [class*="faq"] > *').forEach(function (el, i) {
      el.classList.add('sr-hidden-left');
      el.style.transitionDelay = (i * 0.06) + 's';
      observer.observe(el);
    });

    // Generic paragraphs inside brand sections
    document.querySelectorAll('.brand-mission h2, .brand-mission p, .brand-mission a').forEach(function (el, i) {
      el.classList.add('sr-hidden');
      el.style.transitionDelay = (i * 0.12) + 's';
      observer.observe(el);
    });

    // Newsletter
    document.querySelectorAll('.newsletter-cta h2, .newsletter-cta p, .newsletter-cta input, .newsletter-cta button').forEach(function (el, i) {
      el.classList.add('sr-hidden');
      el.style.transitionDelay = (i * 0.08) + 's';
      observer.observe(el);
    });

    // Footer trust seals
    document.querySelectorAll('.footer__seal').forEach(function (el, i) {
      el.classList.add('sr-hidden');
      el.style.transitionDelay = (i * 0.06) + 's';
      observer.observe(el);
    });

    // WhatsApp button — delayed pop-in via CSS only
    const wa = document.querySelector('.wa-sticky');
    if (wa) {
      wa.style.cssText += 'opacity:0;transform:scale(0.6) translateX(40px);transition:opacity 0.6s ease 2s,transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 2s;';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wa.style.opacity = '1';
          wa.style.transform = 'scale(1) translateX(0)';
        });
      });
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
