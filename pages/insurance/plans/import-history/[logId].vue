<!--
  Mekari Flex — Insurance · Import details (one import run)
  Shows the import summary + status. For failed / partially-failed runs it lists
  the per-row error logs so the admin can fix the source file and re-import.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpTextlink, MpBadge,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  toast, css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Import details',
  navKey: 'insurance',
  breadcrumb: [
    { label: 'Insurance plans', to: '/insurance/plans' },
    { label: 'Import history', to: '/insurance/plans/import-history' },
  ],
})

const route = useRoute()
const { getLog } = useInsuranceImportLogs()
const log = computed(() => getLog(route.params.logId as string))

function downloadFile() {
  // TODO: wire to the real file-download endpoint.
  toast.notify({ position: 'top-center', variant: 'greeting', title: 'Download will start shortly.' })
}

const overviewCard = css({
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
})
const overviewHeader = css({ display: 'flex', alignItems: 'center', gap: '4', padding: '3', background: 'gray.25' })
const statRow = css({ display: 'flex', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap' })
const statCol = css({ display: 'flex', flexDirection: 'column', gap: '1', padding: '4', flex: '1 1 180px', minWidth: '160px' })
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })
const rowNumCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', width: '88px' })
const colNameCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', width: '200px' })
</script>

<template>
  <MpFlex v-if="log" direction="column" gap="6">
    <!-- ── Import overview ─────────────────────────────────────────────────── -->
    <div :class="overviewCard">
      <div :class="overviewHeader">
        <MpText size="label" weight="semiBold" color="text.default">Import overview</MpText>
      </div>
      <div :class="statRow">
        <div :class="statCol">
          <MpText size="label" color="text.secondary">File name</MpText>
          <MpFlex>
            <MpTextlink @click="downloadFile">{{ log.fileName }}</MpTextlink>
          </MpFlex>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Imported by</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ log.importedBy }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Imported on</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ log.importedAt }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Status</MpText>
          <MpFlex>
            <MpBadge for="additionalInformation" :type="IMPORT_STATUS_META[log.status].badge" size="md">
              {{ IMPORT_STATUS_META[log.status].label }}
            </MpBadge>
          </MpFlex>
        </div>
      </div>
      <div :class="statRow" :style="{ borderTop: '1px solid var(--mp-colors-border-default)' }">
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Total rows</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ log.totalRows }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Imported</MpText>
          <MpText size="label" weight="semiBold" color="text.success">{{ log.successRows }}</MpText>
        </div>
        <div :class="statCol">
          <MpText size="label" color="text.secondary">Failed</MpText>
          <MpText size="label" weight="semiBold" :color="log.failedRows ? 'text.danger' : 'text.default'">{{ log.failedRows }}</MpText>
        </div>
      </div>
    </div>

    <!-- ── Error logs (failed / partially-failed only) ─────────────────────── -->
    <template v-if="log.errors.length">
      <MpText size="label" weight="semiBold" color="text.default">Error logs ({{ log.errors.length }})</MpText>
      <MpTableContainer>
        <MpTable :is-hoverable="false">
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th" :class="rowNumCell">Row</MpTableCell>
              <MpTableCell as="th" :class="colNameCell">Column</MpTableCell>
              <MpTableCell as="th">Error message</MpTableCell>
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="(err, i) in log.errors" :key="i">
              <MpTableCell as="td" :class="rowNumCell"><MpText size="body" color="text.default">Row {{ err.row }}</MpText></MpTableCell>
              <MpTableCell as="td" :class="colNameCell"><MpText size="body" color="text.default">{{ err.column }}</MpText></MpTableCell>
              <MpTableCell as="td" :class="cellPad"><MpText size="body" color="text.danger">{{ err.message }}</MpText></MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>
    </template>

    <!-- ── Processing: import still running ────────────────────────────────── -->
    <InsuranceStateEmpty
      v-else-if="log.status === 'processing'"
      icon="loader-"
      title="Import in progress"
      description="This import is still being processed. Check back shortly for the result."
    />

    <!-- ── Success: no errors ──────────────────────────────────────────────── -->
    <InsuranceStateEmpty
      v-else
      icon="check"
      title="No errors"
      description="All rows were imported successfully."
    />
  </MpFlex>

  <!-- Unknown log id -->
  <InsuranceStateEmpty
    v-else
    icon="search"
    title="Import not found"
    description="This import log doesn't exist or has been removed."
  />
</template>
