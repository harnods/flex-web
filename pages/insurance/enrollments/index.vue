<!--
  Mekari Flex — Insurance · Enrollments list
  Columns: Enrollment name · Coverage period · Last updated by · Actions.
  Search filters by enrollment name. Two scenarios (FAB): has-data / empty.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpButton, MpBadge, MpSpinner,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpModal, MpModalContent, MpModalHeader, MpModalBody, MpModalFooter, MpModalCloseButton, MpModalOverlay,
  toast, css,
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

const { enrollments, removeEnrollment } = useEnrollments()
type Enrollment = ReturnType<typeof enrollments>[number]

// ── Scenario (FAB) ────────────────────────────────────────────────────────────
const scenario = useState<'has-data' | 'empty'>('enrollments-scenario', () => 'has-data')
const source = computed(() => scenario.value === 'empty' ? [] : enrollments())

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
  else if (action === 'delete') deleteTarget.value = row
}

// ── Delete enrollment ─────────────────────────────────────────────────────────
// Deleting an enrollment does NOT delete its insurance plans — the admin removes
// those manually from the Insurance plans page afterwards.
const deleteTarget = ref<Enrollment | null>(null)
const isDeleteOpen = computed(() => !!deleteTarget.value)

function cancelDelete() { deleteTarget.value = null }
function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  removeEnrollment(target.id)
  const name = target.name
  deleteTarget.value = null
  toast.notify({ position: 'top-center', variant: 'success', title: `Enrollment ${name} deleted.` })
}

// ── styles ─────────────────────────────────────────────────────────────────────
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })
const actionCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', textAlign: 'right', width: '120px' })
</script>

<template>
  <MpFlex direction="column" gap="6">
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
                    <MpBadge v-else-if="row.status === 'processing'" for="tableStatus" type="information" size="md">
                      <Pixel.span :class="css({ display: 'inline-flex', alignItems: 'center', gap: '1' })">
                        <MpSpinner size="sm" color="blue.500" />
                        Mapping employees…
                      </Pixel.span>
                    </MpBadge>
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
                        <MpPopoverListItem v-if="row.status === 'draft'" @click="onAction('edit', row)">Edit</MpPopoverListItem>
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

  <!-- Delete enrollment confirmation -->
  <MpModal
    id="modal-delete-enrollment"
    :is-open="isDeleteOpen"
    size="sm"
    is-centered
    is-close-on-esc
    is-close-on-overlay-click
    @close="cancelDelete"
  >
    <MpModalContent>
      <MpModalHeader>
        Delete enrollment?
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <MpText size="body" color="text.default">
          <MpText as="span" size="body" weight="semiBold" color="text.default">{{ deleteTarget?.name }}</MpText>
          will be permanently deleted. This action can't be undone.
        </MpText>
      </MpModalBody>
      <MpModalFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="cancelDelete">Cancel</MpButton>
          <MpButton variant="danger" size="md" @click="confirmDelete">Delete</MpButton>
        </MpFlex>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>

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
