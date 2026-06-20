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
import {
  Pixel, MpFlex, MpText, MpButton, MpTextlink, MpDropzone, MpTooltip, toast, css,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Import insurance plan',
  navKey: 'insurance',
})

// Breadcrumb parent reflects the entry point (shared with the sidebar): from
// first-run it's "Insurance" (no submenu); from the plans list it's
// "Insurance plans" (submenu shown). The sidebar submenu is driven by the same
// `hasPlans` state, so both stay in sync automatically.
const scenario = useState<'first-run' | 'coachmark' | 'has-plans'>('insurance-scenario', () => 'first-run')
const hasPlans = computed(() => scenario.value !== 'first-run')
const route = useRoute()
watchEffect(() => {
  route.meta.breadcrumb = [{
    label: hasPlans.value ? 'Insurance plans' : 'Insurance',
    to: '/insurance/plans',
  }]
})

const COPY = {
  step1Title: 'Download the template',
  step1Help: 'Fill in the template with your insurance plans.',
  downloadBtn: 'Download template file',
  step2Title: 'Upload your file',
  dropDescription: 'Supported formats: CSV, XLS, XLSX. Maximum file size 10 MB.',
  cancel: 'Cancel',
  submit: 'Import',
  successToast: 'Import started. Track the status in Import history.',
  // Error scenarios (Figma 9490:3313)
  errFormat: 'File format not supported. Upload a CSV, XLS, or XLSX file',
  errSize: 'File size exceeds the 10 MB limit',
  errEmpty: 'File is empty. Upload a file with data',
  errMultiple: 'Only one file can be uploaded at a time',
  errStructure: 'File structure is incorrect. Use the provided template and try again',
  errNoFile: 'Upload a file to import.',
}

const ACCEPT = '.csv,.xls,.xlsx'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const VALID_EXT = ['csv', 'xls', 'xlsx']

const router = useRouter()
const file = ref<File | null>(null)
const errorMsg = ref('')
const isSubmitting = ref(false)
const progress = ref(0)

const fileSizeLabel = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`
})

// Pixel sets `pending` on the import; mock list reads this to show its empty state.
const importPending = useState('insurance-import-pending', () => false)

function validate(f: File): string {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (!VALID_EXT.includes(ext)) return COPY.errFormat
  if (f.size === 0) return COPY.errEmpty
  if (f.size > MAX_BYTES) return COPY.errSize
  return ''
}

// MpDropzone @change emits a FileList (or File). Normalize, then run the
// client-side validations: multiple files, format, empty, size.
function onChange(payload: FileList | File[] | File | null) {
  const list: File[] = payload instanceof FileList || Array.isArray(payload)
    ? Array.from(payload as ArrayLike<File>)
    : payload ? [payload] : []
  if (list.length === 0) return
  if (list.length > 1) {
    errorMsg.value = COPY.errMultiple
    file.value = null
    return
  }
  const err = validate(list[0])
  if (err) {
    errorMsg.value = err
    file.value = null
    return
  }
  errorMsg.value = ''
  file.value = list[0]
}

function onClear() {
  file.value = null
  errorMsg.value = ''
}

// Dev-only: preview each import error state one at a time (via the FAB).
const ERROR_SCENARIOS = [
  { label: 'Format not supported', msg: COPY.errFormat },
  { label: 'Size exceeds 10 MB', msg: COPY.errSize },
  { label: 'Empty file', msg: COPY.errEmpty },
  { label: 'Multiple files', msg: COPY.errMultiple },
  { label: 'Structure incorrect', msg: COPY.errStructure },
]
function previewError(msg: string) {
  file.value = null
  isSubmitting.value = false
  errorMsg.value = msg
}

function downloadTemplate() {
  // TODO: wire to real template endpoint.
  toast.notify({ position: 'top-center', variant: 'greeting', title: 'Template download will start shortly.' })
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
  if (errorMsg.value) return
  if (!file.value) { errorMsg.value = COPY.errNoFile; return }
  const uploaded = file.value
  isSubmitting.value = true
  // Simulated upload progress (mock; replace with a real upload call).
  for (const p of [10, 35, 60, 85, 100]) {
    progress.value = p
    await new Promise((r) => setTimeout(r, 320))
  }
  // Server-side structure validation (mock). Demo trigger: a file whose name
  // contains "invalid" is rejected; swap for the real API response.
  if (/invalid/i.test(uploaded.name)) {
    isSubmitting.value = false
    progress.value = 0
    file.value = null
    errorMsg.value = COPY.errStructure
    return
  }
  importPending.value = true
  isSubmitting.value = false
  toast.notify({ position: 'top-center', variant: 'success', title: COPY.successToast })
  router.push('/insurance/plans')
}

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
const uploadBox = css({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3',
  width: '100%', minHeight: '360px',
  borderWidth: '1px', borderStyle: 'dashed', borderColor: 'border.default', borderRadius: 'md',
})
// Dropzone is a fixed 360px-tall area (content centered) — matches Figma
// 9708:21034, not faked with vertical padding.
const dropArea = css({ height: '360px!' })
// Pixel has no `spin` keyframe registered for css(), but the toast lib ships a
// global `sonner-spin` (360° rotate) keyframe — reuse it to animate the icon.
const spin = css({
  animationName: 'sonner-spin', animationDuration: '0.9s',
  animationTimingFunction: 'linear', animationIterationCount: 'infinite',
})
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

        <!-- Uploading -->
        <div v-if="isSubmitting" :class="uploadBox">
          <PxIcon name="loader-" :size="32" color="icon.brand" :class="spin" />
          <MpText size="body" color="text.default">Uploading {{ progress }}%...</MpText>
        </div>

        <!-- File selected -->
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

        <!-- Idle -->
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

    <!-- ═════ Footer actions ═════ -->
    <MpFlex align="center" justify="flex-end" gap="4" paddingTop="2">
      <MpTextlink @click="cancel">{{ COPY.cancel }}</MpTextlink>
      <MpButton
        variant="primary"
        size="md"
        :is-loading="isSubmitting"
        @click="submit"
      >
        {{ COPY.submit }}
      </MpButton>
    </MpFlex>
  </MpFlex>

  <!-- FAB: preview each import error state (dev only) -->
  <Pixel.div :class="css({ position: 'fixed', bottom: '6', right: '6', zIndex: 'popover' })">
    <MpPopover is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="tertiary" is-rounded left-icon="sliders" aria-label="Preview error" />
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ minWidth: '200px' })">
        <MpPopoverList>
          <MpPopoverListItem :is-active="!errorMsg" @click="onClear">No error</MpPopoverListItem>
          <MpPopoverListItem
            v-for="e in ERROR_SCENARIOS"
            :key="e.label"
            :is-active="errorMsg === e.msg"
            @click="previewError(e.msg)"
          >{{ e.label }}</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Pixel.div>
</template>
