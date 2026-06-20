# Insurance & Enrollments — User Stories

User stories for the Insurance module (insurance plans, enrollments, employees, imports). Role: **Admin** (HR/benefits admin) unless noted. Built with Nuxt 3 + Pixel 3 (DT 2.4); data mocked client-side.

Route map and conventions are at the end (§Appendix).

---

## Epic A — Insurance plans

### A1 — View insurance plans
**As an** admin, **I want** to see all insurance plans grouped by coverage period, **so that** I can review what's available.
**Acceptance criteria**
- Plans are grouped by coverage period and show benefit types, provider, broker, status, and last-updated.
- I can filter by benefit type and search by plan name.
- States are handled: first-run (no plans), empty (import queued), list, search-not-found, filter-not-found.

### A2 — Import insurance plans
**As an** admin, **I want** to import insurance plans from a template, **so that** I can add many plans at once.
**Acceptance criteria**
- From the plans page I open Import insurance plan → download template → upload the filled file.
- File is validated (CSV/XLS/XLSX, ≤10 MB, non-empty, single file).
- On Import I get a toast *"Import started. Track the status in Import history."* and land on Import history with a new **Processing** entry.

### A3 — Delete an insurance plan (coverage period)
**As an** admin, **I want** to delete an insurance plan that isn't associated with any enrollment, **so that** I can clean up unused plans.
**Acceptance criteria**
- Each coverage period has a delete action.
- Delete is allowed only when the coverage period is **not** used in any enrollment; otherwise it's disabled with an explanatory tooltip.
- Deleting asks for confirmation ("Delete insurance plan?" with impact) and removes the whole coverage period and all its plans, then shows a success toast.
- To delete a plan that's in use, I must delete its enrollment first (see E5).

---

## Epic B — Enrollments

### B1 — View enrollments
**As an** admin, **I want** a list of enrollments, **so that** I can find and open one.
**Acceptance criteria**
- List shows name (+ Draft badge), coverage period, last updated by.
- I can search by name; each row has Actions (View details, Edit, Delete).

### B2 — Create / edit an enrollment
**As an** admin, **I want** to create an enrollment in a guided flow, **so that** I can set details and assign plans.
**Acceptance criteria**
- A 3-step wizard: Set details → Assign plans → Review.
- Edit reuses the same wizard pre-filled.

### B3 — View enrollment detail
**As an** admin, **I want** an enrollment detail page, **so that** I can see its overview and plan roster.
**Acceptance criteria**
- Overview band shows coverage period, benefit types, insurance provider, insurance broker, not-enrolled and total-enrolled counts.
- Plan roster lists each plan with enrolled counts; the plan name and a "View details" button both open the plan detail.

### B4 — View full enrollment details (drawer)
**As an** admin, **I want** to open full enrollment details, **so that** I can see metadata not on the overview band.
**Acceptance criteria**
- "View enrollment details" opens a drawer showing name (+ Draft), coverage period, benefit type, provider, broker, counts, **Created on**, **Created by**.
- The drawer closes via the header (×) / overlay / Esc (no footer button).

### B5 — Delete an enrollment
**As an** admin, **I want** to delete an enrollment, **so that** I can then delete its insurance plan.
**Acceptance criteria**
- Delete (from the list Actions) asks for confirmation.
- Deleting the enrollment does **not** delete its insurance plans automatically — they remain and are deleted manually from the plans page (A3).

---

## Epic C — Add employees to a plan

### C1 — Add employees from the plan detail (manual)
**As an** admin, **I want** to add employees to a specific plan, **so that** they're enrolled in it.
**Acceptance criteria**
- From a plan's "Add employee", I open a form, **Select employees** via a drawer (available vs selected, search, Filters, Add all).
- Each added row: effective start date and optional **Add dependents** (spouse + children).
- Save shows an "Employees enrolled" toast and returns to the plan.

### C2 — Add employees from the enrollment detail (manual, choose plan)
**As an** admin, **I want** to add employees from the enrollment level, **so that** I can enroll without first opening a specific plan.
**Acceptance criteria**
- After selecting employees, each row has a **required Insurance plan** picker (the enrollment's plans).
- Save is disabled until every selected employee has a plan.

### C3 — Bulk-assign a plan to many employees
**As an** admin with many selected employees, **I want** to assign the same plan to all/some at once, **so that** I don't set them one by one.
**Acceptance criteria**
- A checkbox in the first column selects rows; the header checkbox selects all (indeterminate when partial).
- When ≥1 is selected, the table header becomes a bulk bar: `[✓] N selected · Assign insurance plan` … `Esc to clear selection`.
- "Assign insurance plan" opens a popover of plans; choosing one applies it to all selected, toasts, and clears the selection.
- Esc clears the selection.

### C4 — Add employees via import
**As an** admin, **I want** to add employees by importing a file, **so that** I can enroll many at once.
**Acceptance criteria**
- "Add employee ▾ → Upload from CSV" opens an import page (same flow as plan import: download template → upload → Import).
- Plan-level import targets that plan; enrollment-level import's template includes a plan column.
- The run appears in Import history with type **Employee**.

---

## Epic D — Manage enrolled employees (plan detail)

### D1 — Review the enrolled roster
**As an** admin, **I want** to review enrolled employees, **so that** I can manage coverage.
**Acceptance criteria**
- Plan overview (benefit type, coverage period, total enrolled).
- Toolbar: Branch/Organization filters, All filters drawer, Column settings, Export, search.
- Sticky first (employee) and last (Actions) columns with scroll-aware dividers; "N dependents" opens a dependents modal.

### D2 — View an employee's enrollment
**As an** admin, **I want** to view an employee's enrolled plan and dependents, **so that** I can verify coverage.
**Acceptance criteria**
- Actions → View details opens a read-only drawer with the enrolled plan and dependents (spouse, children).

### D3 — Edit an employee's enrollment
**As an** admin, **I want** to change an employee's plan and dependents, **so that** I can correct or update coverage.
**Acceptance criteria**
- Actions → Edit opens a drawer with a plan picker (change plan) and dependent checkboxes (manage spouse/children).
- Save updates the row; reassigning to a different plan moves the employee off this plan's table.

### D4 — Remove an employee from a plan
**As an** admin, **I want** to remove an employee from a plan, **so that** they're no longer enrolled.
**Acceptance criteria**
- Actions → Remove asks for confirmation, then removes the row and toasts.

### D5 — Export the roster
**As an** admin, **I want** to export enrolled employees, **so that** I can share/analyze them.
**Acceptance criteria**
- Export opens a modal: effective date (all dates / specific date) and columns to include.
- Export is async; a toast says the download link will be emailed.

---

## Epic E — Import history

### E1 — View import history
**As an** admin, **I want** a history of all imports, **so that** I can track their status.
**Acceptance criteria**
- Lists both insurance-plan and employee imports with File name, **Import type**, Imported by, Imported on, **Status** (Processing / Success / Partially failed / Failed).

### E2 — View import result & errors
**As an** admin, **I want** to open a failed/partial import, **so that** I can fix the source file.
**Acceptance criteria**
- "View details" (hidden while Processing) opens an import detail: overview (file download link, imported by/on, status, Total/Imported/Failed) and an **Error logs** table (Row · Column · Error message).
- A successful import shows a "No errors" state.

---

## Appendix — Routes & conventions

**Routes**
- Plans: `/insurance/plans` · `/insurance/plans/import` · `/insurance/plans/import-history` · `/insurance/plans/import-history/[logId]`
- Enrollments: `/insurance/enrollments` · `/create` · `/[id]` · `/[id]/add` · `/[id]/import` · `/[id]/[planId]` · `/[id]/[planId]/add` · `/[id]/[planId]/import`

**Conventions**
- Dropdowns use `MpPopover` (MpSelect trigger + `MpPopoverList`); `use-portal` inside tables.
- Confirmation modals: title `Delete X?`, impact body (no "Are you sure"), default text color, primary button = the action verb.
- Toasts: `top-center`, `[Object] + past-participle` (detail goes in the title — no description field).
- Section spacing summary / filter / table = 24px; table and pagination stay attached.
- Pixel 3 DT 2.4 only; styling via `css()` (no raw `<style>`).
