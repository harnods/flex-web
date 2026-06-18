<!--
  Mekari Flex — Insurance · Enrollment details
  Scenario 1 (draft): enrolled/insured show "—", Edit enrollment available.
  Scenario 2 (active): real counts + insured amounts, per-row "View details",
  an "Add employee" split/dropdown action, and Edit enrollment hidden.
  Source: Figma 9493:148306 (draft) / 9493:148311 (active). Pixel 3 DT 2.4 only.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpButton, MpTooltip,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  navKey: 'insurance',
  breadcrumb: [{ label: 'Enrollments', to: '/insurance/enrollments' }],
})

const DASH = '—'

interface PlanRow { id: string; name: string; enrolled: number | null; insured: string | null }
interface EnrollmentDetail {
  name: string
  status: 'draft' | 'active'
  coveragePeriod: string
  benefitTypes: string[]
  provider: string
  broker: string
  notEnrolled: number | null
  totalEnrolled: number | null
  plans: PlanRow[]
}

// Mock lookup (replace with API). e-2026 is the draft; the rest are active.
const ENROLLMENTS: Record<string, EnrollmentDetail> = {
  'e-2026': {
    name: 'FY2026 Rawat Inap', status: 'draft',
    coveragePeriod: '1 Jan - 31 Dec 2026', benefitTypes: ['Inpatient', 'Outpatient', 'Vision'],
    provider: 'PT Asuransi Allianz Life Indonesia', broker: 'PT Mekari Insurance Broker',
    notEnrolled: null, totalEnrolled: null,
    plans: [
      { id: 'ri2500', name: 'RI 2500', enrolled: null, insured: null },
      { id: 'ri2000', name: 'RI 2000', enrolled: null, insured: null },
      { id: 'ri1500', name: 'RI 1500', enrolled: null, insured: null },
      { id: 'ri1000', name: 'RI 1000', enrolled: null, insured: null },
      { id: 'ri500', name: 'RI 500', enrolled: null, insured: null },
    ],
  },
  'e-dental': {
    name: 'Dental Add-on 2026', status: 'active',
    coveragePeriod: '1 Jan - 31 Dec 2026', benefitTypes: ['Dental'],
    provider: 'PT Asuransi Allianz Life Indonesia', broker: 'PT Mekari Insurance Broker',
    notEnrolled: 5, totalEnrolled: 10,
    plans: [
      { id: 'dental-basic', name: 'Dental Basic', enrolled: 4, insured: 'Rp20.000.000' },
      { id: 'dental-plus', name: 'Dental Plus', enrolled: 6, insured: 'Rp36.000.000' },
    ],
  },
  'e-2025': {
    name: '2025 Health Enrollment', status: 'active',
    coveragePeriod: '1 Jan - 31 Dec 2025', benefitTypes: ['Inpatient', 'Outpatient'],
    provider: 'PT Asuransi Allianz Life Indonesia', broker: 'PT Mekari Insurance Broker',
    notEnrolled: 2, totalEnrolled: 15,
    plans: [
      { id: 'ri2500', name: 'RI 2500', enrolled: 2, insured: 'Rp9.000.000' },
      { id: 'ri2000', name: 'RI 2000', enrolled: 3, insured: 'Rp12.000.000' },
      { id: 'ri1500', name: 'RI 1500', enrolled: 5, insured: 'Rp22.500.000' },
      { id: 'ri1000', name: 'RI 1000', enrolled: 3, insured: 'Rp9.000.000' },
      { id: 'ri500', name: 'RI 500', enrolled: 2, insured: 'Rp3.000.000' },
    ],
  },
}

const route = useRoute()
const enrollment = computed<EnrollmentDetail>(() => ENROLLMENTS[route.params.id as string] ?? ENROLLMENTS['e-2026'])
const isDraft = computed(() => enrollment.value.status === 'draft')

// Drive the title bar reactively via the layout's path-stamped injector. The
// watchEffect re-runs whenever the active enrollment changes, so the title,
// Draft badge, and "Add employee" button stay correct on client-side navigation
// (no manual refresh needed). Active enrollments get the Add employee dropdown;
// drafts get neither the button nor real counts.
const setPageHeader = inject<(c: unknown) => void>('setPageHeader')
watchEffect(() => {
  setPageHeader?.({
    title: enrollment.value.name,
    badge: isDraft.value ? { label: 'Draft', type: 'announcement' } : null,
    headerRight: isDraft.value ? null : {
      label: 'Add employee', variant: 'primary', rightIcon: 'caret-down',
      items: [{ label: 'Add employee' }, { label: 'Upload from CSV' }],
      onSelect: (_label: string) => { /* TODO: open add-employee / CSV upload flow */ },
    },
  })
})

const search = ref('')
const filteredPlans = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? enrollment.value.plans.filter((p) => p.name.toLowerCase().includes(q)) : enrollment.value.plans
})

function downloadList() { /* TODO: export plan list */ }
function editEnrollment() { navigateTo(`/insurance/enrollments/create?edit=${route.params.id}`) }
function viewPlanDetails(planId: string) { navigateTo(`/insurance/enrollments/${route.params.id}/${planId}`) }

const overviewCard = css({
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
})
const overviewHeader = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4',
  padding: '3', background: 'gray.25',
})
const statFirst = css({ display: 'flex', flexDirection: 'column', gap: '1', padding: '4', width: '220px', flexShrink: 0 })
const statCol = css({ display: 'flex', flexDirection: 'column', gap: '1', padding: '4', flex: '1 1 180px', minWidth: '180px' })
const statValue = css({ whiteSpace: 'nowrap' })
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle' })
const actionCellHead = css({ width: '140px' })
const actionCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', textAlign: 'right' })
const exportBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  width: '40px', height: '40px', borderRadius: 'md', cursor: 'pointer',
  border: 'none', background: 'transparent', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered' },
})
</script>

<template>
  <MpFlex direction="column" gap="4">
    <!-- ── Enrollment overview ─────────────────────────────────────────────── -->
    <div :class="overviewCard">
      <div :class="overviewHeader">
        <MpText size="label" weight="semiBold" color="text.default">Enrollment overview</MpText>
        <MpFlex align="center" gap="4">
          <!-- Edit only available while the enrollment is a draft -->
          <MpTextlink v-if="isDraft" @click="editEnrollment">Edit enrollment</MpTextlink>
          <MpTextlink>View enrollment details</MpTextlink>
        </MpFlex>
      </div>

      <MpFlex align="flex-start" width="100%" wrap="wrap">
        <div :class="statFirst">
          <MpText size="label" color="text.secondary">Coverage period</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ enrollment.coveragePeriod }}</MpText>
          <MpText size="label" color="text.secondary">{{ enrollment.benefitTypes.join(', ') }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Insurance provider</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ enrollment.provider }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Insurance broker</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ enrollment.broker }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Not enrolled</MpText>
          <MpText :class="statValue" size="label" weight="semiBold" :color="enrollment.notEnrolled === null ? 'text.secondary' : 'text.default'">{{ enrollment.notEnrolled === null ? DASH : `${enrollment.notEnrolled} employees` }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Total enrolled</MpText>
          <MpText :class="statValue" size="label" weight="semiBold" :color="enrollment.totalEnrolled === null ? 'text.secondary' : 'text.default'">{{ enrollment.totalEnrolled === null ? DASH : `${enrollment.totalEnrolled} employees` }}</MpText>
        </div>
      </MpFlex>
    </div>

    <!-- ── Toolbar: export + search ────────────────────────────────────────── -->
    <MpFlex align="center" justify="flex-end" gap="2">
      <MpTooltip label="Export" position="top">
        <button type="button" :class="exportBtn" aria-label="Export" @click="downloadList">
          <PxIcon name="upload" :size="20" color="icon.secondary" />
        </button>
      </MpTooltip>
      <MpFlex width="280px">
        <MpInputGroup size="md" is-full-width>
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.secondary" />
          </MpInputLeftAddon>
          <MpInput v-model="search" placeholder="Search plan name..." is-clearable is-full-width />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <!-- ── Plans table ─────────────────────────────────────────────────────── -->
    <MpTableContainer>
      <MpTable :is-hoverable="false">
        <MpTableHead>
          <MpTableRow>
            <MpTableCell as="th" :class="css({ width: '64px' })">No.</MpTableCell>
            <MpTableCell as="th">Plan name</MpTableCell>
            <MpTableCell as="th">Enrolled</MpTableCell>
            <MpTableCell v-if="!isDraft" as="th" :class="actionCellHead" />
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="(plan, i) in filteredPlans" :key="plan.id">
            <MpTableCell as="td" :class="cellPad"><MpText size="body" color="text.default">{{ i + 1 }}.</MpText></MpTableCell>
            <MpTableCell as="td" :class="cellPad"><MpText size="body" color="text.default">{{ plan.name }}</MpText></MpTableCell>
            <MpTableCell as="td" :class="cellPad"><MpText size="body" :color="plan.enrolled === null ? 'text.secondary' : 'text.default'">{{ plan.enrolled === null ? DASH : `${plan.enrolled} employees` }}</MpText></MpTableCell>
            <MpTableCell v-if="!isDraft" as="td" :class="actionCell">
              <MpButton variant="secondary" size="md" @click="viewPlanDetails(plan.id)">View details</MpButton>
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>
  </MpFlex>
</template>
