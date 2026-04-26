/**
 * Mic & Mac — End-Glide Inertial Scroll
 *
 * Phase 1 (INITIAL) — user is actively scrolling:
 *   → completely native, zero interference, no passive:false, no preventDefault
 *
 * Phase 2 (FINAL) — user lifts finger / stops wheel:
 *   → takes the last velocity and glides to a stop over ~0.4s
 */
(function () {
  'use strict';

  /* ── Guards ─────────────────────────────────────────────────── */
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── State ──────────────────────────────────────────────────── */
  var velocity   = 0;
  var rafId      = null;
  var wheelTimer = null;

  /* ── Phase 1: Native scroll — just track the last delta ─────── */
  window.addEventListener('wheel', function (e) {
    /* No preventDefault — browser scrolls completely natively */

    velocity = e.deltaY;   /* seed for the glide */

    /* Cancel any in-progress glide while user is still scrolling */
    cancelAnimationFrame(rafId);
    clearTimeout(wheelTimer);

    /* Start Phase 2 after 90ms of silence (user stopped) */
    wheelTimer = setTimeout(glide, 90);

  }, { passive: true });   /* passive:true = no startup lag, no jank */

  /* ── Phase 2: End-glide ─────────────────────────────────────── */
  function glide() {
    function step() {
      velocity *= 0.80;                  /* friction — lower = stops sooner */

      if (Math.abs(velocity) < 0.5) {   /* fully stopped */
        velocity = 0;
        return;
      }

      window.scrollBy(0, velocity);
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

})();
