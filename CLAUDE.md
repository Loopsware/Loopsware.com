# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Loopsware marketing site ("loopsware.com") — an Astro 5 site deployed to Vercel as a server-rendered application.

## Commands

- `npm run dev` — start the local Astro dev server.
- `npm run build` — runs `astro check` (type-check `.astro` + `.ts`) then `astro build`. Use this to validate the codebase; there is no separate lint or test setup.
- `npm run preview` — preview the production build locally.
- `npx astro check` — run only the type/diagnostic check without building.

## Architecture

### Rendering & deployment
- `astro.config.mjs` sets `output: "server"` with the `@astrojs/vercel` adapter — pages are SSR by default on Vercel, not statically prerendered. Add `export const prerender = true` in a page's frontmatter if a route should be static.
- Vercel Web Analytics and Speed Insights are wired in (`@vercel/analytics`, `@vercel/speed-insights`). `SpeedInsights` is mounted manually inside pages (see `src/pages/index.astro`).
- i18n is configured for `en` only with `prefixDefaultLocale: false`. Copy strings live in `src/translations.ts` keyed by locale; add new locales there and to `astro.config.mjs` together.

### Integrations
- **Tailwind** (`@astrojs/tailwind`) — primary styling layer. Custom keyframes/animations (`fade-in-up`, `fade-in-left`, `fade-in-right`, `levitate`) are defined in `tailwind.config.mjs` and used throughout pages via `animate-*` utilities with `[animation-delay:*]` arbitrary values.
- **MDX** (`@astrojs/mdx`) — available for content pages.
- **React** (`@astrojs/react`) — scoped via `react({ include: ["**/react/*"] })`. React components are only compiled from paths containing a `react/` segment; `.astro` files elsewhere are not React. When adding interactive React, place it under a `react/` directory and import with a client directive (`client:load`, etc.).
- `three` and `animejs` are installed for 3D/animation work; `toastify-js` for notifications.

### Source layout
- `src/layouts/` — `Layout.astro` is the root document shell (defines `<head>`, OG/Twitter meta, ViewTransitions, global CSS, `@font-face` declarations for Grotesque/Inter/Telegraf/PierSans/EditorialNew loaded from `/public/fonts/`). `NavBar.astro` and `Footer.astro` are page chrome.
- `src/pages/` — file-based routes (`index`, `about`, `terms`).
- `src/components/` — shared `.astro` UI primitives (`Button`, `Card`, `ContactForm`).
- `src/base.css` — global CSS imported alongside Tailwind.
- `public/` — static assets (`fonts/`, `images/`); referenced from CSS and templates with absolute `/fonts/...` and `/images/...` paths.

### TypeScript
- `tsconfig.json` extends `astro/tsconfigs/strict` but explicitly sets `"strict": false`. JSX is `react-jsx` with `jsxImportSource: "react"`. Don't tighten `strict` casually — existing code is not strict-clean.

### Page conventions
- Pages compose `Layout` + `NavBar` + `<main>` content + `Footer`. Pass page title via `<Layout title="...">` (it becomes `<title>` and is independent of OG tags, which are hardcoded in `Layout.astro`).
- Inline `style={{ "font-family": "..." }}` is used to apply the custom fonts declared in `Layout.astro`'s global `@font-face` block.
- Entry animations use Tailwind's `opacity-0 animate-fade-in-up` plus `[animation-delay:400ms]` arbitrary modifiers — keep this pattern when adding hero/section reveals.
