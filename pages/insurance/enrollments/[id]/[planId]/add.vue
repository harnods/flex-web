<!--
  Mekari Flex — Insurance · Enrollment · Plan detail · Add employees
  Reached from the plan detail "Add employee" header action.
  Flow: pick employees in the "Select employees" drawer → set each one's
  effective start date + optional dependents → Save enrolls them.
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9493:148375. Pixel 3 DT 2.4 only —
  no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpButton, MpAvatar,
  MpInput, MpInputGroup, MpInputLeftAddon, MpDatePicker, MpCheckbox, MpTooltip,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpDrawer, MpDrawerContent, MpDrawerHeader, MpDrawerBody, MpDrawerFooter, MpDrawerCloseButton, MpDrawerOverlay,
  MpModal, MpModalContent, MpModalHeader, MpModalBody, MpModalFooter, MpModalCloseButton, MpModalOverlay,
  toast, css,
} from '@mekari/pixel3'

definePageMeta({ navKey: 'insurance' })

// ── Lookups (mock; replace with API) ───────────────────────────────────────────
const ENROLLMENTS: Record<string, { name: string; coverageStart: string }> = {
  'e-2026': { name: 'FY2026 Rawat Inap', coverageStart: '2026-01-01' },
  'e-dental': { name: 'Dental Add-on 2026', coverageStart: '2026-01-01' },
  'e-2025': { name: '2025 Health Enrollment', coverageStart: '2025-01-01' },
}
const PLANS: Record<string, { name: string; premium: string }> = {
  'ri2500': { name: 'RI 2500', premium: 'Rp1.250.000' },
  'ri2000': { name: 'RI 2000', premium: 'Rp1.000.000' },
  'ri1500': { name: 'RI 1500', premium: 'Rp750.000' },
  'ri1000': { name: 'RI 1000', premium: 'Rp500.000' },
  'ri500': { name: 'RI 500', premium: 'Rp250.000' },
  'dental-basic': { name: 'Dental Basic', premium: 'Rp150.000' },
  'dental-plus': { name: 'Dental Plus', premium: 'Rp250.000' },
}

// Pool of employees eligible to be enrolled (mock; replace with API).
interface PoolEmployee {
  id: string
  name: string
  employeeId: string
  jobPosition: string
  organization: string
  spouse?: string
  children: string[]
}
const POOL: PoolEmployee[] = [
  { id: 'cp12349', name: 'Agung Setiawarman', employeeId: 'CP12349', jobPosition: 'Data Analyst', organization: 'Information & security', spouse: 'Yeni Gunawan', children: ['Gina Setiawarman', 'Jelita Setiawarman'] },
  { id: 'cp12341', name: 'Alfian Ramadhan', employeeId: 'CP12341', jobPosition: 'Data Analyst', organization: 'Information & security', spouse: 'Putri Ramadhan', children: ['Alfian Jr.'] },
  { id: 'cp08789', name: 'Ali Imran', employeeId: 'CP08789', jobPosition: 'Sales Director', organization: 'Sales', spouse: 'Fatimah Imran', children: ['Ali Ahmad', 'Rizky Imran'] },
  { id: 'cp060', name: 'Andi Pratama', employeeId: 'CP060', jobPosition: 'Head Chef', organization: 'Kitchen', children: [] },
  { id: 'cp050', name: 'Bayu Ferdian', employeeId: 'CP050', jobPosition: 'Head of Marketing', organization: 'Marketing', spouse: 'Rina Ferdian', children: ['Bayu Jr.', 'Citra Ferdian'] },
  { id: 'cp022', name: 'Christin Purnama Sari', employeeId: 'CP022', jobPosition: 'Accountant', organization: 'Accounting', children: ['Nadia Purnama'] },
  { id: 'cp070', name: 'Cinta Ayu', employeeId: 'CP070', jobPosition: 'Restaurant Manager', organization: 'Front of House', spouse: 'Doni Pratama', children: ['Ayu Pratama'] },
  { id: 'cp031', name: 'Daud Dimas Prasetyo', employeeId: 'CP031', jobPosition: 'Sales Representative', organization: 'Sales', children: [] },
  { id: 'cp055', name: 'Eka Setiawan', employeeId: 'CP055', jobPosition: 'Barista', organization: 'Kitchen', spouse: 'Lestari Setiawan', children: ['Eka Putra', 'Budi Setiawan'] },
  { id: 'cp020', name: 'Evelyn Bellinda', employeeId: 'CP020', jobPosition: 'Head of Accounting', organization: 'Accounting', children: [] },
  { id: 'cp071', name: 'Fajar Nugraha', employeeId: 'CP071', jobPosition: 'Waitstaff', organization: 'Front of house', children: ['Fajar Putra'] },
  { id: 'cp074', name: 'Galih Prakoso', employeeId: 'CP074', jobPosition: 'Waitstaff', organization: 'Front of house', children: [] },
  { id: 'cp091', name: 'Dennis Hartono', employeeId: 'CP091', jobPosition: 'Waitstaff', organization: 'Front of house', children: [] },
  { id: 'cp120', name: 'Juli Gunawan', employeeId: 'CP120', jobPosition: 'Waitstaff', organization: 'Front of house', spouse: 'Sari Gunawan', children: [] },
]
const POOL_BY_ID: Record<string, PoolEmployee> = Object.fromEntries(POOL.map((e) => [e.id, e]))

// Deterministic avatar color (keyed off the id) so it doesn't reshuffle on refresh.
const AVATAR_COLORS = ['sky', 'teal', 'violet', 'amber', 'rose', 'lime', 'pink', 'stone']
function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const route = useRoute()
const router = useRouter()
const enrollmentId = computed(() => route.params.id as string)
const planId = computed(() => route.params.planId as string)
const enrollment = computed(() => ENROLLMENTS[enrollmentId.value] ?? ENROLLMENTS['e-2026'])
const plan = computed(() => PLANS[planId.value] ?? { name: planId.value, premium: 'Rp0' })
const planDetailPath = computed(() => `/insurance/enrollments/${enrollmentId.value}/${planId.value}`)

// ── Title bar (path-stamped injector — race-free on client nav) ─────────────────
const setPageHeader = inject<(c: unknown) => void>('setPageHeader')
watchEffect(() => {
  setPageHeader?.({
    title: 'Add employee',
    breadcrumb: [
      { label: 'Enrollments', to: '/insurance/enrollments' },
      { label: enrollment.value.name, to: `/insurance/enrollments/${enrollmentId.value}` },
      { label: plan.value.name, to: planDetailPath.value },
    ],
    headerRight: null,
  })
})

// ── Added employees (committed) + per-row config ────────────────────────────────
interface RowConfig { effectiveDate: Date; spouse: boolean; children: string[] }
const addedIds = ref<string[]>([])
const rowConfig = reactive<Record<string, RowConfig>>({})

function defaultEffectiveDate(): Date {
  const [y, m, d] = enrollment.value.coverageStart.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

const search = ref('')
const addedRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return addedIds.value
    .map((id) => POOL_BY_ID[id])
    .filter((e): e is PoolEmployee => !!e)
    .filter((e) => !q || e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q))
})

function removeRow(id: string) {
  addedIds.value = addedIds.value.filter((x) => x !== id)
  delete rowConfig[id]
}
function dependentCount(id: string) {
  const c = rowConfig[id]
  if (!c) return 0
  return (c.spouse ? 1 : 0) + c.children.length
}

// ── Select employees drawer ─────────────────────────────────────────────────────
const drawerOpen = ref(false)
const drawerSelected = ref<string[]>([])
const availSearch = ref('')
const selSearch = ref('')

const availableEmployees = computed(() => {
  const q = availSearch.value.trim().toLowerCase()
  return POOL
    .filter((e) => !drawerSelected.value.includes(e.id))
    .filter((e) => !q || e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q))
})
const selectedEmployees = computed(() => {
  const q = selSearch.value.trim().toLowerCase()
  return drawerSelected.value
    .map((id) => POOL_BY_ID[id])
    .filter((e): e is PoolEmployee => !!e)
    .filter((e) => !q || e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q))
})

function openDrawer() {
  drawerSelected.value = [...addedIds.value]
  availSearch.value = ''
  selSearch.value = ''
  drawerOpen.value = true
}
function closeDrawer() { drawerOpen.value = false }
function drawerAdd(id: string) {
  if (!drawerSelected.value.includes(id)) drawerSelected.value = [...drawerSelected.value, id]
}
function drawerAddAll() {
  drawerSelected.value = [...new Set([...drawerSelected.value, ...availableEmployees.value.map((e) => e.id)])]
}
function drawerRemove(id: string) {
  drawerSelected.value = drawerSelected.value.filter((x) => x !== id)
}
function applyDrawer() {
  // Keep config for employees still selected; init config for newly added ones.
  for (const id of Object.keys(rowConfig)) {
    if (!drawerSelected.value.includes(id)) delete rowConfig[id]
  }
  for (const id of drawerSelected.value) {
    if (!rowConfig[id]) rowConfig[id] = { effectiveDate: defaultEffectiveDate(), spouse: false, children: [] }
  }
  addedIds.value = [...drawerSelected.value]
  drawerOpen.value = false
}

// ── Add dependents modal ─────────────────────────────────────────────────────────
const depModalOpen = ref(false)
const depModalId = ref<string | null>(null)
const depSpouse = ref(false)
const depChildren = ref<string[]>([])

const depEmployee = computed(() => (depModalId.value ? POOL_BY_ID[depModalId.value] : null))

function openDependents(id: string) {
  const c = rowConfig[id]
  depModalId.value = id
  depSpouse.value = c?.spouse ?? false
  depChildren.value = [...(c?.children ?? [])]
  depModalOpen.value = true
}
function closeDependents() { depModalOpen.value = false }
function saveDependents() {
  const id = depModalId.value
  if (id && rowConfig[id]) {
    rowConfig[id].spouse = depSpouse.value
    rowConfig[id].children = [...depChildren.value]
  }
  depModalOpen.value = false
}

// ── Footer actions ───────────────────────────────────────────────────────────────
function cancel() { router.push(planDetailPath.value) }
function save() {
  toast.notify({ position: 'top-center', variant: 'success', title: 'Employees enrolled' })
  router.push(planDetailPath.value)
}

// ── styles ─────────────────────────────────────────────────────────────────────────
// Dark "Select employees" CTA — distinct from the purple primary Save (matches Figma).
// Colors bind the Pixel token CSS variables inline (the postcss extractor doesn't
// emit the background.inverse / text.inverse utilities); layout stays in css().
const darkBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  height: '40px', paddingInline: '4', borderRadius: 'md', cursor: 'pointer',
  border: 'none', fontFamily: 'body', fontWeight: 'semiBold', whiteSpace: 'nowrap',
  transition: 'opacity 0.15s ease', _hover: { opacity: 0.92 },
})
const darkBtnStyle = { background: 'var(--mp-colors-background-inverse)', color: 'var(--mp-colors-text-inverse)' }
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle' })
const dateCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', width: '240px' })
const removeBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', padding: '0',
  color: 'icon.secondary', borderRadius: 'full', _hover: { color: 'icon.default' },
})
const addBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', padding: '0',
  color: 'icon.brand', borderRadius: 'full',
  opacity: '0', transition: 'opacity 0.15s ease', _hover: { opacity: '0.8' },
})
// Drawer two-column list rows. The "+" add button (.row-add) only appears on row
// hover / keyboard focus within the row.
const listScroll = css({ flex: '1 1 0', minHeight: '0', overflowY: 'auto' })
const personRow = css({
  display: 'flex', alignItems: 'center', gap: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  '& .row-add': { opacity: '0' },
  _hover: { '& .row-add': { opacity: '1' } },
  '&:focus-within .row-add': { opacity: '1' },
})
const colDivider = css({
  borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: 'border.default',
})
// Pinned to the bottom of the stage: marginTop auto pushes it down when content is
// short, sticky bottom keeps it in view while the table scrolls.
const footer = css({
  position: 'sticky', bottom: '0', zIndex: '1',
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2',
  marginInline: '-6', marginTop: 'auto', marginBottom: '-6',
  paddingInline: '6', paddingTop: '4', paddingBottom: '6',
  background: 'background.neutral',
})
const dateField = css({ width: '100%' })
</script>

<template>
  <MpFlex direction="column" gap="6" flex="1" minHeight="0">
    <!-- ── Toolbar: search (added table) + Select employees ─────────────────── -->
    <MpFlex align="center" justify="flex-end" gap="3">
      <MpFlex width="280px">
        <MpInputGroup size="md" is-full-width>
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.secondary" />
          </MpInputLeftAddon>
          <MpInput v-model="search" placeholder="Search employee name/ID..." is-clearable is-full-width />
        </MpInputGroup>
      </MpFlex>
      <button type="button" :class="darkBtn" :style="darkBtnStyle" @click="openDrawer">Select employees</button>
    </MpFlex>

    <!-- ── Added employees table ────────────────────────────────────────────── -->
    <MpTableContainer v-if="addedRows.length">
      <MpTable :is-hoverable="false">
        <MpTableHead>
          <MpTableRow>
            <MpTableCell as="th">Employee name</MpTableCell>
            <MpTableCell as="th">Effective start date</MpTableCell>
            <MpTableCell as="th">Dependents</MpTableCell>
            <MpTableCell as="th" :class="css({ width: '56px' })" />
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="row in addedRows" :key="row.id">
            <MpTableCell as="td" :class="cellPad">
              <MpFlex align="center" gap="3">
                <MpAvatar :id="`avatar-${row.id}`" :name="row.name" size="lg" :variant-color="avatarColor(row.id)" />
                <MpFlex direction="column" gap="0">
                  <MpText size="body" color="text.default">{{ row.name }}</MpText>
                  <MpText size="body-small" color="text.secondary">{{ row.employeeId }} | {{ row.jobPosition }} | {{ row.organization }}</MpText>
                </MpFlex>
              </MpFlex>
            </MpTableCell>
            <MpTableCell as="td" :class="dateCell">
              <div :class="dateField">
                <MpDatePicker :id="`eff-${row.id}`" v-model="rowConfig[row.id].effectiveDate" format="D MMM YYYY" use-portal />
              </div>
            </MpTableCell>
            <MpTableCell as="td" :class="cellPad">
              <MpFlex align="center" gap="1">
                <PxIcon name="add" :size="16" color="icon.brand" />
                <MpTextlink @click="openDependents(row.id)">
                  {{ dependentCount(row.id) ? `${dependentCount(row.id)} dependents` : 'Add dependents' }}
                </MpTextlink>
              </MpFlex>
            </MpTableCell>
            <MpTableCell as="td" :class="cellPad">
              <MpTooltip label="Remove" position="top">
                <button type="button" :class="removeBtn" :aria-label="`Remove ${row.name}`" @click="removeRow(row.id)">
                  <PxIcon name="minus-circular" :size="20" color="icon.secondary" />
                </button>
              </MpTooltip>
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <!-- Empty / first-run state — no table header, no border, illustration only -->
    <InsuranceStateEmpty
      v-else
      title="No employees yet"
      description="Employees will appear here."
      image="/illustrations/enrollments-empty.png"
    />

    <!-- ── Footer — sticky bottom, right-aligned ────────────────────────────── -->
    <div :class="footer">
      <MpButton variant="ghost" size="md" @click="cancel">Cancel</MpButton>
      <MpButton variant="primary" size="md" :is-disabled="!addedRows.length" @click="save">Save</MpButton>
    </div>
  </MpFlex>

  <!-- ── Select employees drawer ─────────────────────────────────────────────── -->
  <MpDrawer
    id="drawer-select-employees"
    :is-open="drawerOpen"
    placement="right"
    size="2xl"
    is-close-on-esc
    is-close-on-overlay-click
    @close="closeDrawer"
  >
    <MpDrawerContent>
      <MpDrawerHeader>
        Select employees
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="4" :class="css({ height: '100%' })">
          <MpText size="body" color="text.default">Select employees to enroll in this plan.</MpText>

          <MpFlex :class="css({ flex: '1 1 0', minHeight: '0' })">
            <!-- Left: available -->
            <MpFlex direction="column" gap="4" :class="[colDivider, css({ flex: '1 1 0', minWidth: '0', paddingRight: '6' })]">
              <MpFlex align="center" gap="2">
                <MpFlex flex="1">
                  <MpInputGroup size="md" is-full-width>
                    <MpInputLeftAddon>
                      <PxIcon name="search" :size="16" color="icon.secondary" />
                    </MpInputLeftAddon>
                    <MpInput v-model="availSearch" placeholder="Search employee" is-clearable is-full-width />
                  </MpInputGroup>
                </MpFlex>
                <MpButton variant="secondary" size="md" left-icon="filter">Filters</MpButton>
              </MpFlex>

              <MpFlex align="center" justify="space-between">
                <MpText size="label" weight="semiBold" color="text.default">Available employees</MpText>
                <MpTextlink @click="drawerAddAll">Add all</MpTextlink>
              </MpFlex>

              <MpFlex direction="column" :class="listScroll">
                <div v-for="e in availableEmployees" :key="e.id" :class="personRow">
                  <MpAvatar :id="`avail-${e.id}`" :name="e.name" size="lg" :variant-color="avatarColor(e.id)" />
                  <MpFlex direction="column" gap="0" flex="1" minWidth="0">
                    <MpText size="body" color="text.default">{{ e.name }}</MpText>
                    <MpText size="body-small" color="text.secondary">{{ e.employeeId }} | {{ e.jobPosition }} | {{ e.organization }}</MpText>
                  </MpFlex>
                  <MpTooltip label="Add" position="top">
                    <button type="button" :class="[addBtn, 'row-add']" :aria-label="`Add ${e.name}`" @click="drawerAdd(e.id)">
                      <PxIcon name="add" :size="24" color="icon.brand" />
                    </button>
                  </MpTooltip>
                </div>
                <MpFlex v-if="!availableEmployees.length" paddingBlock="8" justify="center">
                  <MpText size="body-small" color="text.secondary">No employees available.</MpText>
                </MpFlex>
              </MpFlex>
            </MpFlex>

            <!-- Right: selected -->
            <MpFlex direction="column" gap="4" :class="css({ flex: '1 1 0', minWidth: '0', paddingLeft: '6' })">
              <MpInputGroup size="md" is-full-width>
                <MpInputLeftAddon>
                  <PxIcon name="search" :size="16" color="icon.secondary" />
                </MpInputLeftAddon>
                <MpInput v-model="selSearch" placeholder="Search employee" is-clearable is-full-width />
              </MpInputGroup>

              <template v-if="drawerSelected.length">
                <MpText size="label" weight="semiBold" color="text.default">Selected employees ({{ drawerSelected.length }})</MpText>
                <MpFlex direction="column" :class="listScroll">
                  <div v-for="e in selectedEmployees" :key="e.id" :class="personRow">
                    <MpAvatar :id="`sel-${e.id}`" :name="e.name" size="lg" :variant-color="avatarColor(e.id)" />
                    <MpFlex direction="column" gap="0" flex="1" minWidth="0">
                      <MpText size="body" color="text.default">{{ e.name }}</MpText>
                      <MpText size="body-small" color="text.secondary">{{ e.employeeId }} | {{ e.jobPosition }} | {{ e.organization }}</MpText>
                    </MpFlex>
                    <MpTooltip label="Remove" position="top">
                      <button type="button" :class="removeBtn" :aria-label="`Remove ${e.name}`" @click="drawerRemove(e.id)">
                        <PxIcon name="minus-circular" :size="20" color="icon.secondary" />
                      </button>
                    </MpTooltip>
                  </div>
                </MpFlex>
              </template>

              <!-- Empty -->
              <MpFlex v-else direction="column" align="center" justify="center" gap="2" :class="css({ flex: '1 1 0', textAlign: 'center' })">
                <PxIcon name="employee" :size="32" color="icon.secondary" variant="duotone" />
                <MpText size="body" weight="semiBold" color="text.default">No employees added yet</MpText>
                <MpText size="body-small" color="text.secondary">Select employees from the left list to add them here</MpText>
              </MpFlex>
            </MpFlex>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="applyDrawer">Save</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
    <MpDrawerOverlay />
  </MpDrawer>

  <!-- ── Add dependents modal ────────────────────────────────────────────────── -->
  <MpModal id="modal-add-dependents" :is-open="depModalOpen" size="sm" is-close-on-esc is-close-on-overlay-click @close="closeDependents">
    <MpModalContent>
      <MpModalHeader>
        Add dependents
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody v-if="depEmployee">
        <MpFlex direction="column" gap="4">
          <!-- Employee card -->
          <MpFlex align="flex-start" gap="3">
            <MpAvatar :id="`dep-avatar-${depEmployee.id}`" :name="depEmployee.name" size="lg" :variant-color="avatarColor(depEmployee.id)" />
            <MpFlex direction="column" gap="1">
              <MpText size="body" color="text.default">{{ depEmployee.name }}</MpText>
              <MpText size="body-small" color="text.secondary">{{ depEmployee.employeeId }} | {{ depEmployee.jobPosition }} | {{ depEmployee.organization }}</MpText>
            </MpFlex>
          </MpFlex>

          <!-- Spouse -->
          <MpFlex v-if="depEmployee.spouse" direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Spouse</MpText>
            <MpCheckbox id="dep-spouse" :is-checked="depSpouse" @change="depSpouse = !depSpouse">{{ depEmployee.spouse }}</MpCheckbox>
          </MpFlex>

          <!-- Children -->
          <MpFlex v-if="depEmployee.children.length" direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Children ({{ depChildren.length }}/{{ depEmployee.children.length }})</MpText>
            <MpCheckbox
              v-for="child in depEmployee.children"
              :key="child"
              :id="`dep-child-${child}`"
              :value="child"
              v-model="depChildren"
            >{{ child }}</MpCheckbox>
          </MpFlex>

          <MpFlex v-if="!depEmployee.spouse && !depEmployee.children.length" paddingBlock="2">
            <MpText size="body" color="text.secondary">No dependents registered.</MpText>
          </MpFlex>
        </MpFlex>
      </MpModalBody>
      <MpModalFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="closeDependents">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="saveDependents">Save</MpButton>
        </MpFlex>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>
