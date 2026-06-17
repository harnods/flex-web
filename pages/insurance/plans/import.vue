<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Flex — Insurance · Import insurance plan (Story 1)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9485:62821 (+ error screens 9490:*)
  Token mode: Pixel 2.4
  Patterns used: upload-flow
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Idle: empty dropzone + disabled Import
    - File selected: preview + enabled Import
    - Validation error: inline danger message (type, size, count)
    - Submitting: Import button loading
    - Success: toast "Import started…" → back to plan list

  COPY DEFAULTS (iterate freely):
    - Download button: "Download template file"
    - Success toast: "Import started. We'll email you when it's done."

  OPEN ITEMS:
    - Real template-file download endpoint (currently a no-op + toast)
    - Real upload endpoint; success is mocked client-side
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, MpTextlink, MpDropzone, toast, css } from '@mekari/pixel3'

definePageMeta({
  title: 'Import insurance plan',
  navKey: 'insurance',
  breadcrumb: [{ label: 'Insurance plans', to: '/insurance/plans' }],
})

const COPY = {
  step1Title: 'Download the template',
  step1Help: 'Fill in the template with your insurance plans.',
  downloadBtn: 'Download template file',
  step2Title: 'Upload your file',
  dropDescription: 'Supported formats: CSV, XLS, XLSX. Maximum file size 10 MB.',
  cancel: 'Cancel',
  submit: 'Import',
  successToast: "Import started. We'll email you when it's done.",
}

const ACCEPT = '.csv,.xls,.xlsx'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const VALID_EXT = ['csv', 'xls', 'xlsx']

const file = ref<File | null>(null)
const errorMsg = ref('')
const isSubmitting = ref(false)

// Pixel sets `pending` on the import; mock list reads this to show its empty state.
const importPending = useState('insurance-import-pending', () => false)

function validate(f: File): string {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (!VALID_EXT.includes(ext)) return 'File must be a CSV, XLS, or XLSX file.'
  if (f.size === 0) return 'File cannot be blank.'
  if (f.size > MAX_BYTES) return 'File cannot exceed 10 MB.'
  return ''
}

// MpDropzone @change emits its FileList (single-file flow → read the first).
function onChange(files: FileList | null) {
  const picked = files?.[0] ?? null
  if (!picked) return
  const err = validate(picked)
  if (err) {
    errorMsg.value = err
    file.value = null
    return
  }
  errorMsg.value = ''
  file.value = picked
}

function onClear() {
  file.value = null
  errorMsg.value = ''
}

function downloadTemplate() {
  // TODO: wire to real template endpoint.
  toast({ variant: 'greeting', title: 'Template download will start shortly.' })
}

function cancel() {
  navigateTo('/insurance/plans')
}

// numbered step badge — matches the css() pattern used across the repo
const stepNum = css({
  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', borderRadius: 'full',
  background: 'background.surface', color: 'text.secondary',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', lineHeight: 'none',
})

async function submit() {
  if (!file.value || errorMsg.value) return
  isSubmitting.value = true
  // TODO: replace with real upload call.
  await new Promise((r) => setTimeout(r, 600))
  isSubmitting.value = false
  importPending.value = true
  toast({ variant: 'success', title: COPY.successToast })
  navigateTo('/insurance/plans')
}
</script>

<template>
  <MpFlex direction="column" gap="6" maxWidth="640px">
    <!-- ═════ Step 1 — download template ═════ -->
    <MpFlex gap="3" align="flex-start">
      <span :class="stepNum">1</span>
      <MpFlex direction="column" gap="3" minWidth="0">
        <MpFlex direction="column" gap="1">
          <MpText size="label" weight="semiBold" color="text.default">{{ COPY.step1Title }}</MpText>
          <MpText size="body-small" color="text.secondary">{{ COPY.step1Help }}</MpText>
        </MpFlex>
        <MpFlex>
          <MpButton variant="secondary" size="md" @click="downloadTemplate">
            {{ COPY.downloadBtn }}
          </MpButton>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Step 2 — upload file ═════ -->
    <MpFlex gap="3" align="flex-start">
      <span :class="stepNum">2</span>
      <MpFlex direction="column" gap="2" flex="1" minWidth="0">
        <MpText size="label" weight="semiBold" color="text.default">{{ COPY.step2Title }}</MpText>
        <MpDropzone
          :accept="ACCEPT"
          :description="COPY.dropDescription"
          :is-invalid="!!errorMsg"
          @change="onChange"
          @clear="onClear"
        />
        <MpText v-if="errorMsg" size="body-small" color="text.danger">{{ errorMsg }}</MpText>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Footer actions ═════ -->
    <MpFlex align="center" justify="flex-end" gap="4" paddingTop="2">
      <MpTextlink @click="cancel">{{ COPY.cancel }}</MpTextlink>
      <MpButton
        variant="primary"
        size="md"
        :is-disabled="!file || !!errorMsg"
        :is-loading="isSubmitting"
        @click="submit"
      >
        {{ COPY.submit }}
      </MpButton>
    </MpFlex>
  </MpFlex>
</template>
