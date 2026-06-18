<!--
  Mekari Flex — Insurance · Enrollment · Plan detail (enrolled employees)
  Reached from an enrollment detail by clicking a plan's "View details".
  Shows a plan overview band + the employees enrolled in that plan.
  Source: Figma 9493:148336. Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpButton, MpBadge, MpAvatar, MpTooltip,
  MpAutocomplete,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpCheckbox,
  MpModal, MpModalContent, MpModalHeader, MpModalBody, MpModalCloseButton, MpModalOverlay,
  MpDrawer, MpDrawerContent, MpDrawerHeader, MpDrawerBody, MpDrawerFooter,
  MpDrawerCloseButton, MpDrawerOverlay,
  MpButtonGroup,
  css,
} from '@mekari/pixel3'

definePageMeta({ navKey: 'insurance' })

// ── Lookups (mock; replace with API) ───────────────────────────────────────────
const ENROLLMENTS: Record<string, { name: string; coveragePeriod: string }> = {
  'e-2026': { name: 'FY2026 Rawat Inap', coveragePeriod: '1 Jan - 31 Dec 2026' },
  'e-dental': { name: 'Dental Add-on 2026', coveragePeriod: '1 Jan - 31 Dec 2026' },
  'e-2025': { name: '2025 Health Enrollment', coveragePeriod: '1 Jan - 31 Dec 2025' },
}
const PLANS: Record<string, { name: string; benefitType: string }> = {
  'ri2500': { name: 'RI 2500', benefitType: 'Inpatient' },
  'ri2000': { name: 'RI 2000', benefitType: 'Inpatient' },
  'ri1500': { name: 'RI 1500', benefitType: 'Inpatient' },
  'ri1000': { name: 'RI 1000', benefitType: 'Inpatient' },
  'ri500': { name: 'RI 500', benefitType: 'Inpatient' },
  'dental-basic': { name: 'Dental Basic', benefitType: 'Dental' },
  'dental-plus': { name: 'Dental Plus', benefitType: 'Dental' },
}

interface EmployeeRow {
  id: string
  name: string
  employeeId: string
  status: string
  branch: string
  organization: string
  jobPosition: string
  jobLevel: string
  gender: string
  dependents: number
  effectiveDate: string
  enrolledDate: string
  premiumCost: string
  enrolledBy: string
}

// Per-plan employee roster keyed by "enrollmentId/planId".
// Counts match the enrolled numbers shown on the enrollment detail page.
const PLAN_EMPLOYEES: Record<string, EmployeeRow[]> = {
  'e-dental/dental-basic': [
    { id: 'cp08823', name: 'Dewi Rahayu', employeeId: 'CP08823', status: 'Active', branch: 'Jakarta', organization: 'HR', jobPosition: 'HR Admin', jobLevel: 'Job level 8', gender: 'Female', dependents: 1, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp150.000', enrolledBy: 'System' },
    { id: 'cp04412', name: 'Gita Permata', employeeId: 'CP04412', status: 'Active', branch: 'Surabaya', organization: 'Finance', jobPosition: 'Finance Analyst', jobLevel: 'Job level 9', gender: 'Female', dependents: 0, effectiveDate: '1 Mar - 31 Dec 2026', enrolledDate: '1 Mar 2026', premiumCost: 'Rp150.000', enrolledBy: 'Rizal Candra' },
    { id: 'cp03321', name: 'Kartika Sari', employeeId: 'CP03321', status: 'Active', branch: 'Bali', organization: 'Creative', jobPosition: 'UI Designer', jobLevel: 'Job level 10', gender: 'Female', dependents: 1, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp150.000', enrolledBy: 'System' },
    { id: 'cp06543', name: 'Ratna Dewi', employeeId: 'CP06543', status: 'Active', branch: 'Bali', organization: 'Administration', jobPosition: 'Office Manager', jobLevel: 'Job level 9', gender: 'Female', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp150.000', enrolledBy: 'System' },
  ],
  'e-dental/dental-plus': [
    { id: 'cp12349', name: 'Agung Setiawarman', employeeId: 'CP12349', status: 'Active', branch: 'Makasar', organization: 'Information & Security', jobPosition: 'Data Analyst', jobLevel: 'Job level 11', gender: 'Male', dependents: 3, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp12341', name: 'Alfian Ramadhan', employeeId: 'CP12341', status: 'Active', branch: 'Surabaya', organization: 'Product', jobPosition: 'Product Designer', jobLevel: 'Job level 12', gender: 'Male', dependents: 2, effectiveDate: '10 Mar - 31 Dec 2026', enrolledDate: '10 Mar 2026', premiumCost: 'Rp250.000', enrolledBy: 'Rizal Candra' },
    { id: 'cp06789', name: 'Ali Imran', employeeId: 'CP06789', status: 'Active', branch: 'Semarang', organization: 'Legal', jobPosition: 'Account Executive', jobLevel: 'Job level 12', gender: 'Male', dependents: 3, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp00004', name: 'Cinta Ayu', employeeId: 'CP00004', status: 'Active', branch: 'Jakarta', organization: 'Administration', jobPosition: 'Creative Designer', jobLevel: 'Job level 9', gender: 'Female', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp11234', name: 'Hendra Wijaya', employeeId: 'CP11234', status: 'Active', branch: 'Jakarta', organization: 'Marketing', jobPosition: 'Marketing Manager', jobLevel: 'Job level 7', gender: 'Male', dependents: 4, effectiveDate: '1 Feb - 31 Dec 2026', enrolledDate: '1 Feb 2026', premiumCost: 'Rp250.000', enrolledBy: 'Rizal Candra' },
    { id: 'cp07765', name: 'Indah Kusuma', employeeId: 'CP07765', status: 'Active', branch: 'Bandung', organization: 'Product', jobPosition: 'Product Manager', jobLevel: 'Job level 8', gender: 'Female', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2026', enrolledDate: '2 Jan 2026', premiumCost: 'Rp250.000', enrolledBy: 'System' },
  ],
  'e-2025/ri2500': [
    { id: 'cp09901', name: 'Fajar Nugroho', employeeId: 'CP09901', status: 'Active', branch: 'Bandung', organization: 'Engineering', jobPosition: 'Backend Engineer', jobLevel: 'Job level 10', gender: 'Male', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp450.000', enrolledBy: 'System' },
    { id: 'cp13456', name: 'Nanda Putra', employeeId: 'CP13456', status: 'Active', branch: 'Surabaya', organization: 'Engineering', jobPosition: 'Frontend Engineer', jobLevel: 'Job level 11', gender: 'Male', dependents: 0, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp450.000', enrolledBy: 'System' },
  ],
  'e-2025/ri2000': [
    { id: 'cp05543', name: 'Joko Prasetyo', employeeId: 'CP05543', status: 'Active', branch: 'Semarang', organization: 'Operations', jobPosition: 'Operations Lead', jobLevel: 'Job level 9', gender: 'Male', dependents: 3, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp350.000', enrolledBy: 'System' },
    { id: 'cp10876', name: 'Lukman Hakim', employeeId: 'CP10876', status: 'Active', branch: 'Makasar', organization: 'Sales', jobPosition: 'Sales Executive', jobLevel: 'Job level 11', gender: 'Male', dependents: 2, effectiveDate: '15 Apr - 31 Dec 2025', enrolledDate: '15 Apr 2025', premiumCost: 'Rp350.000', enrolledBy: 'Rizal Candra' },
    { id: 'cp02198', name: 'Maya Anggraini', employeeId: 'CP02198', status: 'Active', branch: 'Jakarta', organization: 'HR', jobPosition: 'Training Specialist', jobLevel: 'Job level 9', gender: 'Female', dependents: 3, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp350.000', enrolledBy: 'System' },
  ],
  'e-2025/ri1500': [
    { id: 'cp01987', name: 'Olivia Santoso', employeeId: 'CP01987', status: 'Active', branch: 'Bandung', organization: 'Finance', jobPosition: 'Financial Controller', jobLevel: 'Job level 7', gender: 'Female', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp14567', name: 'Pandu Wicaksono', employeeId: 'CP14567', status: 'Active', branch: 'Jakarta', organization: 'Legal', jobPosition: 'Legal Counsel', jobLevel: 'Job level 8', gender: 'Male', dependents: 1, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp03565', name: 'Eka Setiawan', employeeId: 'CP03565', status: 'Active', branch: 'Bali', organization: 'Creative', jobPosition: 'Office Assistant', jobLevel: 'Job level 10', gender: 'Male', dependents: 3, effectiveDate: '1 Mar - 31 Dec 2025', enrolledDate: '1 Mar 2025', premiumCost: 'Rp250.000', enrolledBy: 'Rizal Candra' },
    { id: 'cp08823', name: 'Dewi Rahayu', employeeId: 'CP08823', status: 'Active', branch: 'Jakarta', organization: 'HR', jobPosition: 'HR Admin', jobLevel: 'Job level 8', gender: 'Female', dependents: 1, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp250.000', enrolledBy: 'System' },
    { id: 'cp04412', name: 'Gita Permata', employeeId: 'CP04412', status: 'Active', branch: 'Surabaya', organization: 'Finance', jobPosition: 'Finance Analyst', jobLevel: 'Job level 9', gender: 'Female', dependents: 0, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp250.000', enrolledBy: 'System' },
  ],
  'e-2025/ri1000': [
    { id: 'cp12349', name: 'Agung Setiawarman', employeeId: 'CP12349', status: 'Active', branch: 'Makasar', organization: 'Information & Security', jobPosition: 'Data Analyst', jobLevel: 'Job level 11', gender: 'Male', dependents: 3, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp150.000', enrolledBy: 'System' },
    { id: 'cp12341', name: 'Alfian Ramadhan', employeeId: 'CP12341', status: 'Active', branch: 'Surabaya', organization: 'Product', jobPosition: 'Product Designer', jobLevel: 'Job level 12', gender: 'Male', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp150.000', enrolledBy: 'System' },
    { id: 'cp06789', name: 'Ali Imran', employeeId: 'CP06789', status: 'Active', branch: 'Semarang', organization: 'Legal', jobPosition: 'Account Executive', jobLevel: 'Job level 12', gender: 'Male', dependents: 3, effectiveDate: '15 Jun - 31 Dec 2025', enrolledDate: '15 Jun 2025', premiumCost: 'Rp150.000', enrolledBy: 'Rizal Candra' },
  ],
  'e-2025/ri500': [
    { id: 'cp00004', name: 'Cinta Ayu', employeeId: 'CP00004', status: 'Active', branch: 'Jakarta', organization: 'Administration', jobPosition: 'Creative Designer', jobLevel: 'Job level 9', gender: 'Female', dependents: 2, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp75.000', enrolledBy: 'System' },
    { id: 'cp03321', name: 'Kartika Sari', employeeId: 'CP03321', status: 'Active', branch: 'Bali', organization: 'Creative', jobPosition: 'UI Designer', jobLevel: 'Job level 10', gender: 'Female', dependents: 1, effectiveDate: '1 Jan - 31 Dec 2025', enrolledDate: '2 Jan 2025', premiumCost: 'Rp75.000', enrolledBy: 'System' },
  ],
}

// Dependent data keyed by employee id — counts match the `dependents` field in PLAN_EMPLOYEES.
interface DependentInfo { spouse?: string; children: string[] }
const DEPENDENTS: Record<string, DependentInfo> = {
  'cp08823': { children: ['Dewi Anggraini'] },
  'cp03321': { children: ['Kartika Putri'] },
  'cp06543': { spouse: 'Budi Santoso', children: ['Ratna Putri'] },
  'cp12349': { spouse: 'Siti Aisyah', children: ['Gina Setiawarman', 'Jelita Setiawarman'] },
  'cp12341': { spouse: 'Putri Ramadhan', children: ['Alfian Jr.'] },
  'cp06789': { spouse: 'Fatimah Imran', children: ['Ali Ahmad', 'Rizky Imran'] },
  'cp00004': { spouse: 'Doni Pratama', children: ['Ayu Pratama'] },
  'cp11234': { spouse: 'Sari Wijaya', children: ['Budi Wijaya', 'Putri Wijaya', 'Rian Wijaya'] },
  'cp07765': { spouse: 'Anton Kusuma', children: ['Indah Kusuma Jr.'] },
  'cp09901': { spouse: 'Lina Nugroho', children: ['Fajar Putra'] },
  'cp05543': { spouse: 'Ratih Prasetyo', children: ['Joko Putra', 'Budi Prasetyo'] },
  'cp10876': { spouse: 'Nisa Hakim', children: ['Lukman Putra'] },
  'cp02198': { spouse: 'Budi Anggraini', children: ['Maya Putri', 'Rizky Anggraini'] },
  'cp01987': { spouse: 'Dian Santoso', children: ['Olivia Putri'] },
  'cp14567': { children: ['Pandu Putra'] },
  'cp03565': { spouse: 'Lestari Setiawan', children: ['Eka Putra', 'Budi Setiawan'] },
}

// Deterministic avatar color (keyed off the row id) so it doesn't reshuffle on
// every refresh — MpAvatar picks a random variant-color when none is given.
const AVATAR_COLORS = ['sky', 'teal', 'violet', 'amber', 'rose', 'lime', 'pink', 'stone']
function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const route = useRoute()
const enrollment = computed(() => ENROLLMENTS[route.params.id as string] ?? ENROLLMENTS['e-2026'])
const plan = computed(() => PLANS[route.params.planId as string] ?? { name: route.params.planId as string, benefitType: 'Inpatient' })

// ── Title bar (path-stamped injector — race-free on client nav) ─────────────────
const setPageHeader = inject<(c: unknown) => void>('setPageHeader')
watchEffect(() => {
  setPageHeader?.({
    title: plan.value.name,
    breadcrumb: [
      { label: 'Enrollments', to: '/insurance/enrollments' },
      { label: enrollment.value.name, to: `/insurance/enrollments/${route.params.id}` },
    ],
    headerRight: {
      label: 'Add employee', variant: 'primary', rightIcon: 'caret-down',
      items: [{ label: 'Add employee' }, { label: 'Upload from CSV' }],
      onSelect: (label: string) => {
        if (label === 'Add employee') navigateTo(`/insurance/enrollments/${route.params.id}/${route.params.planId}/add`)
        /* TODO: Upload from CSV flow */
      },
    },
  })
})

// ── Filters + search + pagination ───────────────────────────────────────────────
const branchFilter = ref('')
const orgFilter = ref('')
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const employees = computed(() => PLAN_EMPLOYEES[`${route.params.id}/${route.params.planId}`] ?? [])
const branches = computed(() => [...new Set(employees.value.map((e) => e.branch))])
const organizations = computed(() => [...new Set(employees.value.map((e) => e.organization))])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const appliedEntries = Object.entries(drawerApplied)
  return employees.value.filter((e) => {
    if (branchFilter.value && e.branch !== branchFilter.value) return false
    if (orgFilter.value && e.organization !== orgFilter.value) return false
    if (q && !e.name.toLowerCase().includes(q) && !e.employeeId.toLowerCase().includes(q)) return false
    for (const [key, vals] of appliedEntries) {
      if (!vals?.size) continue
      if (!vals.has((e as unknown as Record<string, string>)[key])) return false
    }
    return true
  })
})
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})
watch([search, perPage, branchFilter, orgFilter], () => { currentPage.value = 1 })

const totalEnrolled = computed(() => employees.value.length)

// ── Column visibility ───────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'employeeName',      label: 'Employee name',      disabled: true },
  { key: 'employmentStatus',  label: 'Employment status',  disabled: true },
  { key: 'branch',            label: 'Branch',             disabled: false },
  { key: 'organization',      label: 'Organization',       disabled: false },
  { key: 'jobPosition',       label: 'Job position',       disabled: false },
  { key: 'jobLevel',          label: 'Job level',          disabled: false },
  { key: 'gender',            label: 'Gender',             disabled: false },
  { key: 'dependents',        label: 'Dependents',         disabled: false },
  { key: 'effectiveDate',     label: 'Effective date',     disabled: true },
  { key: 'enrolledDate',      label: 'Enrolled date',      disabled: true },
  { key: 'enrolledBy',        label: 'Enrolled by',        disabled: true },
]
const visibleCols = ref(new Set(COLUMNS.map((c) => c.key)))
function toggleCol(key: string) {
  const col = COLUMNS.find((c) => c.key === key)
  if (!col || col.disabled) return
  const next = new Set(visibleCols.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  visibleCols.value = next
}

// ── Dependents modal ───────────────────────────────────────────────────────────
const isDepModalOpen = ref(false)
const depModalRow = ref<EmployeeRow | null>(null)

function viewDependents(row: EmployeeRow) {
  depModalRow.value = row
  isDepModalOpen.value = true
}
function closeDepModal() { isDepModalOpen.value = false }

function onAction(_action: string, _row: EmployeeRow) { /* TODO: view / edit / remove employee */ }
function exportList() { /* TODO: export enrolled employees */ }

// ── Scroll-aware sticky border ──────────────────────────────────────────────────
// rAF poll instead of scroll event — Pixel's internal scroll handler swallows
// the event, making event-based detection unreliable across environments.
const isScrolled = ref(false)
const tableWrapperRef = ref<HTMLElement | null>(null)
let _scrollEl: HTMLElement | null = null
let _rafId: number | null = null
function _pollScroll() {
  const scrolled = (_scrollEl?.scrollLeft ?? 0) > 0
  if (scrolled !== isScrolled.value) isScrolled.value = scrolled
  _rafId = requestAnimationFrame(_pollScroll)
}
onMounted(async () => {
  await nextTick()
  const wrapper = tableWrapperRef.value
  if (!wrapper) return
  // Walk all descendants (incl. wrapper itself) to find the horizontally-scrollable
  // container — avoids hardcoding Pixel's internal class name.
  const candidates = [wrapper, ...Array.from(wrapper.querySelectorAll('*'))] as HTMLElement[]
  _scrollEl = candidates.find((el) => {
    const s = window.getComputedStyle(el)
    return (s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth
  }) ?? null
  if (_scrollEl) _rafId = requestAnimationFrame(_pollScroll)
})
onUnmounted(() => { if (_rafId !== null) cancelAnimationFrame(_rafId) })

// ── All-filters drawer ──────────────────────────────────────────────────────────
interface FilterField { key: string; label: string }
const FILTER_FIELDS: FilterField[] = [
  { key: 'branch',       label: 'Branch' },
  { key: 'organization', label: 'Organization' },
  { key: 'jobPosition',  label: 'Job position' },
  { key: 'jobLevel',     label: 'Job level' },
  { key: 'gender',       label: 'Gender' },
]
const FILTER_LABEL: Record<string, string> = Object.fromEntries(FILTER_FIELDS.map((f) => [f.key, f.label]))

const isFilterDrawerOpen = ref(false)
const drawerSections = ref<string[]>([])
const sectionExpanded = ref<Set<string>>(new Set())

// Use reactive so Vue 3 can track Set mutations (add/delete/has) as dependencies.
const drawerPending = reactive<Record<string, Set<string>>>({})
const sectionSearch = reactive<Record<string, string>>({})
const drawerApplied = reactive<Record<string, Set<string>>>({})

const appliedFilterCount = computed(() =>
  Object.values(drawerApplied).filter((s) => s.size > 0).length)
const availableFilterFields = computed(() =>
  FILTER_FIELDS.filter((f) => !drawerSections.value.includes(f.key)))

function sectionOptions(key: string): string[] {
  return [...new Set(employees.value.map((e) => String((e as unknown as Record<string, string>)[key])))]
}
function filteredSectionOptions(key: string): string[] {
  const q = (sectionSearch[key] ?? '').toLowerCase()
  const opts = sectionOptions(key)
  return q ? opts.filter((o) => o.toLowerCase().includes(q)) : opts
}
function isAllSelected(key: string): boolean {
  const opts = sectionOptions(key)
  const sel = drawerPending[key]
  return opts.length > 0 && !!sel && opts.every((o) => sel.has(o))
}
function isPartiallySelected(key: string): boolean {
  const sel = drawerPending[key]
  return !!sel && sel.size > 0 && !isAllSelected(key)
}

function toggleSelectAll(key: string) {
  const opts = sectionOptions(key)
  drawerPending[key] = isAllSelected(key) ? new Set() : new Set(opts)
}
function toggleSectionValue(key: string, val: string) {
  const cur = drawerPending[key] ?? new Set<string>()
  if (cur.has(val)) cur.delete(val)
  else cur.add(val)
}
function toggleSectionExpanded(key: string) {
  const next = new Set(sectionExpanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  sectionExpanded.value = next
}
function addFilterSection(key: string) {
  if (drawerSections.value.includes(key)) return
  drawerSections.value = [...drawerSections.value, key]
  drawerPending[key] = new Set()
  const next = new Set(sectionExpanded.value)
  next.add(key)
  sectionExpanded.value = next
}
function removeSection(key: string) {
  drawerSections.value = drawerSections.value.filter((k) => k !== key)
  delete drawerPending[key]
  delete sectionSearch[key]
  const next = new Set(sectionExpanded.value)
  next.delete(key)
  sectionExpanded.value = next
}
function openFilterDrawer() {
  // Restore sections + pending state from last applied
  const keys = Object.keys(drawerApplied).filter((k) => FILTER_FIELDS.some((f) => f.key === k))
  drawerSections.value = keys
  for (const k of Object.keys(drawerPending)) delete drawerPending[k]
  for (const [k, v] of Object.entries(drawerApplied)) drawerPending[k] = new Set(v)
  for (const k of Object.keys(sectionSearch)) delete sectionSearch[k]
  sectionExpanded.value = new Set(keys)
  isFilterDrawerOpen.value = true
}
function closeFilterDrawer() { isFilterDrawerOpen.value = false }
function applyFilters() {
  for (const k of Object.keys(drawerApplied)) delete drawerApplied[k]
  for (const key of drawerSections.value) {
    if (drawerPending[key]?.size) drawerApplied[key] = new Set(drawerPending[key])
  }
  isFilterDrawerOpen.value = false
  currentPage.value = 1
}
function removeAllFilters() {
  drawerSections.value = []
  for (const k of Object.keys(drawerPending)) delete drawerPending[k]
  for (const k of Object.keys(sectionSearch)) delete sectionSearch[k]
  sectionExpanded.value = new Set()
}

// ── styles ─────────────────────────────────────────────────────────────────────
const overviewCard = css({
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
})
const overviewHeader = css({ display: 'flex', alignItems: 'center', gap: '4', padding: '3', background: 'gray.25' })
const statCol = css({ display: 'flex', flexDirection: 'column', gap: '1', padding: '4', flex: '1 1 0', minWidth: '0' })
// Rows carry an avatar, so cells use 8px top/bottom padding to keep row height tight.
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', whiteSpace: 'nowrap', minWidth: '160px' })
const colMin = css({ minWidth: '160px' })
// Employee name column stays pinned while the wide table scrolls horizontally.
// Header cell sits above body cells (zIndex) and uses the surface bg; body cells
// use the white stage bg so scrolled content can't bleed through.
const nameHead = css({ position: 'sticky', left: '0', zIndex: 3, minWidth: '240px', background: 'background.surface' })
const nameCell = css({
  position: 'sticky', left: '0', zIndex: 1, minWidth: '240px',
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', whiteSpace: 'nowrap',
  background: 'background.neutral',
})
// Applied to the sticky name column only when the table is scrolled right.
const nameBorder = css({ borderRightWidth: '1.5px', borderRightStyle: 'solid', borderRightColor: 'border.default' })
// Actions column is sticky on the right — mirrors the name column on the left.
const actionHead = css({ position: 'sticky', right: '0', zIndex: 3, background: 'background.surface', textAlign: 'right' })
const actionCell = css({
  position: 'sticky', right: '0', zIndex: 1,
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap',
  background: 'background.neutral',
})
// Applied to the sticky actions column only when the table is scrolled right.
const actionBorder = css({ borderLeftWidth: '1.5px', borderLeftStyle: 'solid', borderLeftColor: 'border.default' })
const iconBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  width: '40px', height: '40px', borderRadius: 'md', cursor: 'pointer',
  border: 'none', background: 'transparent', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered' },
})
const empId = css({ display: 'block' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <!-- ── Plan overview ───────────────────────────────────────────────────── -->
    <div :class="overviewCard">
      <div :class="overviewHeader">
        <MpText size="label" weight="semiBold" color="text.default">Plan overview</MpText>
      </div>
      <MpFlex align="flex-start" width="100%">
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Benefit type</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ plan.benefitType }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Coverage period</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ enrollment.coveragePeriod }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Total enrolled</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ totalEnrolled }} employees</MpText>
        </div>
      </MpFlex>
    </div>

    <!-- ── Toolbar: filters (left) + export & search (right) ───────────────── -->
    <MpFlex align="center" gap="3" wrap="wrap">
      <!-- Branch filter -->
      <MpFlex width="180px">
        <MpAutocomplete
          id="branch-filter"
          v-model="branchFilter"
          :data="branches"
          placeholder="Branch"
          is-searchable
          is-clearable
          @clear="branchFilter = ''"
        />
      </MpFlex>

      <!-- Organization filter -->
      <MpFlex width="200px">
        <MpAutocomplete
          id="org-filter"
          v-model="orgFilter"
          :data="organizations"
          placeholder="Organization"
          is-searchable
          is-clearable
          @clear="orgFilter = ''"
        />
      </MpFlex>

      <!-- All filters -->
      <MpButton variant="secondary" size="md" @click="openFilterDrawer">
        All filters{{ appliedFilterCount > 0 ? ` (${appliedFilterCount})` : '' }}
      </MpButton>

      <MpFlex align="center" gap="2" marginLeft="auto">
        <MpTooltip label="Column settings" position="top">
          <MpPopover placement="bottom-end">
            <MpPopoverTrigger>
              <button type="button" :class="iconBtn" aria-label="Column settings">
                <PxIcon name="column-settings" :size="20" color="icon.secondary" />
              </button>
            </MpPopoverTrigger>
            <MpPopoverContent :class="css({ minWidth: '196px', padding: '3' })">
              <MpFlex direction="column" gap="3">
                <MpText size="label" weight="semiBold" color="text.default">Show columns</MpText>
                <MpFlex direction="column" gap="2">
                  <MpCheckbox
                    v-for="col in COLUMNS"
                    :key="col.key"
                    :id="`col-${col.key}`"
                    :is-checked="visibleCols.has(col.key)"
                    :is-disabled="col.disabled"
                    @change="toggleCol(col.key)"
                  >{{ col.label }}</MpCheckbox>
                </MpFlex>
              </MpFlex>
            </MpPopoverContent>
          </MpPopover>
        </MpTooltip>
        <MpTooltip label="Export" position="top">
          <button type="button" :class="iconBtn" aria-label="Export" @click="exportList">
            <PxIcon name="upload" :size="20" color="icon.secondary" />
          </button>
        </MpTooltip>
        <MpFlex width="280px">
          <MpInputGroup size="md" is-full-width>
            <MpInputLeftAddon>
              <PxIcon name="search" :size="16" color="icon.secondary" />
            </MpInputLeftAddon>
            <MpInput v-model="search" placeholder="Search employee name/ID..." is-clearable is-full-width />
          </MpInputGroup>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- ── Enrolled employees table ────────────────────────────────────────── -->
    <div ref="tableWrapperRef">
      <MpTableContainer>
        <MpTable :is-hoverable="false">
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th" :class="[nameHead, isScrolled && nameBorder]">Employee name</MpTableCell>
              <MpTableCell v-if="visibleCols.has('employmentStatus')" as="th" :class="colMin">Employment status</MpTableCell>
              <MpTableCell v-if="visibleCols.has('branch')" as="th" :class="colMin">Branch</MpTableCell>
              <MpTableCell v-if="visibleCols.has('organization')" as="th" :class="colMin">Organization</MpTableCell>
              <MpTableCell v-if="visibleCols.has('jobPosition')" as="th" :class="colMin">Job position</MpTableCell>
              <MpTableCell v-if="visibleCols.has('jobLevel')" as="th" :class="colMin">Job level</MpTableCell>
              <MpTableCell v-if="visibleCols.has('gender')" as="th" :class="colMin">Gender</MpTableCell>
              <MpTableCell v-if="visibleCols.has('dependents')" as="th" :class="colMin">Dependents</MpTableCell>
              <MpTableCell v-if="visibleCols.has('effectiveDate')" as="th" :class="colMin">Effective date</MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledDate')" as="th" :class="colMin">Enrolled date</MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledBy')" as="th" :class="colMin">Enrolled by</MpTableCell>
              <MpTableCell as="th" :class="[actionHead, actionBorder]" />
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="row in paginated" :key="row.id">
              <MpTableCell as="td" :class="[nameCell, isScrolled && nameBorder]">
                <MpFlex align="center" gap="3">
                  <MpAvatar :id="`avatar-${row.id}`" :name="row.name" size="lg" :variant-color="avatarColor(row.id)" />
                  <MpFlex direction="column" gap="0">
                    <MpText size="body" color="text.default">{{ row.name }}</MpText>
                    <MpText :class="empId" size="body-small" color="text.secondary">{{ row.employeeId }}</MpText>
                  </MpFlex>
                </MpFlex>
              </MpTableCell>
              <MpTableCell v-if="visibleCols.has('employmentStatus')" as="td" :class="cellPad">
                <MpBadge for="tableStatus" type="completed" size="md">{{ row.status }}</MpBadge>
              </MpTableCell>
              <MpTableCell v-if="visibleCols.has('branch')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.branch }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('organization')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.organization }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('jobPosition')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.jobPosition }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('jobLevel')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.jobLevel }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('gender')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.gender }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('dependents')" as="td" :class="cellPad">
                <MpTextlink @click="viewDependents(row)">{{ row.dependents }} dependents</MpTextlink>
              </MpTableCell>
              <MpTableCell v-if="visibleCols.has('effectiveDate')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.effectiveDate }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledDate')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.enrolledDate }}</MpText></MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledBy')" as="td" :class="cellPad"><MpText size="body" color="text.default">{{ row.enrolledBy }}</MpText></MpTableCell>
              <MpTableCell as="td" :class="[actionCell, actionBorder]">
                <MpPopover use-portal placement="bottom-end" is-close-on-select>
                  <MpPopoverTrigger>
                    <MpButton variant="secondary" size="md" right-icon="caret-down">Actions</MpButton>
                  </MpPopoverTrigger>
                  <MpPopoverContent :class="css({ minWidth: '160px' })">
                    <MpPopoverList>
                      <MpPopoverListItem @click="onAction('view', row)">View details</MpPopoverListItem>
                      <MpPopoverListItem @click="onAction('edit', row)">Edit</MpPopoverListItem>
                      <MpPopoverListItem @click="onAction('remove', row)">Remove from plan</MpPopoverListItem>
                    </MpPopoverList>
                  </MpPopoverContent>
                </MpPopover>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>

      <TablePagination
        v-model:current-page="currentPage"
        v-model:per-page="perPage"
        :total="filtered.length"
      />
    </div>
  </MpFlex>

  <!-- ── Dependents modal ────────────────────────────────────────────────── -->
  <MpModal
    id="modal-dependents"
    :is-open="isDepModalOpen"
    size="md"
    is-close-on-esc
    is-close-on-overlay-click
    @close="closeDepModal"
  >
    <MpModalContent>
      <MpModalHeader>
        View dependents
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody v-if="depModalRow">
        <MpFlex direction="column" gap="4">
          <!-- Employee card -->
          <MpFlex align="flex-start" gap="3" py="2">
            <MpAvatar
              :id="`dep-avatar-${depModalRow.id}`"
              :name="depModalRow.name"
              size="lg"
              :variant-color="avatarColor(depModalRow.id)"
            />
            <MpFlex direction="column" gap="1">
              <MpText size="body" color="text.default">{{ depModalRow.name }}</MpText>
              <MpText size="body-small" color="text.secondary">
                {{ depModalRow.employeeId }} | {{ depModalRow.jobPosition }} | {{ depModalRow.organization }}
              </MpText>
            </MpFlex>
          </MpFlex>

          <!-- No dependents -->
          <MpFlex v-if="!DEPENDENTS[depModalRow.id]?.spouse && !DEPENDENTS[depModalRow.id]?.children?.length" py="2">
            <MpText size="body" color="text.secondary">No dependents registered.</MpText>
          </MpFlex>

          <!-- Spouse -->
          <MpFlex v-if="DEPENDENTS[depModalRow.id]?.spouse" direction="column">
            <MpText size="label" weight="semiBold" color="text.default">Spouse</MpText>
            <MpFlex py="1">
              <MpText size="body" color="text.default">{{ DEPENDENTS[depModalRow.id]?.spouse }}</MpText>
            </MpFlex>
          </MpFlex>

          <!-- Children -->
          <MpFlex v-if="DEPENDENTS[depModalRow.id]?.children?.length" direction="column">
            <MpText size="label" weight="semiBold" color="text.default">Children</MpText>
            <MpFlex v-for="child in DEPENDENTS[depModalRow.id]?.children" :key="child" py="1">
              <MpText size="body" color="text.default">{{ child }}</MpText>
            </MpFlex>
          </MpFlex>
        </MpFlex>
      </MpModalBody>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>

  <!-- ── All-filters drawer ────────────────────────────────────────────────── -->
  <MpDrawer
    id="drawer-all-filters"
    :is-open="isFilterDrawerOpen"
    placement="right"
    size="md"
    is-keep-alive
    is-close-on-esc
    is-close-on-overlay-click
    @close="closeFilterDrawer"
  >
    <MpDrawerContent>
      <MpDrawerHeader>
        All filters
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" :class="css({ minHeight: '100%' })">
          <!-- Empty state -->
          <MpFlex
            v-if="drawerSections.length === 0"
            direction="column"
            align="center"
            gap="6"
            :class="css({ flex: '1', textAlign: 'center' })"
          >
            <MpFlex direction="column" align="center" gap="6">
              <MpFlex :class="css({ w: '56px', h: '56px', flexShrink: 0 })">
                <PxIcon name="filter" :size="56" color="icon.link" />
              </MpFlex>
              <MpFlex direction="column" gap="1" align="center">
                <MpText size="h3" weight="semiBold" color="text.default">No filters have been set yet</MpText>
                <MpText size="body-small" color="text.secondary">Your filter will be displayed here</MpText>
              </MpFlex>
            </MpFlex>
            <MpPopover placement="bottom" is-close-on-select>
              <MpPopoverTrigger>
                <MpButton variant="textLink" size="sm" left-icon="add">Add filter</MpButton>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ minWidth: '180px' })">
                <MpPopoverList>
                  <MpPopoverListItem
                    v-for="field in availableFilterFields"
                    :key="field.key"
                    @click="addFilterSection(field.key)"
                  >{{ field.label }}</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </MpFlex>

          <!-- Filter sections -->
          <MpFlex v-else direction="column">
            <template v-for="key in drawerSections" :key="key">
              <!-- Section item: border-bottom wraps header + content -->
              <MpFlex
                direction="column"
                :class="css({ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default' })"
              >
                <!-- Section header: py only, no px, no border -->
                <MpFlex align="center" justify="space-between" :class="css({ py: '3' })">
                  <MpFlex direction="column" gap="0.5">
                    <MpText size="h3" weight="semiBold" color="text.default">{{ FILTER_LABEL[key] }}</MpText>
                    <MpText size="body-small" color="text.secondary">is any of</MpText>
                  </MpFlex>
                  <MpFlex align="center" gap="3">
                    <button type="button" :class="iconBtn" aria-label="Remove filter" @click="removeSection(key)">
                      <PxIcon name="minus-circular" :size="24" color="icon.secondary" />
                    </button>
                    <button type="button" :class="iconBtn" aria-label="Toggle section" @click="toggleSectionExpanded(key)">
                      <PxIcon :name="sectionExpanded.has(key) ? 'chevrons-up' : 'chevrons-down'" :size="24" color="icon.secondary" />
                    </button>
                  </MpFlex>
                </MpFlex>

                <!-- Section body: pb-5, no px, no border -->
                <MpFlex
                  v-show="sectionExpanded.has(key)"
                  direction="column"
                  gap="3"
                  :class="css({ pb: '5' })"
                >
                  <MpInputGroup size="md" is-full-width>
                    <MpInputLeftAddon>
                      <PxIcon name="search" :size="16" color="icon.secondary" />
                    </MpInputLeftAddon>
                    <MpInput
                      :model-value="sectionSearch[key] ?? ''"
                      @update:model-value="(v) => { sectionSearch[key] = String(v) }"
                      :placeholder="`Search ${(FILTER_LABEL[key] ?? '').toLowerCase()}...`"
                      is-clearable
                      is-full-width
                    />
                  </MpInputGroup>

                  <!-- Select all: no border-bottom -->
                  <MpFlex>
                    <MpCheckbox
                      :id="`select-all-${key}`"
                      :is-checked="isAllSelected(key)"
                      :is-indeterminate="isPartiallySelected(key)"
                      @change="toggleSelectAll(key)"
                    >Select all {{ (FILTER_LABEL[key] ?? '').toLowerCase() }}</MpCheckbox>
                  </MpFlex>

                  <!-- Options -->
                  <MpFlex direction="column" :class="css({ maxHeight: '140px', overflowY: 'auto' })">
                    <MpFlex v-for="opt in filteredSectionOptions(key)" :key="opt" :class="css({ py: '1' })">
                      <MpCheckbox
                        :id="`filter-${key}-${opt}`"
                        :is-checked="!!(drawerPending[key]?.has(opt))"
                        @change="toggleSectionValue(key, opt)"
                      >{{ opt }}</MpCheckbox>
                    </MpFlex>
                  </MpFlex>
                </MpFlex>
              </MpFlex>
            </template>
          </MpFlex>

          <!-- Add filter (only when sections exist) -->
          <MpFlex v-if="drawerSections.length > 0" :class="css({ px: '4', py: '3' })">
            <MpPopover placement="bottom-start" is-close-on-select>
              <MpPopoverTrigger>
                <MpButton variant="textLink" size="sm" left-icon="add">Add filter</MpButton>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ minWidth: '180px' })">
                <MpPopoverList>
                  <MpPopoverListItem
                    v-for="field in availableFilterFields"
                    :key="field.key"
                    @click="addFilterSection(field.key)"
                  >{{ field.label }}</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex
          align="center"
          :justify="drawerSections.length > 0 ? 'space-between' : 'flex-end'"
          width="100%"
        >
          <MpButton v-if="drawerSections.length > 0" variant="ghost" @click="removeAllFilters">
            Remove all
          </MpButton>
          <MpFlex gap="2">
            <MpButton variant="secondary" @click="closeFilterDrawer">Cancel</MpButton>
            <MpButton @click="applyFilters">Apply filter</MpButton>
          </MpFlex>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
    <MpDrawerOverlay />
  </MpDrawer>
</template>
