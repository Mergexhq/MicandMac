# Wine & Wellness – Shopify Section & Sitemap Architecture

This document maps all Shopify templates to their corresponding sections (OS 2.0 JSON mappings), as well as listing all global UI elements and standalone flexible sections.

---

## 🌎 Global Layout Groups
These sections are injected globally via OS 2.0 section groups.
*   **Header** (`header-group.json`)
    *   `header.liquid`
*   **Footer** (`footer-group.json`)
    *   `footer.liquid`

---

## 📄 Page Templates Mapping
How JSON templates are currently wired to their default `main-*` sections and any default secondary sections.

### Core Storefront
| Template | Assigned Sections (in order) |
| :--- | :--- |
| `index.json` (Home) | `the-act-hero` <br> `trust-bar` <br> `featured-collection` <br> `brand-mission` <br> `ingredients-story` <br> `testimonials` <br> `faq-accordion` <br> `newsletter-cta` |
| `product.json` | `main-product` |
| `collection.json` | `main-collection` |
| `list-collections.json` | `main-list-collections` |
| `cart.json` | `main-cart` <br> `cart-upsell` |
| `search.json` | `search-results` |
| `blog.json` | `main-blog` |
| `article.json` | `main-article` |
| `404.json` | `main-404` |
| `password.json` | `password` |

### Custom Pages
| Template | Assigned Sections |
| :--- | :--- |
| `page.json` (Default) | `page` |
| `page.about.json` | `page-about` |
| `page.contact.json` | `page-contact` |
| `page.policy.json` | `main-policy` |
| `page.wishlist.json`| `main-wishlist` |

### Customer Account Pages (`/account/*`)
| Template | Assigned Sections |
| :--- | :--- |
| `account.json` | `main-account` |
| `activate_account.json`| `main-activate-account` |
| `addresses.json` | `main-addresses` |
| `login.json` | `main-login` |
| `order.json` | `main-order` |
| `register.json` | `main-register` |
| `reset_password.json`| `main-reset-password` |

---

## 🧩 Global Injectables & Drawers
Sections injected directly via `layout/theme.liquid` or triggered via Javascript globals:
*   `cart-drawer.liquid` (Slide-out AJAX cart context)
*   `search-drawer.liquid` (Interactive predictve search wrapper)

---

## 🛠 Available Dynamic Sections
Flexible sections available to merchants in the Theme Editor to mix-and-match across templates (not hardcoded to templates by default):
*   `announcement-bar.liquid`
*   `category-tiles.liquid`
*   `collection-tiles.liquid`
*   `cta-banner.liquid`
*   `hero-banner.liquid`
*   `hero-parallax.liquid`
*   `instagram-feed.liquid`
*   `large-text-with-product.liquid`
*   `product-ingredients.liquid`
*   `promo-banner.liquid`
*   `recently-viewed.liquid`
*   `related-products.liquid`
*   `video-strip.liquid`
