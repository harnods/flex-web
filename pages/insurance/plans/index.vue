<!--
  Mekari Flex — Insurance · Insurance plans list (Story 2)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9491:21862 · Pixel 3 DT 2.4
  Patterns: index-view, filter, empty-state. Pixel components only, no raw CSS.

  States: first-run (no plans) · empty (import queued) · loading · list ·
          search-not-found · filter-not-found.
  To preview a state locally: empty `allGroups` → first-run; set `importPending`
  → empty; set `isLoading` → loading. Data is mocked; wire to the plans endpoint.

  Note: "Benefit type" is a multi-select popover (checkbox list). The grouped
  table shows a "Last updated" column (date + admin) per coverage period.
-->
<script setup lang="ts">
import {
  Pixel,
  MpFlex, MpInput, MpInputGroup, MpInputLeftAddon, MpButton,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpSelect, MpCheckbox, css,
} from '@mekari/pixel3'
import type { InsurancePlanGroup } from '~/components/InsurancePlanTable.vue'

// Default = first-run (no plans): bare "Insurance" title, no header button.
// Overridden at runtime below once plans exist.
definePageMeta({
  title: 'Insurance',
  navKey: 'insurance',
})

const COPY = {
  benefitPlaceholder: 'Benefit type',
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

const benefitMenu = css({ width: '220px', maxWidth: '220px' })

// Coachmark shown after the import finishes (anchored near the Insurance submenu).
const coachCard = css({
  position: 'fixed', top: '96px', left: '288px', width: '320px', zIndex: 'popover',
  background: 'background.neutral', borderRadius: 'lg', boxShadow: 'lg', overflow: 'hidden',
})
const coachBanner = css({ width: '100%', height: '240px', objectFit: 'cover', display: 'block' })
const coachClose = css({
  position: 'absolute', top: '2', right: '2',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '28px', height: '28px', borderRadius: 'full', border: 'none', cursor: 'pointer',
  background: 'background.neutral', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered' },
})

// ── Mock data (replace with API) ────────────────────────────────────────────
const isLoading = ref(false)
const allGroups = ref<InsurancePlanGroup[]>([
  {
    id: 'g-2026', coveragePeriod: '1 Jan - 31 Dec 2026',
    benefitTypes: ['Inpatient', 'Outpatient', 'Vision'],
    provider: 'CAR Life Insurance', broker: 'Premiro', status: 'Active',
    updatedAt: '12 Jun 2026', updatedBy: 'Andina Pramudita',
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
    updatedAt: '3 Jan 2025', updatedBy: 'Rizal Chandra',
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
    updatedAt: '28 Dec 2023', updatedBy: 'Andina Pramudita',
    plans: [
      { id: 'p24-ri1000', name: 'RI 1000' },
      { id: 'p24-ri800', name: 'RI 800' },
    ],
  },
])

// ── Scenario state (shared with AppSidebar) ───────────────────────────────────
// Three demo scenarios, switched via the FAB:
//  • first-run — no plans yet; first-run page + import→async empty-state flow
//  • coachmark — first import done: 1-row table + onboarding coachmark + pulse
//  • has-plans — established tenant: full 3-row table, no coachmark
const scenario = useState<'first-run' | 'coachmark' | 'has-plans'>('insurance-scenario', () => 'first-run')
const coachmarkOpen = useState('insurance-coachmark-open', () => false)
const importPending = useState('insurance-import-pending', () => false)
const hasPlans = computed(() => scenario.value !== 'first-run')
// The coachmark scenario is a brand-new tenant's very first import → one period.
const sourceGroups = computed(() => scenario.value === 'coachmark' ? allGroups.value.slice(0, 1) : allGroups.value)

function setScenario(next: 'first-run' | 'coachmark' | 'has-plans') {
  scenario.value = next
  coachmarkOpen.value = next === 'coachmark'
  importPending.value = false
}

// ── Filters / search ─────────────────────────────────────────────────────────
const benefitFilters = ref<string[]>([])
const search = ref('')

const hasFilter = computed(() => benefitFilters.value.length > 0)
const hasSearch = computed(() => search.value.trim().length > 0)

const benefitLabel = computed(() =>
  benefitFilters.value.length ? `${COPY.benefitPlaceholder} (${benefitFilters.value.length})` : COPY.benefitPlaceholder
)

const filteredGroups = computed<InsurancePlanGroup[]>(() => {
  const q = search.value.trim().toLowerCase()
  return sourceGroups.value
    .filter((g) => !benefitFilters.value.length || benefitFilters.value.some((b) => g.benefitTypes.includes(b)))
    .map((g) => (q ? { ...g, plans: g.plans.filter((p) => p.name.toLowerCase().includes(q)) } : g))
    .filter((g) => g.plans.length > 0)
})

// ── Pagination (per coverage-period group) ────────────────────────────────────
const currentPage = ref(1)
const perPage = ref(10)

const paginatedGroups = computed<InsurancePlanGroup[]>(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredGroups.value.slice(start, start + perPage.value)
})

watch([search, () => benefitFilters.value.length, perPage], () => { currentPage.value = 1 })

// ── View state ───────────────────────────────────────────────────────────────
// Title bar reacts to the scenario: first-run shows a bare "Insurance" title
// with no import button; once plans exist it becomes the full list header.
const route = useRoute()
watchEffect(() => {
  if (hasPlans.value) {
    route.meta.title = 'Insurance plans'
    route.meta.headerAction = { label: 'Import insurance plan', to: '/insurance/plans/import', variant: 'secondary' }
  } else {
    route.meta.title = 'Insurance'
    route.meta.headerAction = undefined
  }
})

const viewState = computed(() => {
  if (isLoading.value) return 'loading'
  if (importPending.value) return 'empty'   // import processing — plans not ready yet (async)
  if (!hasPlans.value) return 'first-run'
  return 'list'
})

const listEmptyKind = computed<'search' | 'filter' | null>(() => {
  if (viewState.value !== 'list' || filteredGroups.value.length > 0) return null
  if (hasSearch.value) return 'search'
  if (hasFilter.value) return 'filter'
  return null
})
</script>

<template>
  <!-- First run -->
  <InsuranceFirstRun v-if="viewState === 'first-run'" />

  <!-- Empty (import queued) -->
  <InsuranceStateEmpty
    v-else-if="viewState === 'empty'"
    image="/illustrations/insurance-empty.png"
    :title="COPY.emptyTitle"
    :description="COPY.emptyDesc"
    :action-label="COPY.emptyAction"
    @action="navigateTo('/insurance/plans/import')"
  />

  <!-- List -->
  <MpFlex v-else direction="column" gap="4">
    <MpFlex align="center" gap="3" wrap="wrap">
      <MpPopover id="benefit-filter" :is-close-on-select="false">
        <MpPopoverTrigger>
          <MpFlex width="180px">
            <MpSelect :model-value="'benefit'" size="md" is-full-width @mousedown.prevent>
              <option value="benefit">{{ benefitLabel }}</option>
            </MpSelect>
          </MpFlex>
        </MpPopoverTrigger>
        <MpPopoverContent :class="benefitMenu">
          <MpFlex direction="column" gap="3" padding="3">
            <MpCheckbox
              v-for="b in BENEFIT_OPTIONS"
              :key="b"
              :id="`benefit-${b}`"
              :value="b"
              v-model="benefitFilters"
            >
              {{ b }}
            </MpCheckbox>
          </MpFlex>
        </MpPopoverContent>
      </MpPopover>
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

    <Pixel.div v-else>
      <InsurancePlanTable :groups="paginatedGroups" />
      <TablePagination
        v-model:current-page="currentPage"
        v-model:per-page="perPage"
        :total="filteredGroups.length"
      />
    </Pixel.div>
  </MpFlex>

  <!-- Coachmark: shown only on the first import (scenario = coachmark) -->
  <Pixel.div v-if="coachmarkOpen" :class="coachCard">
    <Pixel.img :class="coachBanner" src="/illustrations/coachmark-plans-ready.png" alt="" />
    <button type="button" :class="coachClose" aria-label="Dismiss" @click="coachmarkOpen = false">
      <PxIcon name="close" :size="16" color="icon.secondary" />
    </button>
    <MpFlex direction="column" gap="2" padding="4">
      <MpText size="label" weight="semiBold" color="text.default">Your plans are ready — now set up enrollment</MpText>
      <MpText size="body-small" color="text.secondary">
        Assign insurance plans to your employees and open the enrollment window so they can view their coverage.
      </MpText>
      <MpFlex marginTop="2">
        <MpButton variant="primary" size="md" @click="coachmarkOpen = false; navigateTo('/insurance/enrollments')">
          Start setting up enrollment
        </MpButton>
      </MpFlex>
    </MpFlex>
  </Pixel.div>

  <!-- FAB: scenario switcher (dev only) -->
  <Pixel.div :class="css({ position: 'fixed', bottom: '6', right: '6', zIndex: 'popover' })">
    <MpPopover is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="tertiary" is-rounded left-icon="sliders" aria-label="Switch scenario" />
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ minWidth: '160px' })">
        <MpPopoverList>
          <MpPopoverListItem :is-active="scenario === 'first-run'" @click="setScenario('first-run')">First run (no plans)</MpPopoverListItem>
          <MpPopoverListItem :is-active="scenario === 'coachmark'" @click="setScenario('coachmark')">Coachmark</MpPopoverListItem>
          <MpPopoverListItem :is-active="scenario === 'has-plans'" @click="setScenario('has-plans')">Has plans</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Pixel.div>
</template>
