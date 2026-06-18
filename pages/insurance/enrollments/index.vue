<!--
  Mekari Flex — Insurance · Enrollments list
  Columns: Enrollment name · Coverage period · Last updated by · Actions.
  Search filters by enrollment name. Two scenarios (FAB): has-data / empty.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpButton, MpBadge,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Enrollments',
  navKey: 'insurance',
  headerAction: { label: 'New enrollment', to: '/insurance/enrollments/create', variant: 'primary' },
})

const COPY = {
  searchPlaceholder: 'Search enrollment name...',
  emptyTitle: 'No enrollments yet',
  emptyDesc: 'Enrollments will appear here once you create one.',
  searchNotFoundTitle: 'No enrollments match your search',
  searchNotFoundDesc: 'Try a different enrollment name.',
}

interface Enrollment {
  id: string
  name: string
  status?: 'draft'
  coveragePeriod: string
  updatedAt: string
  updatedBy: string
}

const allEnrollments = ref<Enrollment[]>([
  { id: 'e-2026', name: 'FY2026 Rawat Inap', status: 'draft', coveragePeriod: '1 Jan - 31 Dec 2026', updatedAt: '12 Jun 2026', updatedBy: 'Andina Pramudita' },
  { id: 'e-dental', name: 'Dental Add-on 2026', coveragePeriod: '1 Jan - 31 Dec 2026', updatedAt: '10 Feb 2026', updatedBy: 'Rizal Chandra' },
  { id: 'e-2025', name: '2025 Health Enrollment', coveragePeriod: '1 Jan - 31 Dec 2025', updatedAt: '3 Jan 2025', updatedBy: 'Andina Pramudita' },
])

// ── Scenario (FAB) ────────────────────────────────────────────────────────────
const scenario = useState<'has-data' | 'empty'>('enrollments-scenario', () => 'has-data')
const source = computed(() => scenario.value === 'empty' ? [] : allEnrollments.value)

// ── Search + pagination ───────────────────────────────────────────────────────
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? source.value.filter((e) => e.name.toLowerCase().includes(q)) : source.value
})
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})
watch([search, perPage], () => { currentPage.value = 1 })

const isEmpty = computed(() => source.value.length === 0)
const isSearchEmpty = computed(() => !isEmpty.value && filtered.value.length === 0)

function onAction(action: 'view' | 'edit' | 'delete', row: Enrollment) {
  if (action === 'view') navigateTo(`/insurance/enrollments/${row.id}`)
  else if (action === 'edit') navigateTo(`/insurance/enrollments/create?edit=${row.id}`)
  // 'delete' → TODO: confirm + remove
}

// ── styles ─────────────────────────────────────────────────────────────────────
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })
const actionCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', textAlign: 'right', width: '120px' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <!-- Empty state: no enrollments at all -->
    <InsuranceStateEmpty
      v-if="isEmpty"
      image="/illustrations/enrollments-empty.png"
      :title="COPY.emptyTitle"
      :description="COPY.emptyDesc"
    />

    <template v-else>
      <!-- Filter bar: search always on the right -->
      <MpFlex align="center" gap="3">
        <MpFlex width="280px" marginLeft="auto">
          <MpInputGroup size="md" is-full-width>
            <MpInputLeftAddon>
              <PxIcon name="search" :size="16" color="icon.secondary" />
            </MpInputLeftAddon>
            <MpInput v-model="search" :placeholder="COPY.searchPlaceholder" is-clearable is-full-width />
          </MpInputGroup>
        </MpFlex>
      </MpFlex>

      <!-- Search not found -->
      <InsuranceStateEmpty
        v-if="isSearchEmpty"
        icon="search"
        :title="COPY.searchNotFoundTitle"
        :description="COPY.searchNotFoundDesc"
      />

      <!-- Table + pagination -->
      <Pixel.div v-else>
        <MpTableContainer>
          <MpTable :is-hoverable="false">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th">Enrollment name</MpTableCell>
                <MpTableCell as="th">Coverage period</MpTableCell>
                <MpTableCell as="th">Last updated by</MpTableCell>
                <MpTableCell as="th" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody>
              <MpTableRow v-for="row in paginated" :key="row.id">
                <MpTableCell as="td" :class="cellPad">
                  <MpFlex align="center" gap="2" wrap="wrap">
                    <MpTextlink @click="navigateTo(`/insurance/enrollments/${row.id}`)">{{ row.name }}</MpTextlink>
                    <MpBadge v-if="row.status === 'draft'" for="tableStatus" type="announcement" size="md">Draft</MpBadge>
                  </MpFlex>
                </MpTableCell>
                <MpTableCell as="td" :class="cellPad">
                  <MpText size="body" color="text.default">{{ row.coveragePeriod }}</MpText>
                </MpTableCell>
                <MpTableCell as="td" :class="cellPad">
                  <MpFlex direction="column" gap="0">
                    <MpText size="body" color="text.default">{{ row.updatedAt }}</MpText>
                    <MpText size="body-small" color="text.secondary">by {{ row.updatedBy }}</MpText>
                  </MpFlex>
                </MpTableCell>
                <MpTableCell as="td" :class="actionCell">
                  <MpPopover use-portal placement="bottom-end" is-close-on-select>
                    <MpPopoverTrigger>
                      <MpButton variant="secondary" size="md" right-icon="caret-down">Actions</MpButton>
                    </MpPopoverTrigger>
                    <MpPopoverContent :class="css({ minWidth: '160px' })">
                      <MpPopoverList>
                        <MpPopoverListItem @click="onAction('view', row)">View details</MpPopoverListItem>
                        <MpPopoverListItem @click="onAction('edit', row)">Edit</MpPopoverListItem>
                        <MpPopoverListItem @click="onAction('delete', row)">Delete</MpPopoverListItem>
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
      </Pixel.div>
    </template>
  </MpFlex>

  <!-- FAB: scenario switcher (dev only) -->
  <Pixel.div :class="css({ position: 'fixed', bottom: '6', right: '6', zIndex: 'popover' })">
    <MpPopover is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="tertiary" is-rounded left-icon="sliders" aria-label="Switch scenario" />
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ minWidth: '160px' })">
        <MpPopoverList>
          <MpPopoverListItem :is-active="scenario === 'has-data'" @click="scenario = 'has-data'">Has enrollments</MpPopoverListItem>
          <MpPopoverListItem :is-active="scenario === 'empty'" @click="scenario = 'empty'">Empty state</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Pixel.div>
</template>
