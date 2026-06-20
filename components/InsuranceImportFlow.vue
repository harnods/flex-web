<!--
  Mekari Flex — Insurance · Reusable import flow (download template → upload → submit)
  Used for importing employees into a plan/enrollment. Mirrors the insurance-plan
  import; on submit the run is recorded in Import history. Pixel 3 DT 2.4 only.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpTextlink, MpDropzone, MpTooltip, toast, css,
} from '@mekari/pixel3'
import type { ImportLogType } from '~/composables/useInsuranceImportLogs'

const props = defineProps<{
  importType: ImportLogType
  backPath: string          // where Cancel returns to
  templateName: string      // file name suggested for the downloaded template
  step1Help?: string
}>()

const COPY = {
  step1Title: 'Download the template',
  downloadBtn: 'Download template file',
  step2Title: 'Upload your file',
  dropDescription: 'Supported formats: CSV, XLS, XLSX. Maximum file size 10 MB.',
  cancel: 'Cancel',
  submit: 'Import',
  successToast: 'Import started. Track the status in Import history.',
  errFormat: 'File format not supported. Upload a CSV, XLS, or XLSX file',
  errSize: 'File size exceeds the 10 MB limit',
  errEmpty: 'File is empty. Upload a file with data',
  errMultiple: 'Only one file can be uploaded at a time',
  errNoFile: 'Upload a file to import.',
}

const ACCEPT = '.csv,.xls,.xlsx'
const MAX_BYTES = 10 * 1024 * 1024
const VALID_EXT = ['csv', 'xls', 'xlsx']

const router = useRouter()
const { addLog } = useInsuranceImportLogs()

const file = ref<File | null>(null)
const errorMsg = ref('')
const isSubmitting = ref(false)
const progress = ref(0)

const fileSizeLabel = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`
})

function validate(f: File): string {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (!VALID_EXT.includes(ext)) return COPY.errFormat
  if (f.size === 0) return COPY.errEmpty
  if (f.size > MAX_BYTES) return COPY.errSize
  return ''
}

function onChange(payload: FileList | File[] | File | null) {
  const list: File[] = payload instanceof FileList || Array.isArray(payload)
    ? Array.from(payload as ArrayLike<File>)
    : payload ? [payload] : []
  if (list.length === 0) return
  if (list.length > 1) { errorMsg.value = COPY.errMultiple; file.value = null; return }
  const err = validate(list[0])
  if (err) { errorMsg.value = err; file.value = null; return }
  errorMsg.value = ''
  file.value = list[0]
}
function onClear() { file.value = null; errorMsg.value = '' }

function downloadTemplate() {
  // TODO: wire to the real template endpoint.
  toast.notify({ position: 'top-center', variant: 'greeting', title: 'Template download will start shortly.' })
}
function cancel() { navigateTo(props.backPath) }

async function submit() {
  if (errorMsg.value) return
  if (!file.value) { errorMsg.value = COPY.errNoFile; return }
  const uploaded = file.value
  isSubmitting.value = true
  for (const p of [10, 40, 70, 100]) {
    progress.value = p
    await new Promise((r) => setTimeout(r, 280))
  }
  // Record the import (lands in Import history as Processing), then hand off.
  addLog({ type: props.importType, fileName: uploaded.name })
  isSubmitting.value = false
  toast.notify({ position: 'top-center', variant: 'success', title: COPY.successToast })
  router.push('/insurance/plans/import-history')
}

const stepNum = css({
  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', borderRadius: 'full',
  background: 'background.surface', color: 'text.secondary',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', lineHeight: 'none',
})
const fileRow = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3',
  width: '100%', paddingBlock: '1',
})
const removeBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', padding: '1',
  borderRadius: 'md', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered' },
})
const dropArea = css({ height: '360px!' })
const uploadBox = css({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3',
  height: '360px',
  borderWidth: '1px', borderStyle: 'dashed', borderColor: 'border.default', borderRadius: 'md',
})
const spin = css({
  animationName: 'sonner-spin', animationDuration: '0.9s',
  animationTimingFunction: 'linear', animationIterationCount: 'infinite',
})
</script>

<template>
  <MpFlex direction="column" gap="6" maxWidth="640px">
    <!-- Step 1 — download template -->
    <MpFlex gap="3" align="flex-start">
      <span :class="stepNum">1</span>
      <MpFlex direction="column" gap="3" minWidth="0">
        <MpFlex direction="column" gap="1">
          <MpText size="label" weight="semiBold" color="text.default">{{ COPY.step1Title }}</MpText>
          <MpText v-if="step1Help" size="body-small" color="text.secondary">{{ step1Help }}</MpText>
        </MpFlex>
        <MpFlex>
          <MpButton variant="secondary" size="md" @click="downloadTemplate">{{ COPY.downloadBtn }}</MpButton>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- Step 2 — upload file -->
    <MpFlex gap="3" align="flex-start">
      <span :class="stepNum">2</span>
      <MpFlex direction="column" gap="2" flex="1" minWidth="0">
        <MpText size="label" weight="semiBold" color="text.default">{{ COPY.step2Title }}</MpText>

        <div v-if="isSubmitting" :class="uploadBox">
          <PxIcon name="loader-" :size="32" color="icon.brand" :class="spin" />
          <MpText size="body" color="text.default">Uploading {{ progress }}%...</MpText>
        </div>

        <div v-else-if="file" :class="fileRow">
          <MpFlex align="center" gap="2" minWidth="0">
            <PxIcon name="excel-document" :size="24" color="icon.success" />
            <MpFlex direction="column" minWidth="0">
              <MpText size="body-small" color="text.default">{{ file.name }}</MpText>
              <MpText size="label-small" color="text.secondary">{{ fileSizeLabel }}</MpText>
            </MpFlex>
          </MpFlex>
          <MpTooltip label="Remove" position="top">
            <button type="button" :class="removeBtn" aria-label="Remove file" @click="onClear">
              <PxIcon name="minus-circular" :size="20" color="icon.secondary" />
            </button>
          </MpTooltip>
        </div>

        <MpDropzone
          v-else
          :class="dropArea"
          :accept="ACCEPT"
          :description="COPY.dropDescription"
          :is-invalid="!!errorMsg"
          @change="onChange"
          @clear="onClear"
        />

        <MpText v-if="errorMsg" size="body-small" color="text.danger">{{ errorMsg }}</MpText>
      </MpFlex>
    </MpFlex>

    <!-- Footer -->
    <MpFlex align="center" justify="flex-end" gap="4" paddingTop="2">
      <MpTextlink @click="cancel">{{ COPY.cancel }}</MpTextlink>
      <MpButton variant="primary" size="md" :is-loading="isSubmitting" @click="submit">{{ COPY.submit }}</MpButton>
    </MpFlex>
  </MpFlex>
</template>
