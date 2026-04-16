# Hero Parallax Section — Agent Task Brief
> Paste this entire file into the Antigravity Agent panel and say: "Follow this brief exactly."

---

## 🎯 What You Are Building

A Shopify hero section that replicates this visual effect:
- A **large full-screen hero** with a bold heading (e.g. "NOURISH")
- A **plant/product image with a transparent background** layered ON TOP of the text
- This creates a "text behind image" depth illusion
- All three layers (background, text, image) move at **different speeds on scroll** (parallax)
- Clean, minimal skincare brand aesthetic — no clutter

Reference visual: aloe vera plant PNG sits above big serif heading text, both over a soft blue/neutral background. As the user scrolls, each layer drifts at a different rate, creating a 3D depth effect.

---

## 📁 Your Project Structure (MicandMac theme)

```
MicandMac/
├── assets/
│   ├── base.css              ← global styles (already exists, do NOT break it)
│   ├── hero-parallax.css     ← CREATE THIS
│   └── hero-parallax.ts      ← CREATE THIS (compile → hero-parallax.js via build.js)
├── sections/
│   ├── header.liquid         ← already exists, do NOT touch
│   └── hero-parallax.liquid  ← CREATE THIS
└── snippets/
```

---

## 📋 Step-by-Step Instructions

### STEP 1 — Create `sections/hero-parallax.liquid`

Create this file exactly:

```liquid
{% comment %}
  Section: Hero Parallax
  - Layer 1 (z-index 1): Background colour / image — slowest parallax (0.15x)
  - Layer 2 (z-index 2): Large heading text — medium parallax (0.4x)
  - Layer 3 (z-index 3): Plant/product PNG with transparent BG — no parallax (stays fixed)
  The "text behind image" effect = plant is z-index 3, text is z-index 2. That's it.
{% endcomment %}

{{ 'hero-parallax.css' | asset_url | stylesheet_tag }}

<section
  class="hero-parallax"
  data-hero-parallax
  style="--hero-height: {{ section.settings.height }}vh;"
>

  {{-- Layer 1: Background --}}
  <div class="hero-parallax__bg" data-parallax-speed="0.15">
    {% if section.settings.bg_image != blank %}
      <img
        src="{{ section.settings.bg_image | img_url: '1920x' }}"
        alt=""
        loading="eager"
        class="hero-parallax__bg-img"
      >
    {% endif %}
  </div>

  {{-- Layer 2: Heading text (sits BEHIND the plant) --}}
  <div class="hero-parallax__text" data-parallax-speed="0.4">
    <h1 class="hero-parallax__heading">
      {{ section.settings.heading }}
    </h1>
    {% if section.settings.subheading != blank %}
      <p class="hero-parallax__subheading">{{ section.settings.subheading }}</p>
    {% endif %}
    {% if section.settings.cta_label != blank %}
      <a href="{{ section.settings.cta_url }}" class="hero-parallax__cta">
        {{ section.settings.cta_label }}
      </a>
    {% endif %}
  </div>

  {{-- Layer 3: Plant / product image (sits IN FRONT of text — key to the effect) --}}
  <div class="hero-parallax__plant" data-parallax-speed="0">
    {% if section.settings.plant_image != blank %}
      <img
        src="{{ section.settings.plant_image | img_url: 'master' }}"
        alt="{{ section.settings.plant_image.alt | default: '' }}"
        loading="eager"
        class="hero-parallax__plant-img"
      >
    {% else %}
      {{-- Placeholder so the section is visible in the editor --}}
      <div class="hero-parallax__plant-placeholder">
        Upload a plant/product PNG (transparent background) in section settings
      </div>
    {% endif %}
  </div>

</section>

<script src="{{ 'hero-parallax.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": "Hero Parallax",
  "tag": "section",
  "class": "section-hero-parallax",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "NOURISH"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Natural skincare, deeply rooted."
    },
    {
      "type": "text",
      "id": "cta_label",
      "label": "Button label",
      "default": "Shop now"
    },
    {
      "type": "url",
      "id": "cta_url",
      "label": "Button link"
    },
    {
      "type": "image_picker",
      "id": "plant_image",
      "label": "Plant / product image",
      "info": "Use a PNG with a transparent background. This sits IN FRONT of the heading text."
    },
    {
      "type": "image_picker",
      "id": "bg_image",
      "label": "Background image (optional)",
      "info": "Optional. Leave blank for solid background colour."
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background colour",
      "default": "#d4e9f7"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Heading colour",
      "default": "#1a1a1a"
    },
    {
      "type": "range",
      "id": "height",
      "min": 60,
      "max": 100,
      "step": 5,
      "unit": "vh",
      "label": "Section height",
      "default": 100
    },
    {
      "type": "range",
      "id": "heading_size",
      "min": 60,
      "max": 200,
      "step": 5,
      "unit": "px",
      "label": "Heading font size (desktop)",
      "default": 130
    }
  ],
  "presets": [
    {
      "name": "Hero Parallax"
    }
  ]
}
{% endschema %}
```

---

### STEP 2 — Create `assets/hero-parallax.css`

```css
/* ============================================================
   Hero Parallax Section
   The "text behind image" trick:
     - .hero-parallax__text     → z-index: 2  (BEHIND plant)
     - .hero-parallax__plant    → z-index: 3  (IN FRONT of text)
   Parallax is applied via JS translateY on scroll.
   ============================================================ */

.hero-parallax {
  position: relative;
  width: 100%;
  height: var(--hero-height, 100vh);
  overflow: hidden;
  background-color: v-bind(bg_color); /* fallback handled inline */
}

/* All three layers share this base */
.hero-parallax__bg,
.hero-parallax__text,
.hero-parallax__plant {
  position: absolute;
  inset: 0;
  will-change: transform;
  transition: transform 0.05s linear; /* smooths micro-jitter */
}

/* ── Layer 1: Background ─────────────────────────── */
.hero-parallax__bg {
  z-index: 1;
  background-color: {{ section.settings.bg_color | default: '#d4e9f7' }};
}

.hero-parallax__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ── Layer 2: Text (sits behind the plant) ───────── */
.hero-parallax__text {
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 2rem;
  pointer-events: none; /* clicks pass through to plant layer below */
}

.hero-parallax__heading {
  font-size: clamp(3.5rem, 14vw, 130px); /* fluid scaling */
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.02em;
  color: {{ section.settings.text_color | default: '#1a1a1a' }};
  text-transform: uppercase;
  margin: 0;
  pointer-events: auto; /* re-enable for accessibility */
}

.hero-parallax__subheading {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  margin-top: 1.5rem;
  opacity: 0.7;
  letter-spacing: 0.05em;
  pointer-events: auto;
}

.hero-parallax__cta {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.85rem 2.2rem;
  border: 1.5px solid currentColor;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  pointer-events: auto;
  transition: background 0.2s, color 0.2s;
}

.hero-parallax__cta:hover {
  background: currentColor;
  color: #fff;
}

/* ── Layer 3: Plant image (IN FRONT of text) ─────── */
.hero-parallax__plant {
  z-index: 3;
  pointer-events: none; /* clicks pass through to links in text layer */
}

.hero-parallax__plant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}

/* Editor placeholder */
.hero-parallax__plant-placeholder {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  opacity: 0.4;
  white-space: nowrap;
}

/* ── Reduced motion override ─────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .hero-parallax__bg,
  .hero-parallax__text,
  .hero-parallax__plant {
    will-change: auto;
    transform: none !important;
    transition: none !important;
  }
}

/* ── Mobile ──────────────────────────────────────── */
@media (max-width: 768px) {
  .hero-parallax__heading {
    font-size: clamp(2.5rem, 18vw, 5rem);
  }

  /* Disable parallax on touch — feels wrong on mobile scroll */
  .hero-parallax__bg,
  .hero-parallax__text,
  .hero-parallax__plant {
    transform: none !important;
  }
}
```

> ⚠️ NOTE FOR AGENT: The `{{ section.settings.bg_color }}` inside the CSS file won't work because CSS is a static asset. Instead, set the background colour via an inline style on the section element in the liquid file, like:
> `style="--hero-bg: {{ section.settings.bg_color }}; --hero-text: {{ section.settings.text_color }};"`
> Then use `background-color: var(--hero-bg)` and `color: var(--hero-text)` in the CSS.
> Fix this when you implement.

---

### STEP 3 — Create `assets/hero-parallax.ts`

```typescript
/**
 * Hero Parallax
 * Reads `data-parallax-speed` from each layer and applies
 * a proportional translateY on scroll using requestAnimationFrame.
 *
 * Speed values:
 *   0    = no movement (plant stays fixed — appears "in front")
 *   0.15 = very slow (background drifts gently)
 *   0.4  = medium (text moves moderately)
 *
 * The illusion: text moves, plant doesn't → plant appears closer.
 */

interface ParallaxLayer {
  el: HTMLElement;
  speed: number;
}

function initHeroParallax(): void {
  const section = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (!section) return;

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  // Disable on touch devices (parallax feels wrong on mobile)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  // Collect layers
  const layers: ParallaxLayer[] = Array.from(
    section.querySelectorAll<HTMLElement>('[data-parallax-speed]')
  ).map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallaxSpeed ?? '0'),
  }));

  if (layers.length === 0) return;

  let ticking = false;
  let lastScrollY = window.scrollY;

  function applyParallax(): void {
    const scrollY = window.scrollY;

    // Only update if scroll position has actually changed
    if (scrollY === lastScrollY) {
      ticking = false;
      return;
    }

    lastScrollY = scrollY;

    // Clamp scroll range so layers don't drift off-screen
    const sectionHeight = section!.offsetHeight;
    const clampedScroll = Math.min(scrollY, sectionHeight);

    layers.forEach(({ el, speed }) => {
      // Negative offset so elements move UP as user scrolls down
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

  // Only run parallax when the hero section is in/near the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(section);

  // Run once on load in case page is scrolled
  applyParallax();
}

// Initialise when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroParallax);
} else {
  initHeroParallax();
}
```

---

### STEP 4 — Wire up `build.js`

Open the existing `build.js` file and add `hero-parallax.ts` as an entry point. It should look something like this (adjust to match your existing build config):

```javascript
// In your existing build.js — add the new entry:
const entries = [
  // ... existing entries ...
  'assets/hero-parallax.ts',
];
```

Then run the build in the terminal:

```bash
# In the MicandMac directory
node build.js
```

This should compile `assets/hero-parallax.ts` → `assets/hero-parallax.js`.

---

### STEP 5 — Verify with Shopify CLI

Your `shopify theme dev` should already be running. Check the terminal for sync confirmation, then open your preview URL:

```
http://127.0.0.1:9292
```

Go to the theme customizer and add the "Hero Parallax" section to the homepage. Upload:
- A **plant or product PNG with transparent background** in the "Plant image" field
- Optionally a background image

---

## ✅ Checklist for Agent

Before finishing, confirm all of these:

- [ ] `sections/hero-parallax.liquid` created with correct schema
- [ ] `assets/hero-parallax.css` created — z-index 2 for text, z-index 3 for plant
- [ ] `assets/hero-parallax.ts` created — rAF scroll listener, touch/motion disabled
- [ ] CSS colour variables fixed (use CSS custom properties via inline style, not Liquid inside CSS)
- [ ] `build.js` updated and TypeScript compiled to `assets/hero-parallax.js`
- [ ] Section appears in Shopify theme customizer under "Add section"
- [ ] No errors in browser console
- [ ] `pointer-events: none` on plant layer so clicks pass through
- [ ] `@media (prefers-reduced-motion: reduce)` disables parallax
- [ ] Parallax disabled on touch/mobile devices

---

## 🚨 Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Putting Liquid variables inside `.css` asset file | Use CSS custom properties set via inline `style=""` on the section element |
| Plant image has a white background | Must be a PNG with **transparent** background — that's what creates the depth illusion |
| Text appears in front of plant | Swap z-index: text = 2, plant = 3 |
| Scroll feels janky | Make sure you're using `requestAnimationFrame` with a `ticking` flag — never apply transforms directly in the scroll event |
| Section not showing in customizer | Check `"presets"` array exists in the schema |
| JS not loading | Check `build.js` compiled the TS and `hero-parallax.js` exists in `assets/` |

---

## 💡 Quick Reference: How the Depth Illusion Works

```
User's eyes
     │
     ▼
┌─────────────────────────────┐
│  Layer 3 — Plant PNG        │  z-index: 3  ← closest to viewer
│  (transparent background)   │  parallax speed: 0 (doesn't move)
├─────────────────────────────┤
│  Layer 2 — "NOURISH" text   │  z-index: 2
│                             │  parallax speed: 0.4 (moves medium)
├─────────────────────────────┤
│  Layer 1 — Background       │  z-index: 1  ← furthest from viewer
│                             │  parallax speed: 0.15 (moves slow)
└─────────────────────────────┘
```

The plant PNG overlaps the text at z-index 3.
Because the PNG background is transparent, only the plant shape covers the text.
The text "disappears" behind the plant — no masking, no clip-path needed.

---

*Generated for MicandMac Shopify theme — Antigravity IDE + Shopify CLI + TypeScript*
