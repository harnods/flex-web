<!--
  Mekari Flex — Insurance · Import history (list of insurance-plan import runs)
  Reached from the Insurance submenu. Shows each import's status; failed /
  partially-failed runs link to a detail page with the error logs.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpBadge,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Import history',
  navKey: 'insurance',
  breadcrumb: [{ label: 'Insurance plans', to: '/insurance/plans' }],
})

const { logs } = useInsuranceImportLogs()

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? logs().filter((l) => l.fileName.toLowerCase().includes(q)) : logs()
})
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})
watch([search, perPage], () => { currentPage.value = 1 })

function viewDetails(id: string) { navigateTo(`/insurance/plans/import-history/${id}`) }

const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle' })
const actionCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle', textAlign: 'right', width: '120px' })
</script>

<template>
  <MpFlex direction="column" gap="6">
    <!-- Search -->
    <MpFlex align="center" gap="3">
      <MpFlex width="280px" marginLeft="auto">
        <MpInputGroup size="md" is-full-width>
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.secondary" />
          </MpInputLeftAddon>
          <MpInput v-model="search" placeholder="Search file name..." is-clearable is-full-width />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <!-- Search not found -->
    <InsuranceStateEmpty
      v-if="filtered.length === 0"
      icon="search"
      title="No imports found"
      description="Try a different file name."
    />

    <Pixel.div v-else>
      <MpTableContainer>
        <MpTable :is-hoverable="false">
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th">File name</MpTableCell>
              <MpTableCell as="th">Imported by</MpTableCell>
              <MpTableCell as="th">Imported on</MpTableCell>
              <MpTableCell as="th">Status</MpTableCell>
              <MpTableCell as="th" :class="actionCell" />
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="row in paginated" :key="row.id">
              <MpTableCell as="td" :class="cellPad">
                <MpFlex align="center" gap="2" minWidth="0">
                  <PxIcon name="excel-document" :size="20" color="icon.secondary" />
                  <MpText size="body" color="text.default">{{ row.fileName }}</MpText>
                </MpFlex>
              </MpTableCell>
              <MpTableCell as="td" :class="cellPad">
                <MpText size="body" color="text.default">{{ row.importedBy }}</MpText>
              </MpTableCell>
              <MpTableCell as="td" :class="cellPad">
                <MpText size="body" color="text.default">{{ row.importedAt }}</MpText>
              </MpTableCell>
              <MpTableCell as="td" :class="cellPad">
                <MpBadge for="tableStatus" :type="IMPORT_STATUS_META[row.status].badge" size="md">
                  {{ IMPORT_STATUS_META[row.status].label }}
                </MpBadge>
              </MpTableCell>
              <MpTableCell as="td" :class="actionCell">
                <MpButton v-if="row.status !== 'processing'" variant="secondary" size="md" @click="viewDetails(row.id)">View details</MpButton>
                <MpText v-else size="body" color="text.secondary">—</MpText>
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
  </MpFlex>
</template>
