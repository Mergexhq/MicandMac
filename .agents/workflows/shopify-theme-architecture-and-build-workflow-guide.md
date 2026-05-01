---
description: This project uses a modern Shopify theme workflow with:  Shopify Liquid TypeScript Modular CSS Build pipeline (build.mjs) Source → Compiled asset architecture  Understanding this architecture is critical to avoid accidental UI overwrites.
---

# Shopify Theme Architecture & Build Workflow Guide

## Overview

This project uses a modern Shopify theme workflow with:

* Shopify Liquid
* TypeScript
* Modular CSS
* Build pipeline (`build.mjs`)
* Source → Compiled asset architecture

Understanding this architecture is critical to avoid accidental UI overwrites.

---

# Core Architecture

## Folder Structure

```txt
src/
  css/
    header.css
    pdp.css
    product-card.css
  modules/
    wishlist.ts
    cart.ts

assets/
  header.css
  pdp.css
  product-card.css
  theme.js
```

---

# Source of Truth

## Editable Files

These are the files you SHOULD edit:

```txt
src/*
sections/*
snippets/*
templates/*
```

Examples:

```txt
src/css/header.css
src/css/pdp.css
src/modules/wishlist.ts
sections/header.liquid
snippets/product-card.liquid
```

---

# Generated / Compiled Files

These files are generated automatically:

```txt
assets/*.css
assets/theme.js
assets/cart.js
```

These are NOT the source of truth.

The build process overwrites them.

---

# Build Pipeline

## Workflow

```txt
src/css/*.css
        ↓
build.mjs
        ↓
assets/*.css
        ↓
Shopify loads assets/
```

---

# TypeScript Workflow

```txt
src/modules/*.ts
        ↓
esbuild
        ↓
assets/theme.js
        ↓
Shopify loads theme.js
```

---

# Important Rule

## NEVER EDIT GENERATED FILES

Do NOT directly edit:

```txt
assets/header.css
assets/pdp.css
assets/theme.js
```

Why?

Because:

```txt
npm run build
```

will overwrite them.

---

# Why the UI Reverted

This issue usually happens when:

## Incorrect Workflow

```txt
Edited assets/*.css directly
↓
UI looked correct
↓
Ran npm run build
↓
Older src/css/* overwrote assets/*
↓
UI appeared 3–4 versions older
```

---

# Correct Workflow

## Step 1 — Edit Source Files

Example:

```txt
src/css/header.css
```

---

## Step 2 — Build

```bash
npm run build
```

---

## Step 3 — Run Local Shopify Preview

```bash
shopify theme dev
```

---

## Step 4 — Hard Refresh

Windows:

```txt
Ctrl + Shift + R
```

---

# Development Commands

## Development Mode

Use during active development:

```bash
npm run dev
```

---

## Production Build

Use before deployment:

```bash
npm run build
```

---

# Git Status Meanings

## M = Modified

```txt
File changed but not committed
```

---

## U = Untracked

```txt
New file not yet added to Git
```

---

## D = Deleted

```txt
File removed
```

---

# Safe Recovery Workflow

If UI suddenly looks older:

## DO NOT:

```bash
git checkout .
```

OR:

```txt
Discard All Changes
```

without checking files first.

---

# Recovery Steps

## 1. Compare src/ vs assets/

Check which folder contains the latest UI.

---

## 2. Use VS Code Diff

Open modified files to compare:

```txt
Current version
vs
Git version
```

---

## 3. Commit Backup Snapshot

Before experimenting:

```txt
backup before ui recovery
```

Create a commit.

---

# Recommended Mental Model

| React/Vite | Shopify Theme |
| ---------- | ------------- |
| src        | src           |
| dist/build | assets        |
| npm build  | build.mjs     |

---

# Final Golden Rule

```txt
src = editable source of truth
assets = disposable generated output
```

Once this workflow is followed consistently, build-related UI rollback issues disappear.
