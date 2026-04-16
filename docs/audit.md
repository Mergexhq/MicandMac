# Audit and Cleanup Implementation Plan

This document outlines the redundant files, dead code, and unused assets identified in the "Wine & Wellness" project.

## User Review Required

> [!IMPORTANT]
> The following actions involve deleting files. Please verify that none of these are being used in a way not detected by automated search (e.g., dynamic rendering via JavaScript strings).

> [!WARNING]
> Renaming `sections/product.liquid` to `sections/main-product.liquid` is necessary to match the reference in `templates/product.json`.

## Audit Findings

### 1. Redundant Sections
The following sections are older or barebones versions that have been superseded by `main-*.liquid` sections used in the JSON templates.

| File | Status | Reason |
| :--- | :--- | :--- |
| `sections/404.liquid` | Redundant | `templates/404.json` uses `main-404.liquid`. |
| `sections/article.liquid` | Redundant | `templates/article.json` uses `main-article.liquid`. |
| `sections/blog.liquid` | Redundant | `templates/blog.json` uses `main-blog.liquid`. |
| `sections/cart.liquid` | Redundant | `templates/cart.json` uses `main-cart.liquid`. |
| `sections/collection.liquid` | Redundant | `templates/collection.json` uses `main-collection.liquid`. |
| `sections/collections.liquid` | Redundant | `templates/list-collections.json` uses `main-list-collections.liquid`. |

### 2. File Naming Mismatch
| File | Action | Reason |
| :--- | :--- | :--- |
| `sections/product.liquid` | **Rename** to `main-product.liquid` | `templates/product.json` expects `main-product`. |

### 3. Unused Source Code (Dead Code)
The following TypeScript files in `src/modules/` are not listed as entry points in `build.mjs` and are not imported by the main entry points (`theme.ts`, `cart.ts`, `hero-parallax.ts`).

- `src/modules/account.ts`
- `src/modules/auth.ts`
- `src/modules/auth-merge.ts`
- `src/modules/collection.ts`
- `src/modules/contact.ts`
- `src/modules/guest-store.ts`
- `src/modules/header.ts`
- `src/modules/home.ts`
- `src/modules/product.ts`
- `src/modules/recently-viewed.ts`
- `src/modules/search.ts`
- `src/modules/wishlist.ts`

### 4. Unused Assets
| File | Status | Reason |
| :--- | :--- | :--- |
| `assets/critical.css` | Unused | Not referenced in `theme.liquid` or any other file. |

---

## Proposed Changes

### [DELETE] Redundant Sections
- [404.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/404.liquid)
- [article.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/article.liquid)
- [blog.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/blog.liquid)
- [cart.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/cart.liquid)
- [collection.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/collection.liquid)
- [collections.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/collections.liquid)

### [MODIFY] Section Renaming
- Rename [product.liquid](file:///d:/web%20development/Wine%20&%20Wellness/sections/product.liquid) to `main-product.liquid`.

### [DELETE] Unused Source Modules
- All files in `src/modules/` except `cart.ts` and `hero-parallax.ts`.

### [DELETE] Unused Assets
- [critical.css](file:///d:/web%20development/Wine%20&%20Wellness/assets/critical.css)

---

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the bundling still works without the deleted source files.
- Check for absolute file references in the codebase to ensure nothing broke.

### Manual Verification
- Open the storefront and verify that Product, Collection, Blog, and Article pages still render correctly (as they will now use the correct `main-*` sections).
- Verify the 404 page still renders its designed version.
