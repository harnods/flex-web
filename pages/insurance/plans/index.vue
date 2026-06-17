<!--
  Mekari Flex — Insurance · Insurance plans list (Story 2)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9491:21862 · Pixel 3 DT 2.4
  Patterns: index-view, filter, empty-state. Pixel components only, no raw CSS.

  States: first-run (no plans) · empty (import queued) · loading · list ·
          search-not-found · filter-not-found.
  To preview a state locally: empty `allGroups` → first-run; set `importPending`
  → empty; set `isLoading` → loading. Data is mocked; wire to the plans endpoint.

  Note: "Benefit type"/"Status" are single-select (Figma shows option popovers);
  swap MpSelect for a multi-select in iteration. "View details" → plan drawer
  (Figma 9491:22678) is a Block 1 follow-up.
-->
<script setup lang="ts">
import { MpFlex, MpText, MpSelect, MpInput, MpInputGroup, MpInputLeftAddon, MpSkeleton } from '@mekari/pixel3'
import type { InsurancePlanGroup } from '~/components/InsurancePlanTable.vue'

definePageMeta({
  title: 'Insurance plans',
  navKey: 'insurance',
  headerAction: { label: 'Import insurance plan', to: '/insurance/plans/import', variant: 'secondary' },
})

const COPY = {
  benefitPlaceholder: 'Benefit type',
  statusPlaceholder: 'Status',
  searchPlaceholder: 'Search plan name...',
  emptyTitle: 'No insurance plans yet',
  emptyDesc: 'Insurance plans will appear here.',
  emptyAction: 'Import insurance plan',
  searchNotFoundTitle: 'No plans match your search',
  searchNotFoundDesc: 'Try a different plan name.',
  filterNotFoundTitle: 'No plans match your filters',
  filterNotFoundDesc: 'Adjust or clear your filters to see more plans.',
}

const BENEFIT_OPTIONS = ['Inpatient', 'Outpatient', 'Vision', 'Dental']
const STATUS_OPTIONS = ['Active', 'Inactive', 'Expired']

// ── Mock data (replace with API) ────────────────────────────────────────────
const isLoading = ref(false)
const allGroups = ref<InsurancePlanGroup[]>([
  {
    id: 'g-2026', coveragePeriod: '1 Jan - 31 Dec 2026',
    benefitTypes: ['Inpatient', 'Outpatient', 'Vision'],
    provider: 'CAR Life Insurance', broker: 'Premiro', status: 'Active',
    plans: [
      { id: 'p-ri2500', name: 'RI 2500' },
      { id: 'p-ri2000', name: 'RI 2000' },
      { id: 'p-ri1500', name: 'RI 1500' },
      { id: 'p-ri1000', name: 'RI 1000' },
      { id: 'p-ri800', name: 'RI 800' },
    ],
  },
  {
    id: 'g-2025', coveragePeriod: '1 Jan - 31 Dec 2025',
    benefitTypes: ['Inpatient', 'Outpatient'],
    provider: 'Astra Life', broker: 'Premiro', status: 'Inactive',
    plans: [
      { id: 'p25-ri2000', name: 'RI 2000' },
      { id: 'p25-ri1500', name: 'RI 1500' },
      { id: 'p25-ri1000', name: 'RI 1000' },
    ],
  },
  {
    id: 'g-2024', coveragePeriod: '1 Jan - 31 Dec 2024',
    benefitTypes: ['Inpatient'],
    provider: 'Astra Life', broker: '', status: 'Expired',
    plans: [
      { id: 'p24-ri1000', name: 'RI 1000' },
      { id: 'p24-ri800', name: 'RI 800' },
    ],
  },
])

// ── Filters / search ─────────────────────────────────────────────────────────
const benefitFilter = ref('')
const statusFilter = ref('')
const search = ref('')

const hasFilter = computed(() => !!benefitFilter.value || !!statusFilter.value)
const hasSearch = computed(() => search.value.trim().length > 0)

const filteredGroups = computed<InsurancePlanGroup[]>(() => {
  const q = search.value.trim().toLowerCase()
  return allGroups.value
    .filter((g) => !benefitFilter.value || g.benefitTypes.includes(benefitFilter.value))
    .filter((g) => !statusFilter.value || g.status === statusFilter.value)
    .map((g) => (q ? { ...g, plans: g.plans.filter((p) => p.name.toLowerCase().includes(q)) } : g))
    .filter((g) => g.plans.length > 0)
})

// ── View state ───────────────────────────────────────────────────────────────
const importPending = useState('insurance-import-pending', () => false)

const viewState = computed(() => {
  if (isLoading.value) return 'loading'
  if (importPending.value) return 'empty'
  if (allGroups.value.length === 0) return 'first-run'
  return 'list'
})

const listEmptyKind = computed<'search' | 'filter' | null>(() => {
  if (viewState.value !== 'list' || filteredGroups.value.length > 0) return null
  if (hasSearch.value) return 'search'
  if (hasFilter.value) return 'filter'
  return null
})

function viewDetails(_planId: string) {
  // TODO: open plan detail drawer (Block 1 follow-up).
}
</script>

<template>
  <!-- First run -->
  <InsuranceFirstRun v-if="viewState === 'first-run'" />

  <!-- Empty (import queued) -->
  <InsuranceStateEmpty
    v-else-if="viewState === 'empty'"
    :title="COPY.emptyTitle"
    :description="COPY.emptyDesc"
    :action-label="COPY.emptyAction"
    @action="navigateTo('/insurance/plans/import')"
  />

  <!-- Loading -->
  <MpFlex v-else-if="viewState === 'loading'" direction="column" gap="2">
    <MpSkeleton v-for="n in 4" :key="n" width="100%" height="56px" borderRadius="md" />
  </MpFlex>

  <!-- List -->
  <MpFlex v-else direction="column" gap="4">
    <MpFlex align="center" gap="3" wrap="wrap">
      <MpFlex width="180px">
        <MpSelect v-model="benefitFilter" :placeholder="COPY.benefitPlaceholder" is-clearable size="md" is-full-width>
          <option v-for="b in BENEFIT_OPTIONS" :key="b" :value="b">{{ b }}</option>
        </MpSelect>
      </MpFlex>
      <MpFlex width="180px">
        <MpSelect v-model="statusFilter" :placeholder="COPY.statusPlaceholder" is-clearable size="md" is-full-width>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </MpSelect>
      </MpFlex>
      <MpFlex width="280px" marginLeft="auto">
        <MpInputGroup size="md">
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.secondary" />
          </MpInputLeftAddon>
          <MpInput v-model="search" :placeholder="COPY.searchPlaceholder" is-clearable is-full-width />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <InsuranceStateEmpty
      v-if="listEmptyKind === 'search'"
      icon="search"
      :title="COPY.searchNotFoundTitle"
      :description="COPY.searchNotFoundDesc"
    />
    <InsuranceStateEmpty
      v-else-if="listEmptyKind === 'filter'"
      icon="filter"
      :title="COPY.filterNotFoundTitle"
      :description="COPY.filterNotFoundDesc"
    />

    <InsurancePlanTable v-else :groups="filteredGroups" @view-details="viewDetails" />
  </MpFlex>
</template>
