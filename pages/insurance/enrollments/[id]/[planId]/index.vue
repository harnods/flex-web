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
  MpCheckbox, MpRadio, MpDatePicker, MpSelect,
  MpModal, MpModalContent, MpModalHeader, MpModalBody, MpModalFooter, MpModalCloseButton, MpModalOverlay,
  MpDrawer, MpDrawerContent, MpDrawerHeader, MpDrawerBody, MpDrawerFooter,
  MpDrawerCloseButton, MpDrawerOverlay,
  MpButtonGroup,
  toast, css,
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
// Plans available per enrollment — drives the "change plan" picker in the edit drawer.
const ENROLLMENT_PLANS: Record<string, { id: string; name: string }[]> = {
  'e-2026': [
    { id: 'ri2500', name: 'RI 2500' }, { id: 'ri2000', name: 'RI 2000' },
    { id: 'ri1500', name: 'RI 1500' }, { id: 'ri1000', name: 'RI 1000' }, { id: 'ri500', name: 'RI 500' },
  ],
  'e-dental': [
    { id: 'dental-basic', name: 'Dental Basic' }, { id: 'dental-plus', name: 'Dental Plus' },
  ],
  'e-2025': [
    { id: 'ri2500', name: 'RI 2500' }, { id: 'ri2000', name: 'RI 2000' },
    { id: 'ri1500', name: 'RI 1500' }, { id: 'ri1000', name: 'RI 1000' }, { id: 'ri500', name: 'RI 500' },
  ],
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
      label: 'Add employee', variant: 'primary',
      onClick: () => navigateTo(`/insurance/enrollments/${route.params.id}/${route.params.planId}/add`),
    },
  })
})

// ── Filters + search + pagination ───────────────────────────────────────────────
const branchFilter = ref('')
const orgFilter = ref('')
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const currentPlanId = computed(() => route.params.planId as string)
const enrollmentPlans = computed(() => ENROLLMENT_PLANS[route.params.id as string] ?? [])
// Local overlays over the mock roster (replace with API mutations).
const removedIds = ref<string[]>([])
const planEdits = reactive<Record<string, string>>({}) // empId → reassigned planId
const depEdits = reactive<Record<string, { spouse: boolean; children: string[] }>>({}) // empId → enrolled dependents

const employees = computed(() => (PLAN_EMPLOYEES[`${route.params.id}/${route.params.planId}`] ?? [])
  .filter((e) => !removedIds.value.includes(e.id))
  // Hide anyone reassigned to a different plan in this session.
  .filter((e) => !planEdits[e.id] || planEdits[e.id] === currentPlanId.value))
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
  { key: 'dependents',        label: 'Member',             disabled: false },
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

// ── Per-employee dependent/plan helpers (apply session overlays) ────────────────
function planNameOf(id: string) { return PLANS[id]?.name ?? id }
function employeePlanId(empId: string) { return planEdits[empId] ?? currentPlanId.value }
// Enrolled dependents for an employee — edited selection if any, else all registered.
function employeeDeps(empId: string): DependentInfo {
  const reg = DEPENDENTS[empId] ?? { children: [] }
  const edit = depEdits[empId]
  if (!edit) return reg
  return { spouse: edit.spouse ? reg.spouse : undefined, children: edit.children }
}
// Each covered member is one row, with the employee columns merged across them
// (rowspan, spreadsheet-style). The FIRST row is the employee (primary insured)
// with their own effective/enrolled date + enroller; the dependent rows follow,
// each with their own (they can be enrolled separately).
interface MemberRow { name: string; relation: string; effectiveDate: string; enrolledDate: string; enrolledBy: string }
const LATER_MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
function depRows(row: EmployeeRow): MemberRow[] {
  const d = employeeDeps(row.id)
  // Row 1 — the employee themselves.
  const rows: MemberRow[] = [{
    name: row.name, relation: 'Employee',
    effectiveDate: row.effectiveDate, enrolledDate: row.enrolledDate, enrolledBy: row.enrolledBy,
  }]
  const deps: { name: string; relation: string }[] = []
  if (d.spouse) deps.push({ name: d.spouse, relation: 'Spouse' })
  for (const c of d.children) deps.push({ name: c, relation: 'Child' })
  const year = row.enrolledDate.split(' ').pop() ?? '2026'
  deps.forEach((n, i) => {
    const m = LATER_MONTHS[i % LATER_MONTHS.length]
    rows.push({
      ...n,
      effectiveDate: `1 ${m} - 31 Dec ${year}`,
      enrolledDate: `1 ${m} ${year}`,
      enrolledBy: i % 2 === 0 ? 'Rizal Candra' : 'System',
    })
  })
  return rows
}
// Precompute deps per page row so the template evaluates depRows() once each.
const paginatedRows = computed(() => paginated.value.map((row) => ({ row, deps: depRows(row) })))

// ── Row actions: view (drawer) · edit (drawer) · remove (confirm) ───────────────
function onAction(action: string, row: EmployeeRow) {
  if (action === 'view') openView(row)
  else if (action === 'edit') openEdit(row)
  else if (action === 'remove') openRemove(row)
}

// Remove from plan — confirmation alert.
const removeTarget = ref<EmployeeRow | null>(null)
const isRemoveOpen = computed(() => !!removeTarget.value)
function openRemove(row: EmployeeRow) { removeTarget.value = row }
function cancelRemove() { removeTarget.value = null }
function confirmRemove() {
  const row = removeTarget.value
  if (!row) return
  removedIds.value = [...removedIds.value, row.id]
  removeTarget.value = null
  toast.notify({ position: 'top-center', variant: 'success', title: `${row.name} removed from ${plan.value.name}` })
}

// View details drawer — read-only plan + dependents.
const viewTarget = ref<EmployeeRow | null>(null)
const isViewOpen = computed(() => !!viewTarget.value)
function openView(row: EmployeeRow) { viewTarget.value = row }
function closeView() { viewTarget.value = null }

// Edit drawer — change plan + manage dependents.
const editTarget = ref<EmployeeRow | null>(null)
const isEditOpen = computed(() => !!editTarget.value)
const editPlanId = ref('')
const editSpouse = ref(false)
const editChildren = ref<string[]>([])
function openEdit(row: EmployeeRow) {
  editTarget.value = row
  editPlanId.value = employeePlanId(row.id)
  const deps = employeeDeps(row.id)
  editSpouse.value = !!deps.spouse
  editChildren.value = [...deps.children]
}
function closeEdit() { editTarget.value = null }
function saveEdit() {
  const row = editTarget.value
  if (!row) return
  planEdits[row.id] = editPlanId.value
  depEdits[row.id] = { spouse: editSpouse.value, children: [...editChildren.value] }
  editTarget.value = null
  toast.notify({ position: 'top-center', variant: 'success', title: 'Changes saved' })
}

// ── Export data modal ────────────────────────────────────────────────────────────
// Always-included identity columns (locked on). The rest default on but are toggleable.
const EXPORT_LOCKED = [
  { key: 'employeeName', label: 'Employee name' },
  { key: 'employeeId', label: 'Employee ID' },
]
const EXPORT_OPTIONAL = [
  { key: 'employmentStatus', label: 'Employment status' },
  { key: 'branch', label: 'Branch' },
  { key: 'organization', label: 'Organization' },
  { key: 'jobPosition', label: 'Job position' },
  { key: 'jobLevel', label: 'Job level' },
  { key: 'gender', label: 'Gender' },
  { key: 'dependents', label: 'Member' },
  { key: 'enrolledDate', label: 'Enrolled date' },
  { key: 'enrolledBy', label: 'Enrolled by' },
]
const isExportModalOpen = ref(false)
const exportDateMode = ref<'all' | 'specific'>('all')
const exportDate = ref<Date | null>(null)
const exportCols = ref<string[]>(EXPORT_OPTIONAL.map((c) => c.key))
// Export is valid unless "specific date" is chosen without a date.
const exportValid = computed(() => exportDateMode.value === 'all' || !!exportDate.value)

function toggleExportCol(key: string) {
  const next = new Set(exportCols.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  exportCols.value = [...next]
}
function openExportModal() {
  exportDateMode.value = 'all'
  exportDate.value = null
  exportCols.value = EXPORT_OPTIONAL.map((c) => c.key)
  isExportModalOpen.value = true
}
function closeExportModal() { isExportModalOpen.value = false }
function confirmExport() {
  if (!exportValid.value) return
  isExportModalOpen.value = false
  // Async export — the file is generated in the background and emailed when ready.
  toast.notify({
    position: 'top-center',
    variant: 'success',
    title: "Export in progress. We'll email you the download link once it's ready.",
  })
}

// ── Scroll-aware sticky border ──────────────────────────────────────────────────
// rAF poll instead of scroll event — Pixel's internal scroll handler swallows
// the event, making event-based detection unreliable across environments.
const isScrolled = ref(false)
const tableWrapperRef = ref<HTMLElement | null>(null)
let _scrollEl: HTMLElement | null = null
let _rafId: number | null = null
function _pollScroll() {
  const el = _scrollEl
  const scrolled = (el?.scrollLeft ?? 0) > 0
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
// Sticky name column divider — shown only when content is scrolled underneath it.
// Uses an inset box-shadow rather than a border: the table is border-collapse,
// and collapsed borders don't follow a position:sticky cell, so a real border
// never paints. An inset shadow is painted by the cell itself → reliably visible.
const nameBorder = css({ boxShadow: 'inset -1px 0 0 0 #D0D6DD' })
// Actions column is sticky on the right — mirrors the name column on the left.
const actionHead = css({ position: 'sticky', right: '0', zIndex: 3, background: 'background.surface', textAlign: 'right' })
const actionCell = css({
  position: 'sticky', right: '0', zIndex: 1,
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap',
  background: 'background.neutral',
})
// Sticky actions column divider — shown only while content is still scrolled
// underneath it (hidden once scrolled to the end / no overflow). Inset box-shadow,
// not a border — see nameBorder note (border-collapse + sticky drops real borders).
const actionBorder = css({ boxShadow: 'inset 1px 0 0 0 #D0D6DD' })
// Left divider on the Member column — separates the merged employee columns from
// the per-member columns. Inset box-shadow (not a border) so it paints reliably
// under border-collapse, matching the sticky-column dividers.
const memberBorder = css({ boxShadow: 'inset 1px 0 0 0 #D0D6DD' })
// Top-aligned variants for cells merged across dependent rows (rowspan) so the
// merged content sits beside the first dependent, spreadsheet-style.
const cellPadTop = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', whiteSpace: 'nowrap', minWidth: '160px' })
const nameCellTop = css({
  position: 'sticky', left: '0', zIndex: 1, minWidth: '240px',
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', whiteSpace: 'nowrap',
  background: 'background.neutral',
})
const actionCellTop = css({
  position: 'sticky', right: '0', zIndex: 1,
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap',
  background: 'background.neutral',
})
const iconBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  width: '40px', height: '40px', borderRadius: 'md', cursor: 'pointer',
  border: 'none', background: 'transparent', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered' },
})
const empId = css({ display: 'block' })
</script>

<template>
  <MpFlex direction="column" gap="6">
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
          <button type="button" :class="iconBtn" aria-label="Export" @click="openExportModal">
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
              <MpTableCell v-if="visibleCols.has('dependents')" as="th" :class="[colMin, memberBorder]">Member</MpTableCell>
              <MpTableCell v-if="visibleCols.has('effectiveDate')" as="th" :class="colMin">Effective date</MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledDate')" as="th" :class="colMin">Enrolled date</MpTableCell>
              <MpTableCell v-if="visibleCols.has('enrolledBy')" as="th" :class="colMin">Enrolled by</MpTableCell>
              <MpTableCell as="th" :class="[actionHead, actionBorder]" />
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <!-- One row per dependent; the other columns merge across them (rowspan). -->
            <template v-for="{ row, deps } in paginatedRows" :key="row.id">
              <MpTableRow v-for="(dep, di) in deps" :key="`${row.id}-${di}`">
                <!-- Merged employee columns — rendered once on the first dependent row -->
                <template v-if="di === 0">
                  <MpTableCell as="td" :rowspan="deps.length" :class="[nameCellTop, isScrolled && nameBorder]">
                    <MpFlex align="center" gap="3">
                      <MpAvatar :id="`avatar-${row.id}`" :name="row.name" size="lg" :variant-color="avatarColor(row.id)" />
                      <MpFlex direction="column" gap="0">
                        <MpText size="body" color="text.default">{{ row.name }}</MpText>
                        <MpText :class="empId" size="body-small" color="text.secondary">{{ row.employeeId }}</MpText>
                      </MpFlex>
                    </MpFlex>
                  </MpTableCell>
                  <MpTableCell v-if="visibleCols.has('employmentStatus')" as="td" :rowspan="deps.length" :class="cellPadTop">
                    <MpBadge for="tableStatus" type="completed" size="md">{{ row.status }}</MpBadge>
                  </MpTableCell>
                  <MpTableCell v-if="visibleCols.has('branch')" as="td" :rowspan="deps.length" :class="cellPadTop"><MpText size="body" color="text.default">{{ row.branch }}</MpText></MpTableCell>
                  <MpTableCell v-if="visibleCols.has('organization')" as="td" :rowspan="deps.length" :class="cellPadTop"><MpText size="body" color="text.default">{{ row.organization }}</MpText></MpTableCell>
                  <MpTableCell v-if="visibleCols.has('jobPosition')" as="td" :rowspan="deps.length" :class="cellPadTop"><MpText size="body" color="text.default">{{ row.jobPosition }}</MpText></MpTableCell>
                  <MpTableCell v-if="visibleCols.has('jobLevel')" as="td" :rowspan="deps.length" :class="cellPadTop"><MpText size="body" color="text.default">{{ row.jobLevel }}</MpText></MpTableCell>
                  <MpTableCell v-if="visibleCols.has('gender')" as="td" :rowspan="deps.length" :class="cellPadTop"><MpText size="body" color="text.default">{{ row.gender }}</MpText></MpTableCell>
                </template>

                <!-- Dependents + their own dates / enroller — one per row (not merged) -->
                <MpTableCell v-if="visibleCols.has('dependents')" as="td" :class="[cellPadTop, memberBorder]">
                  <MpFlex direction="column" gap="0">
                    <MpText size="body" color="text.default">{{ dep.name }}</MpText>
                    <MpText v-if="dep.relation" size="body-small" color="text.secondary">{{ dep.relation }}</MpText>
                  </MpFlex>
                </MpTableCell>
                <MpTableCell v-if="visibleCols.has('effectiveDate')" as="td" :class="cellPadTop"><MpText size="body" color="text.default">{{ dep.effectiveDate }}</MpText></MpTableCell>
                <MpTableCell v-if="visibleCols.has('enrolledDate')" as="td" :class="cellPadTop"><MpText size="body" color="text.default">{{ dep.enrolledDate }}</MpText></MpTableCell>
                <MpTableCell v-if="visibleCols.has('enrolledBy')" as="td" :class="cellPadTop"><MpText size="body" color="text.default">{{ dep.enrolledBy }}</MpText></MpTableCell>

                <template v-if="di === 0">
                  <MpTableCell as="td" :rowspan="deps.length" :class="[actionCellTop, actionBorder]">
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
                </template>
              </MpTableRow>
            </template>
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

  <!-- ── Export data modal ───────────────────────────────────────────────── -->
  <MpModal
    id="modal-export"
    :is-open="isExportModalOpen"
    size="md"
    is-close-on-esc
    is-close-on-overlay-click
    @close="closeExportModal"
  >
    <MpModalContent>
      <MpModalHeader>
        Export data
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <MpFlex direction="column" gap="4">
          <MpText size="body" color="text.default">A download link will be sent to your email.</MpText>

          <!-- Effective date: all dates or a specific one -->
          <MpFlex direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Effective date <span :class="css({ color: 'text.danger' })">*</span></MpText>
            <MpRadio id="export-date-all" v-model="exportDateMode" value="all" name="export-date">All dates</MpRadio>
            <MpRadio id="export-date-specific" v-model="exportDateMode" value="specific" name="export-date">Specific effective date</MpRadio>
            <MpFlex v-if="exportDateMode === 'specific'" :class="css({ width: '100%' })" paddingLeft="6">
              <MpDatePicker id="export-date" v-model="exportDate" format="D MMM YYYY" placeholder="Select date" use-portal />
            </MpFlex>
          </MpFlex>

          <!-- Columns to include — 20px below the effective-date radios (16px gap + 4px) -->
          <MpFlex direction="column" gap="2" marginTop="1">
            <MpText size="label" weight="semiBold" color="text.default">Export will include</MpText>
            <MpCheckbox
              v-for="col in EXPORT_LOCKED"
              :key="col.key"
              :id="`export-col-${col.key}`"
              :is-checked="true"
              is-disabled
            >{{ col.label }}</MpCheckbox>
            <MpCheckbox
              v-for="col in EXPORT_OPTIONAL"
              :key="col.key"
              :id="`export-col-${col.key}`"
              :is-checked="exportCols.includes(col.key)"
              @change="toggleExportCol(col.key)"
            >{{ col.label }}</MpCheckbox>
          </MpFlex>
        </MpFlex>
      </MpModalBody>
      <MpModalFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="closeExportModal">Cancel</MpButton>
          <MpButton variant="primary" size="md" :is-disabled="!exportValid" @click="confirmExport">Export</MpButton>
        </MpFlex>
      </MpModalFooter>
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

  <!-- ── Remove from plan — confirmation ─────────────────────────────────────── -->
  <MpModal id="modal-remove-employee" :is-open="isRemoveOpen" size="sm" is-centered is-close-on-esc is-close-on-overlay-click @close="cancelRemove">
    <MpModalContent>
      <MpModalHeader>
        Remove from plan?
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <MpText size="body" color="text.default">
          <MpText as="span" size="body" weight="semiBold" color="text.default">{{ removeTarget?.name }}</MpText>
          will be removed from the {{ plan.name }} plan. This action can't be undone.
        </MpText>
      </MpModalBody>
      <MpModalFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="cancelRemove">Cancel</MpButton>
          <MpButton variant="danger" size="md" @click="confirmRemove">Remove</MpButton>
        </MpFlex>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>

  <!-- ── Edit employee drawer — change plan + manage dependents ───────────────── -->
  <MpDrawer id="drawer-edit-employee" :is-open="isEditOpen" placement="right" size="md" is-close-on-esc is-close-on-overlay-click @close="closeEdit">
    <MpDrawerContent>
      <MpDrawerHeader>
        Edit employee
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody v-if="editTarget">
        <MpFlex direction="column" gap="5">
          <!-- Employee card -->
          <MpFlex align="center" gap="3">
            <MpAvatar :id="`edit-av-${editTarget.id}`" :name="editTarget.name" size="lg" :variant-color="avatarColor(editTarget.id)" />
            <MpFlex direction="column" gap="0">
              <MpText size="body" color="text.default">{{ editTarget.name }}</MpText>
              <MpText size="body-small" color="text.secondary">{{ editTarget.employeeId }} | {{ editTarget.jobPosition }} | {{ editTarget.organization }}</MpText>
            </MpFlex>
          </MpFlex>

          <!-- Insurance plan (change plan) -->
          <MpFlex direction="column" gap="1">
            <MpText size="label" weight="semiBold" color="text.default">Insurance plan</MpText>
            <MpPopover id="edit-plan-select" is-close-on-select>
              <MpPopoverTrigger>
                <MpFlex width="100%">
                  <MpSelect :model-value="editPlanId" placeholder="Select plan" size="md" is-full-width @mousedown.prevent>
                    <option v-if="editPlanId" :value="editPlanId">{{ planNameOf(editPlanId) }}</option>
                  </MpSelect>
                </MpFlex>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ minWidth: '280px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem v-for="p in enrollmentPlans" :key="p.id" :is-active="editPlanId === p.id" @click="editPlanId = p.id">{{ p.name }}</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </MpFlex>

          <!-- Dependents management -->
          <MpFlex direction="column" gap="3">
            <MpText size="label" weight="semiBold" color="text.default">Dependents</MpText>
            <template v-if="DEPENDENTS[editTarget.id]?.spouse || DEPENDENTS[editTarget.id]?.children?.length">
              <MpFlex v-if="DEPENDENTS[editTarget.id]?.spouse" direction="column" gap="2">
                <MpText size="body-small" weight="semiBold" color="text.secondary">Spouse</MpText>
                <MpCheckbox id="edit-spouse" :is-checked="editSpouse" @change="editSpouse = !editSpouse">{{ DEPENDENTS[editTarget.id]?.spouse }}</MpCheckbox>
              </MpFlex>
              <MpFlex v-if="DEPENDENTS[editTarget.id]?.children?.length" direction="column" gap="2">
                <MpText size="body-small" weight="semiBold" color="text.secondary">Children</MpText>
                <MpCheckbox v-for="c in DEPENDENTS[editTarget.id]?.children" :key="c" :id="`edit-child-${c}`" :value="c" v-model="editChildren">{{ c }}</MpCheckbox>
              </MpFlex>
            </template>
            <MpText v-else size="body" color="text.secondary">No dependents registered.</MpText>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="closeEdit">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="saveEdit">Save changes</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
    <MpDrawerOverlay />
  </MpDrawer>

  <!-- ── View details drawer — read-only plan + dependents ───────────────────── -->
  <MpDrawer id="drawer-view-employee" :is-open="isViewOpen" placement="right" size="md" is-close-on-esc is-close-on-overlay-click @close="closeView">
    <MpDrawerContent>
      <MpDrawerHeader>
        Enrollment details
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody v-if="viewTarget">
        <MpFlex direction="column" gap="5">
          <!-- Employee card -->
          <MpFlex align="center" gap="3">
            <MpAvatar :id="`view-av-${viewTarget.id}`" :name="viewTarget.name" size="lg" :variant-color="avatarColor(viewTarget.id)" />
            <MpFlex direction="column" gap="0">
              <MpText size="body" color="text.default">{{ viewTarget.name }}</MpText>
              <MpText size="body-small" color="text.secondary">{{ viewTarget.employeeId }} | {{ viewTarget.jobPosition }} | {{ viewTarget.organization }}</MpText>
            </MpFlex>
          </MpFlex>

          <!-- Enrolled plan -->
          <MpFlex direction="column" gap="1">
            <MpText size="label" weight="semiBold" color="text.secondary">Insurance plan</MpText>
            <MpText size="body" color="text.default">{{ planNameOf(employeePlanId(viewTarget.id)) }}</MpText>
          </MpFlex>

          <!-- Dependents -->
          <MpFlex direction="column" gap="3">
            <MpText size="label" weight="semiBold" color="text.default">Dependents</MpText>
            <template v-if="employeeDeps(viewTarget.id).spouse || employeeDeps(viewTarget.id).children.length">
              <MpFlex v-if="employeeDeps(viewTarget.id).spouse" direction="column" gap="1">
                <MpText size="body-small" color="text.secondary">Spouse</MpText>
                <MpText size="body" color="text.default">{{ employeeDeps(viewTarget.id).spouse }}</MpText>
              </MpFlex>
              <MpFlex v-if="employeeDeps(viewTarget.id).children.length" direction="column" gap="2">
                <MpText size="body-small" color="text.secondary">Children</MpText>
                <MpFlex direction="column" gap="1">
                  <MpText v-for="c in employeeDeps(viewTarget.id).children" :key="c" size="body" color="text.default">{{ c }}</MpText>
                </MpFlex>
              </MpFlex>
            </template>
            <MpText v-else size="body" color="text.secondary">No dependents enrolled.</MpText>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
    </MpDrawerContent>
    <MpDrawerOverlay />
  </MpDrawer>
</template>
