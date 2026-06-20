# Insurance & Enrollments — Design → Engineering Handoff

Build spec for the Insurance module. The PRD covers *why/what*; this doc covers *how it's built*: components, design tokens (DT), interactions, and every state. Stack: Nuxt 3 + Pixel 3 (DT 2.4). Data is mocked client-side.

**Token notation:** `space.6` = 24px · `space.4` = 16px · `space.3` = 12px · `space.2` = 8px · `space.1` = 4px. Colors/sizes are Pixel tokens (e.g. `colors.border.default`, `colors.background.inverse`).

---

## Flow map

```
Insurance
├─ Insurance plans  /insurance/plans
│   ├─ Import insurance plan      /insurance/plans/import ───────────┐
│   └─ (row) Delete coverage period → confirm modal                  │
│                                                                     ▼
├─ Import history   /insurance/plans/import-history  ◄──────── (all imports land here)
│   └─ View details → /insurance/plans/import-history/[logId]         ▲
│                                                                     │
└─ Enrollments      /insurance/enrollments                           │
    ├─ New / Edit → /insurance/enrollments/create (3-step wizard)    │
    └─ (row) View details → /insurance/enrollments/[id]              │
        ├─ View enrollment details → drawer                          │
        ├─ Add employee ▾                                            │
        │   ├─ Add employee → /[id]/add  (plan picker + bulk assign) │
        │   └─ Upload from CSV → /[id]/import ───────────────────────┤
        └─ (plan row) → /[id]/[planId]  (enrolled employees)         │
            ├─ Add employee ▾ → /[id]/[planId]/add                   │
            │                  → /[id]/[planId]/import ──────────────┘
            ├─ Export → modal
            └─ (employee row) Actions → View / Edit / Remove (drawers + confirm)
```

---

## Global conventions

- **Dropdowns:** always `MpPopover` (an `MpSelect` styled trigger + `MpPopoverList`), never a native select dropdown. Add `use-portal` inside tables/drawers.
- **Confirmation modals:** title `Delete X?` / `Remove from plan?`; body = impact statement with a period (no "Are you sure"); body text `colors.text.default`; primary button label = the action verb; danger action = `variant="danger"`.
- **Toasts:** `toast.notify({ position:'top-center', variant, title })`. Pattern `[Object] + past-participle`. No `description` field — put everything in `title`. Variants: `success` · `greeting` · `error`.
- **Section spacing:** page column `gap = space.6` (24px) between summary band / toolbar / table. Table and its pagination stay attached (one wrapper, no gap).
- **Sticky table columns:** dividers use an inset box-shadow `inset ±1px 0 0 #D0D6DD` (a real border is dropped by `border-collapse` on sticky cells). Shown only while content is scrolled under the sticky column.
- **Styling:** Pixel 3 DT 2.4 components only; styling via `css()` (Panda) — no raw `<style>`.

---

## Screen 1 — Insurance plans (list)
**Route** `/insurance/plans` · **Entry** sidebar → Insurance plans · **Component** `pages/insurance/plans/index.vue` (+ `InsurancePlanTable.vue`)

**Layout** — column `gap space.6`: filter bar → grouped table → pagination.

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| Benefit-type filter | `MpPopover` + `MpSelect` trigger + `MpCheckbox` list | md | multi-select |
| Search | `MpInputGroup` + `MpInputLeftAddon`(`search`) + `MpInput` | md | `is-clearable`, width 280px |
| Import CTA (header) | `MpButton` (headerAction) | secondary | |
| Plan table | `MpTableContainer` / `MpTable` | `is-bordered` | grouped by coverage period (rowspan meta cells) |
| Benefit-type bullets | native `<ul>` `list-style:disc` | — | color `text.default` (black) |
| Delete (per period) | `<button>`+`css()` + `MpTooltip` | icon `delete` 20 | hover `icon.danger`; `_disabled` `icon.disabled` |
| Pagination | `TablePagination` | — | |

**Interactions** — Import insurance plan → Screen 2 · row delete (enabled only if period not in any enrollment) → confirm modal (Screen 1a).

**States** — first-run (`InsuranceFirstRun`) · empty/import-queued (`InsuranceStateEmpty`, illustration + "Import insurance plan") · list · search-not-found (`icon="search"`) · filter-not-found (`icon="filter"`) · delete disabled (in-use) with tooltip.

**Copy** — search "Search plan name…" · delete tooltip "Used in an enrollment — can't be deleted" / "Delete insurance plan".

### Screen 1a — Delete insurance plan (confirm)
`MpModal` size `sm`, `is-centered`. Header "Delete insurance plan?"; body "The {coverage period} coverage period and all {n} of its plans will be permanently deleted. This action can't be undone."; footer `Cancel` (ghost) + `Delete` (danger). On confirm → remove group + toast "Insurance plan {period} deleted."

---

## Screen 2 — Import insurance plans
**Route** `/insurance/plans/import` · **Entry** plans list → Import insurance plan · **Component** `pages/insurance/plans/import.vue`

**Layout** — max-width 640px; numbered steps (1 download, 2 upload) `gap space.6`; footer right-aligned.

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| Step number | `<span>`+`css()` | — | 24px circle, `background.surface` |
| Download template | `MpButton` | secondary md | |
| Dropzone | `MpDropzone` | — | accept `.csv,.xls,.xlsx`, height 360px, `is-invalid` |
| Selected file | `PxIcon` `excel-document` + remove `<button>` | — | remove icon `minus-circular` |
| Cancel / Import | `MpTextlink` / `MpButton` | primary md | `is-loading` while submitting |

**Interactions** — Download → toast (mock) · Import → validate → simulated progress → toast → Import history.

**States** — idle · file selected · uploading (`loader-` + %) · validation error (format / size / empty / multiple / structure) · success.

**Copy** — toast "Import started. We'll email you when it's done." · errors per case (e.g. "File format not supported. Upload a CSV, XLS, or XLSX file").

---

## Screen 3 — Import history
**Route** `/insurance/plans/import-history` · **Entry** sidebar → Import history (divider above it) · **Component** `pages/insurance/plans/import-history/index.vue`

**Layout** — column `gap space.6`: search → table → pagination.

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| Search | `MpInputGroup`+`MpInput` | md | "Search file name…" |
| Table | `MpTable` | — | cols: File name · Import type · Imported by · Imported on · Status · action |
| File name | `PxIcon` `excel-document` 20 + `MpText` | — | |
| Status | `MpBadge` `for="tableStatus"` | md | type per status (below) |
| View details | `MpButton` | secondary md | hidden while Processing (shows "—") |

**Status → badge type:** Processing `information` · Success `completed` · Partially failed `warning` · Failed `critical`.

**Interactions** — View details (non-processing) → Screen 4.

**States** — list (mixed plan + employee imports) · search-not-found · Processing rows have no action.

---

## Screen 4 — Import details
**Route** `/insurance/plans/import-history/[logId]` · **Entry** Import history → View details · **Component** `pages/insurance/plans/import-history/[logId].vue`

**Layout** — column `gap space.6`: overview card → error logs table (or empty state).

**Components**
| Element | Component | DT / props |
| --- | --- | --- |
| Overview card | `<div>`+`css()` border `border.default` radius `md` | header bg `gray.25` |
| File name | `MpTextlink` (download) | no icon — file name is the link |
| Status | `MpBadge` `for="additionalInformation"` | type per status |
| Counts | `MpText` | Imported = `text.success`, Failed = `text.danger` |
| Error logs | `MpTable` | cols: Row · Column · Error message (`text.danger`) |

**States** — failed/partial → error-logs table · success → `InsuranceStateEmpty` icon `check` "No errors" · processing → `InsuranceStateEmpty` icon `loader-` "Import in progress" · unknown id → "Import not found".

**Interactions** — File name → download (mock toast).

---

## Screen 5 — Enrollments (list)
**Route** `/insurance/enrollments` · **Entry** sidebar → Enrollments · **Component** `pages/insurance/enrollments/index.vue`

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| New enrollment (header) | `MpButton` | primary | |
| Search | `MpInputGroup`+`MpInput` | md | |
| Table | `MpTable` | — | Enrollment name · Coverage period · Last updated by · Actions |
| Draft tag | `MpBadge` `for="tableStatus"` `type="announcement"` | md | |
| Row actions | `MpPopover` + `MpButton` (`right-icon="caret-down"`) | secondary md | `use-portal`; items View details / Edit / Delete |

**Interactions** — name / View details → Screen 7 · Edit → Screen 6 (`?edit=`) · Delete → Screen 5a.

**States** — list · empty (`InsuranceStateEmpty`) · search-not-found.

### Screen 5a — Delete enrollment (confirm)
`MpModal` `sm` centered. Header "Delete enrollment?"; body "{name} will be permanently deleted. This action can't be undone."; `Cancel` (ghost) + `Delete` (danger). On confirm → remove + toast "Enrollment {name} deleted." (Insurance plans are **not** deleted.)

---

## Screen 6 — Create / edit enrollment (wizard)
**Route** `/insurance/enrollments/create` (`?edit=<id>`) · **Component** `pages/insurance/enrollments/create.vue`

**Layout** — stepper (Set details → Assign plans → Review) + sticky footer bar.

**Components** — `MpInput`, `MpSelect` inside `MpPopover` (coverage / criteria), `MpCheckbox` (employment status), `MpInputTag` (per-plan default-for), `MpTable` (assign plans), `MpModal` (unassigned-criteria alert), `MpButton`s in footer (Save as draft / Back / Cancel coachmark / Continue / Save).

**States** — per-step validation (required-field errors on Continue) · edit mode (split "Continue ▾ → Save changes") · unassigned-criteria warning modal · leave-page coachmark.

**Copy** — toasts "Enrollment created successfully." / "Changes saved." / "Enrollment saved as draft."

---

## Screen 7 — Enrollment detail
**Route** `/insurance/enrollments/[id]` · **Component** `pages/insurance/enrollments/[id]/index.vue`

**Layout** — column `gap space.6`: overview band → toolbar (export + search) → plans table.

**Components**
| Element | Component | DT / props |
| --- | --- | --- |
| Overview band | `<div>`+`css()` border `border.default` | header bg `gray.25`; stat cols flex |
| Edit enrollment (draft only) | `MpTextlink` | |
| View enrollment details | `MpTextlink` → drawer (7a) | |
| Export | `<button>`+`css()` + `MpTooltip` | icon `upload` 20 |
| Plan name | `MpTextlink` (active) / `MpText` (draft) | links to Screen 10 |
| View details (per row) | `MpButton` | secondary md |
| Add employee ▾ (header) | header popover (`Add employee`, `Upload from CSV`) | variant primary, `caret-down` |

**Interactions** — Add employee → Screen 8 · Upload from CSV → Screen 9 · plan name / View details → Screen 10 · View enrollment details → drawer 7a.

**States** — draft (counts "—", Edit shown, no Add-employee button) · active (real counts, Add employee dropdown).

### Screen 7a — Enrollment details (drawer)
`MpDrawer` placement `right` size `md`, close via header (×)/overlay/Esc (no footer). Fields (label `text.secondary` / value `text.default`, `gap space.5`): Enrollment name (+ Draft `MpBadge`), Coverage period, Benefit type (disc list), Insurance provider, Insurance broker, Not enrolled, Total enrolled, **Created on**, **Created by**.

---

## Screen 8 — Add employees (enrollment level)
**Route** `/insurance/enrollments/[id]/add` · **Entry** Screen 7 → Add employee · **Component** `pages/insurance/enrollments/[id]/add.vue`

**Layout** — column `gap space.6`, `flex 1`: toolbar (search + Select employees) → table → sticky footer (`margin-top:auto`).

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| Select employees CTA | `<button>`+`css()` | — | bg `colors.background.inverse`, text `colors.text.inverse`, height 40px, `_hover` opacity .92 |
| Table | `MpTable` | — | cols: ☑+Employee name · Insurance plan · Effective start date · Dependents · remove |
| Row / select-all checkbox | `MpCheckbox` | — | header `is-indeterminate` when partial; checkbox lives **inside** first column |
| Insurance plan picker | `MpPopover`+`MpSelect`+`MpPopoverList` | md | required; placeholder via `<option value="" disabled hidden>` |
| Effective date | `MpDatePicker` | — | `use-portal`, format `D MMM YYYY`, cell width 240px |
| Add dependents | `PxIcon` `add` + `MpTextlink` | — | → modal 8b |
| Remove row | `<button>`+`css()` + `MpTooltip` | icon `minus-circular` 20 | |
| Footer | `MpButton` Cancel (ghost) / Save (primary md) | — | Save `is-disabled` until all rows have a plan |

**Bulk assign** — when ≥1 row selected, the **table header row** becomes a bulk bar (fixed height 56px both states): `MpCheckbox` · "N selected" · `MpButton`(secondary md, opens `MpPopover` plan list) · `Pixel.kbd` "Esc" keycap + "to clear selection" (14px) right-aligned. Esc clears selection.

**Interactions** — Select employees → drawer 8a · Add dependents → modal 8b · Assign insurance plan → applies plan to all selected + toast + clears · Save → toast + back to Screen 7.

**States** — empty (`InsuranceStateEmpty` illustration, no table header) · rows (column headers) · selection (header = bulk bar) · Save disabled (missing plan).

**Copy** — Save toast "Employees enrolled"; bulk toast "Plan assigned to N employees".

### Screen 8a — Select employees (drawer)
`MpDrawer` right size `2xl`. Two columns split by `colDivider`: **Available** (search, `MpButton` Filters, "Add all" `MpTextlink`, rows with `+` that appears on row hover/focus only — opacity 0→1) | **Selected (N)** (search, rows with `−`). Empty right = `PxIcon employee` 32 + "No employees added yet". Footer Cancel/Save. Note: do **not** set `is-keep-alive` (it breaks the search input's left-addon padding).

### Screen 8b — Add dependents (modal)
`MpModal` `sm`. Employee card (avatar top-aligned, name + id|pos|org `gap space.1`), Spouse `MpCheckbox`, Children `MpCheckbox` group with "(selected/total)" header. Cancel/Save.

---

## Screen 9 — Import employees
**Routes** `/insurance/enrollments/[id]/import` (enrollment, template has plan column) · `/insurance/enrollments/[id]/[planId]/import` (plan) · **Entry** Add employee ▾ → Upload from CSV · **Component** thin pages over `components/InsuranceImportFlow.vue`

Same component spec as Screen 2 (download → upload → Import). On submit: `addLog({ type:'employee', fileName })` → toast "Import started. Track the status in Import history." → Screen 3 (new **Processing** row, type **Employee**).

---

## Screen 10 — Plan detail (enrolled employees)
**Route** `/insurance/enrollments/[id]/[planId]` · **Component** `pages/insurance/enrollments/[id]/[planId]/index.vue`

**Layout** — column `gap space.6`: plan overview band → toolbar → table → pagination.

**Components**
| Element | Component | Variant / size | DT / props |
| --- | --- | --- | --- |
| Branch / Organization filter | `MpAutocomplete` | md | searchable, clearable |
| All filters | `MpButton` → `MpDrawer` (filter sections) | secondary md | |
| Column settings | `MpPopover` + `MpCheckbox` list | icon 20 | some columns locked |
| Export | `<button>`+`css()` + `MpTooltip` → modal 10d | icon `upload` 20 | |
| Table | `MpTable` | — | sticky **Employee name** (left) + **Actions** (right) columns |
| Sticky dividers | `css()` inset shadow `inset ±1px 0 0 #D0D6DD` | — | left col when scrolled; right col when **not** at scroll-end |
| Status | `MpBadge` `type="completed"` | md | |
| Dependents | `MpTextlink` "N dependents" → modal | — | |
| Row actions | `MpPopover` + `MpButton` (`caret-down`) | secondary md | `use-portal`; View details / Edit / Remove |

**Interactions** — Add employee ▾ → Screen 11 / Screen 9 · Export → modal 10d · row Actions → 10a / 10b / 10c.

**States** — list · filtered/empty · horizontal scroll (sticky dividers appear).

### 10a — View details (drawer)
`MpDrawer` right md, header (×) only (no footer). Shows Insurance plan + Dependents (Spouse / Children as a tight `gap space.1` list). Read-only.

### 10b — Edit (drawer)
`MpDrawer` right md. Employee card · Insurance plan picker (`MpPopover`+`MpSelect`, change plan) · Dependents management (`MpCheckbox` spouse/children). Footer Cancel / Save changes → toast "Changes saved". Reassigning plan moves the employee off this plan's table.

### 10c — Remove from plan (confirm)
`MpModal` `sm` centered. "Remove from plan?" / "{name} will be removed from the {plan} plan. This action can't be undone." Cancel (ghost) + Remove (danger) → toast "{name} removed from {plan}".

### 10d — Export data (modal)
`MpModal` `md`. "A download link will be sent to your email." · **Effective date** `MpRadio` (All dates / Specific effective date → `MpDatePicker use-portal`) · **Export will include** checkbox list (Employee name + ID locked-on; rest toggleable). Export disabled until specific date chosen. Footer Cancel / Export → toast "Export in progress. We'll email you the download link once it's ready." Gap radios→checkbox group = 20px.

---

## Screen 11 — Add employees (plan level)
**Route** `/insurance/enrollments/[id]/[planId]/add` · **Entry** Screen 10 → Add employee · **Component** `pages/insurance/enrollments/[id]/[planId]/add.vue`

Same as Screen 8 **minus** the Insurance plan column and bulk-assign (plan is already known). Columns: ☑+Employee name · Effective start date · Dependents · remove. Drawer 8a + modal 8b reused. Save → toast "Employees enrolled" → Screen 10.

---

## Shared components
| Component | Used by |
| --- | --- |
| `InsuranceImportFlow.vue` | Screens 9 (employee imports) |
| `InsurancePlanTable.vue` | Screen 1 |
| `InsuranceStateEmpty.vue` | empty / not-found / no-error states across screens |
| `InsuranceFirstRun.vue` | Screen 1 first-run |
| `TablePagination` | list tables |
| `useInsuranceImportLogs.ts` | Screens 3, 4, 9 (`logs` / `getLog` / `addLog`) |
