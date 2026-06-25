<!--
  Mekari Flex — Insurance · Import details (one import run)
  Shows the import summary + status. For failed runs it lists the per-row error
  logs grouped by row. Success shows only the import overview.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink, MpBadge,
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

const errorsByRow = computed(() => {
  const map = new Map<number, string[]>()
  for (const err of log.value?.errors ?? []) {
    if (!map.has(err.row)) map.set(err.row, [])
    map.get(err.row)!.push(err.message)
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0])
})

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

    <!-- ── Error logs (failed only) ──────────────────────────────────────── -->
    <template v-if="log.errors.length">
      <MpText size="label" weight="semiBold" color="text.default">Error logs ({{ log.errors.length }})</MpText>
      <MpTableContainer>
        <MpTable :is-hoverable="false">
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th" :class="rowNumCell">Row</MpTableCell>
              <MpTableCell as="th">Error message</MpTableCell>
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="[rowNum, messages] in errorsByRow" :key="rowNum">
              <MpTableCell as="td" :class="rowNumCell"><MpText size="body" color="text.default">Row {{ rowNum }}</MpText></MpTableCell>
              <MpTableCell as="td" :class="cellPad">
                <MpFlex direction="column" gap="1">
                  <MpText v-for="(msg, i) in messages" :key="i" size="body" color="text.danger">{{ msg }}</MpText>
                </MpFlex>
              </MpTableCell>
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
  </MpFlex>

  <!-- Unknown log id -->
  <InsuranceStateEmpty
    v-else
    icon="search"
    title="Import not found"
    description="This import log doesn't exist or has been removed."
  />
</template>
