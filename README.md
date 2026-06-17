# Mekari Flex — Web Prototype

A front-end prototype of the **Mekari Flex** product built with Nuxt 3 and the **Pixel 3 Design Tokens 2.4** component library. This repo is used for UI/UX exploration, design handoff validation, and feature prototyping.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 3](https://nuxt.com) (Vue 3, file-based routing) |
| Design System | [@mekari/pixel3](https://docs.mekari.design) — DT 2.4 |
| Styling | Panda CSS via `@mekari/pixel3-postcss` (semantic tokens only — no raw CSS) |
| Language | TypeScript |
| Package Manager | npm |

---

## Getting Started

### Prerequisites

- Node.js **≥ 18**
- npm **≥ 9**
- Access to the `@mekari/pixel3` npm package (public registry)

### Installation

```bash
# Clone the repo
git clone https://github.com/harnods/flex-web.git
cd flex-web

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default.

> **Note:** The dev script sets `TMPDIR=/tmp` to avoid macOS permission issues with Nuxt's temp files.

### Build

```bash
# Production build
npm run build

# Static generation
npm run generate

# Preview production build locally
npm run preview
```

---

## Project Structure

```
flex-web/
├── assets/
│   └── css/main.css          # Global CSS entry (imports Pixel base styles)
├── components/
│   ├── AppHeader.vue          # Top navigation bar
│   ├── AppSidebar.vue         # Left sidebar with main + sub navigation
│   └── PxIcon.vue             # Thin wrapper around Pixel icon component
├── layouts/
│   └── default.vue            # App shell: header, sidebar, title bar, stage
├── pages/
│   ├── index.vue              # Dashboard
│   ├── employees.vue
│   ├── statistics.vue
│   ├── accessible-salary.vue
│   ├── flex-benefit.vue
│   ├── flex-installment.vue
│   ├── insurance/
│   │   ├── plans.vue
│   │   └── ...
│   └── settings/
│       ├── company.vue
│       ├── balance-reminder.vue
│       ├── imported-files.vue
│       ├── exported-files.vue
│       └── approvals/
│           ├── index.vue      # Approval rules list
│           ├── create.vue     # Create approval form
│           └── [id]/
│               ├── (detail)   # [id].vue — approval detail
│               └── edit.vue   # Edit approval form
├── public/
│   └── illustrations/         # Static illustration assets
├── nuxt.config.ts
└── package.json
```

---

## Design System Rules

This project enforces **Pixel 3 DT 2.4** strictly:

- **No `<style>` blocks** — all styling goes through `css()` utility from `@mekari/pixel3`
- **No raw CSS values** — use semantic token names (e.g. `color: 'text.default'`, `bg: 'background.neutral'`)
- **No Tailwind** — PostCSS is handled by `@mekari/pixel3-postcss`
- The `data-panda-theme="next"` attribute on `<html>` is **required** — without it all color tokens are undefined

### Key Nuxt Config Notes

- `components.pathPrefix: false` — components in subfolders are registered without the folder prefix
- Route rules: `/settings` redirects to `/settings/company`, `/insurance` redirects to `/insurance/plans`
- Static route `create.vue` takes priority over dynamic `[id].vue` for `/settings/approvals/create`

---

## Layout System

The `layouts/default.vue` shell provides:

- **72px title bar** — reads `route.meta.title`, `route.meta.breadcrumb`, and `route.meta.headerAction` from `definePageMeta`
- **Stage** — white content card (`background.neutral`) with rounded top-left corner and top/left border
- **`setPageHeaderRight` inject** — pages can inject this to set a custom `MpPopover` button in the title bar (used for multi-action dropdowns like the "Actions" button on detail pages)

### `definePageMeta` options

```ts
definePageMeta({
  title: 'Page title',                          // shown in title bar h1
  navKey: 'settings',                           // highlights sidebar item
  breadcrumb: [{ label: 'Parent', to: '/...' }], // breadcrumb above h1
  headerAction: { label: 'CTA', to: '/...', variant: 'primary' }, // right button
})
```

---

## Pages Overview

| Route | Description |
|---|---|
| `/` | Dashboard |
| `/settings/approvals` | List of approval rules with search, pagination, empty state |
| `/settings/approvals/create` | Multi-step form to create an approval rule |
| `/settings/approvals/:id` | Approval rule detail with key-value metadata and step breakdown |
| `/settings/approvals/:id/edit` | Edit an existing approval rule |
| `/insurance/plans` | Insurance plan list |

---

## Contributing

This is a prototype repo. All UI must follow **Mekari Pixel 3 DT 2.4** — no exceptions. Refer to the design system docs at [docs.mekari.design](https://docs.mekari.design) and the UX writing guidelines at the internal Mekari copy library.
