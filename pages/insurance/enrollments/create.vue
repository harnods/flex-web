<!--
  Mekari Flex — Insurance · Create enrollment (3-step wizard)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9493:148240
  Steps: Set details → Assign plans → Review enrollment → Save → back to list.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS (animation primitives live in
  assets/css/main.css).
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpInput, MpSelect, MpCheckbox, MpTooltip, MpInputTag,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpModal, MpModalOverlay, MpModalContent, MpModalHeader, MpModalBody, MpModalFooter, MpModalCloseButton,
  toast, css,
} from '@mekari/pixel3'

definePageMeta({
  navKey: 'insurance',
  breadcrumb: [{ label: 'Enrollments', to: '/insurance/enrollments' }],
})

const router = useRouter()
const route = useRoute()

// Edit mode = ?edit=<id>. Same form as create, but the primary action becomes a
// split button (Continue ▾ → Save changes), and the data is pre-filled.
const editId = computed(() => (route.query.edit as string) || '')
const isEdit = computed(() => !!editId.value)
route.meta.title = isEdit.value ? 'Edit enrollment' : 'Create enrollment'

// ── Wizard state ──────────────────────────────────────────────────────────────
const STEPS = ['Set details', 'Assign plans', 'Review enrollment']
const step = ref(1)

// ── Step 1 — Enrollment info ───────────────────────────────────────────────────
const NAME_MAX = 60
const name = ref('')

const COVERAGE_OPTIONS = ['1 Jan 2026 - 31 Dec 2026', '1 Jan 2025 - 31 Dec 2025', '1 Jul 2024 - 31 Dec 2024']
const coverage = ref('')

const EMPLOYMENT = ['Permanent', 'Contract', 'Probation']
const employment = ref<string[]>([])
const employmentAllChecked = computed(() => employment.value.length === EMPLOYMENT.length)
function toggleEmploymentAll(checked: boolean) {
  employment.value = checked ? [...EMPLOYMENT] : []
}
function removeEmployment(e: string) {
  employment.value = employment.value.filter((x) => x !== e)
}

const step1Valid = computed(() => name.value.trim() && coverage.value && employment.value.length > 0)

// ── Step 2 — Assign plans ───────────────────────────────────────────────────────
// Only "Job level" is supported for now, so the criteria is fixed and the field
// is disabled (no dropdown).
const criteria = ref('Job level')

const PLANS = [
  { id: 'ri2500', name: 'RI 2500' },
  { id: 'ri2000', name: 'RI 2000' },
  { id: 'ri1800', name: 'RI 1800' },
  { id: 'ri1300', name: 'RI 1300' },
  { id: 'ri1000', name: 'RI 1000' },
]
const CRITERIA_VALUES: Record<string, string[]> = {
  'Job level': Array.from({ length: 11 }, (_, i) => `Job level ${11 - i}`),
  'Job grade': ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'],
  'Class': ['Class 1', 'Class 2', 'Class 3'],
}
const valueOptions = computed(() => CRITERIA_VALUES[criteria.value] ?? ['Group 1', 'Group 2', 'Group 3'])
const defaultFor = ref<Record<string, string[]>>(Object.fromEntries(PLANS.map((p) => [p.id, []])))

// MpInputTag emits DataInterface[] (each has .text / .value) — store as strings.
function onDefaultForChange(id: string, data: Array<{ text?: string; value?: string }>) {
  defaultFor.value[id] = data.map((d) => d.text ?? d.value ?? '')
}
// A criteria value can only be the default for one plan — hide values already
// assigned to OTHER plans from this row's suggestions.
function takenElsewhere(id: string) {
  return Object.entries(defaultFor.value).filter(([k]) => k !== id).flatMap(([, v]) => v)
}
function availableFor(id: string) {
  const taken = new Set(takenElsewhere(id))
  return valueOptions.value.filter((v) => !taken.has(v))
}
// MpInputTag snapshots `suggestions` on mount, so we remount a row whenever the
// values taken by OTHER plans change (its `:key` below). `:data` restores the
// row's own tags after the remount; editing a row doesn't change its own key,
// so it keeps focus.
function dataFor(id: string) {
  return (defaultFor.value[id] ?? []).map((v) => ({ text: v, id: `tag-${id}-${v}`, value: v }))
}
function rowKey(id: string) {
  return `${id}|${criteria.value}|${takenElsewhere(id).slice().sort().join(',')}`
}
// Changing the criteria swaps the suggestion set, so reset the per-plan tags.
watch(criteria, () => {
  defaultFor.value = Object.fromEntries(PLANS.map((p) => [p.id, []]))
})

const step2Valid = computed(() => !!criteria.value)

// Criteria values not assigned to any plan's "Default for".
const unassigned = computed(() => {
  const assigned = new Set(Object.values(defaultFor.value).flat())
  return valueOptions.value.filter((v) => !assigned.has(v))
})
// Plural noun for the alert copy ("job levels", "job grades", "classes").
const criteriaNoun = computed(() => {
  const n = (criteria.value || 'criteria').toLowerCase()
  return n.endsWith('s') ? `${n}es` : `${n}s`
})
const alertOpen = ref(false)
function continueAnyway() { alertOpen.value = false; step.value = 3 }

// ── Footer actions ───────────────────────────────────────────────────────────
const { addEnrollment } = useEnrollments()
// Cancel opens a "Leave this page?" coachmark (popover anchored to the button).
function leavePage() { router.push('/insurance/enrollments') }
function saveDraft() {
  addEnrollment({
    name: name.value.trim() || 'Untitled enrollment',
    coveragePeriod: coverage.value,
    asDraft: true,
  })
  toast.notify({ position: 'top-center', variant: 'greeting', title: 'Enrollment saved as draft.' })
  router.push('/insurance/enrollments')
}
// Validation surfaces on Continue (we never disable the button — so the error
// messages are always reachable). Required-field errors show once `triggered`.
const triggered = ref(false)
const errName = computed(() => triggered.value && !name.value.trim())
const errCoverage = computed(() => triggered.value && !coverage.value)
const errEmployment = computed(() => triggered.value && employment.value.length === 0)

function back() { triggered.value = false; step.value = Math.max(1, step.value - 1) }
function next() {
  triggered.value = true
  if (step.value === 1) {
    if (!step1Valid.value) return
  } else if (step.value === 2) {
    if (!step2Valid.value) return
    // Unassigned criteria values → warn before continuing.
    if (unassigned.value.length > 0) { alertOpen.value = true; return }
  }
  triggered.value = false
  if (step.value < 3) step.value += 1
}
function save() {
  addEnrollment({ name: name.value.trim(), coveragePeriod: coverage.value })
  toast.notify({ position: 'top-center', variant: 'success', title: 'Enrollment created. Mapping employees…' })
  router.push('/insurance/enrollments')
}
// Edit mode: save directly (from the split-button dropdown or the last step).
function saveChanges() {
  toast.notify({ position: 'top-center', variant: 'success', title: 'Changes saved.' })
  router.push(`/insurance/enrollments/${editId.value}`)
}

// Pre-fill the form when editing an existing enrollment (mock). Done after mount
// so the select triggers (dynamic single-option) reflect the value like a pick.
onMounted(() => {
  if (!isEdit.value) return
  name.value = 'FY2026 Rawat Inap'
  coverage.value = '1 Jan 2026 - 31 Dec 2026'
  employment.value = ['Permanent', 'Contract', 'Probation']
  criteria.value = 'Job level'
  // criteria change resets defaultFor (watcher); restore after that flush.
  nextTick(() => {
    defaultFor.value = {
      ri2500: ['Job level 11', 'Job level 10'],
      ri2000: ['Job level 9', 'Job level 8'],
      ri1800: ['Job level 7', 'Job level 6'],
      ri1300: ['Job level 5', 'Job level 4'],
      ri1000: ['Job level 3', 'Job level 2'],
    }
  })
})

// ── styles ─────────────────────────────────────────────────────────────────────
const fieldName = css({ width: '480px', maxWidth: '100%' })
const fieldSelect = css({ width: '264px' })
const menu = css({ width: '264px', maxWidth: '264px', maxHeight: '280px', overflowY: 'auto' })
const required = css({ color: 'text.danger' })
// Table cells that host an input → 8px vertical padding so the row stays compact.
const inputCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'middle' })
// "Leave this page?" coachmark card (anchored to Cancel).
const leaveCard = css({ width: '360px', maxWidth: '360px' })
// Split button (edit mode): Continue + attached caret → Save changes.
const splitMain = css({ borderTopRightRadius: '0!', borderBottomRightRadius: '0!' })
const splitCaret = css({
  borderTopLeftRadius: '0!', borderBottomLeftRadius: '0!',
  paddingInline: '2!', borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'rgba(255,255,255,0.3)',
})
// Amber warning box inside the unassigned-values alert modal.
const warnBox = css({
  display: 'flex', gap: '2', alignItems: 'flex-start',
  background: 'background.warning', borderRadius: 'md', padding: '3',
})

// selected employment chips listed under the select
const selectedList = css({ display: 'flex', flexDirection: 'column', width: '264px', marginTop: '2' })
const selectedRow = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', paddingBlock: '2' })
const removeBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', padding: '0',
  color: 'icon.secondary', borderRadius: 'full', _hover: { color: 'icon.default' },
})

// sticky action bar pinned to the bottom of the stage (full-bleed, no top border)
const footer = css({
  position: 'sticky', bottom: '0', zIndex: '1',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginInline: '-6', marginTop: '6', marginBottom: '-6',
  paddingInline: '6', paddingBlock: '4',
  background: 'background.neutral',
})

// stepper — each step is an equal-width column (flex-1); the circle sits at the
// left of its column and the connector line fills the rest, so the last circle
// lands at ~2/3 across (not stretched edge-to-edge). Matches Figma 9493:170951.
const activeIndex = computed(() => step.value - 1)
const stepperWrap = css({ display: 'flex', alignItems: 'flex-start', width: '100%', paddingBottom: '6' })
const stepStatus = css({ flex: '1 1 0', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1' })
const stepBlock = css({ display: 'flex', alignItems: 'center', gap: '2', width: '100%' })
const stepLabelRow = css({ display: 'flex', paddingLeft: '4', paddingRight: '2' })

const circleBase = {
  width: '28px', height: '28px', borderRadius: 'full', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  fontFamily: 'body', fontWeight: 'semiBold', lineHeight: 'none',
} as const
const circleDone = css({ ...circleBase, background: 'background.brand.bold', color: 'text.inverted' })
const circleActive = css({ ...circleBase, background: 'transparent', borderWidth: '2px', borderStyle: 'solid', borderColor: 'text.link', color: 'text.link' })
const circleUpcoming = css({ ...circleBase, background: 'transparent', borderWidth: '2px', borderStyle: 'solid', borderColor: 'border.default', color: 'text.secondary' })

const leadBlue = css({ width: '8px', height: '2px', borderRadius: 'full', background: 'background.brand.bold', flexShrink: 0 })
const leadGray = css({ width: '8px', height: '2px', borderRadius: 'full', background: 'border.default', flexShrink: 0 })
const trailBlue = css({ flex: '1 1 0', height: '2px', borderRadius: 'full', background: 'background.brand.bold' })
const trailGray = css({ flex: '1 1 0', height: '2px', borderRadius: 'full', background: 'border.default' })

function circleClass(i: number) {
  if (i < activeIndex.value) return circleDone
  if (i === activeIndex.value) return circleActive
  return circleUpcoming
}
function stepLabelColor(i: number) {
  if (i === activeIndex.value) return 'text.link'
  if (i < activeIndex.value) return 'text.default'
  return 'text.secondary'
}
const lineActive = (i: number) => i <= activeIndex.value

// review cell
const reviewLabel = css({ width: '180px', flexShrink: 0 })
</script>

<template>
  <MpFlex direction="column" gap="6" flex="1" minHeight="0">
    <!-- Stepper -->
    <div :class="stepperWrap">
      <div v-for="(label, i) in STEPS" :key="label" :class="stepStatus">
        <div :class="stepBlock" :style="i === 0 ? { paddingLeft: '16px' } : {}">
          <div v-if="i > 0" :class="lineActive(i) ? leadBlue : leadGray" />
          <div :class="circleClass(i)">
            <PxIcon v-if="i < activeIndex" name="check" :size="16" color="white" />
            <MpText v-else size="body" weight="semiBold" :color="i === activeIndex ? 'text.link' : 'text.secondary'">{{ i + 1 }}</MpText>
          </div>
          <div v-if="i < STEPS.length - 1" :class="lineActive(i) ? trailBlue : trailGray" />
        </div>
        <div :class="stepLabelRow">
          <MpText size="body" :weight="i === activeIndex ? 'semiBold' : 'regular'" :color="stepLabelColor(i)">{{ label }}</MpText>
        </div>
      </div>
    </div>

    <!-- ═════ Step 1 — Set details ═════ -->
    <MpFlex v-if="step === 1" direction="column" gap="5" flex="1">
      <MpFlex direction="column" gap="2">
        <MpFlex align="center" justify="space-between" :class="fieldName">
          <MpText size="label" weight="semiBold" color="text.default">Enrollment name <span :class="required">*</span></MpText>
          <MpText size="label-small" color="text.secondary">{{ name.length }} / {{ NAME_MAX }}</MpText>
        </MpFlex>
        <MpFlex :class="fieldName" direction="column" gap="1">
          <MpInput v-model="name" :maxlength="NAME_MAX" placeholder="" is-full-width :is-invalid="errName" />
          <MpText v-if="errName" size="body-small" color="text.danger">Enrollment name is required.</MpText>
        </MpFlex>
      </MpFlex>

      <MpFlex direction="column" gap="1">
        <MpText size="label" weight="semiBold" color="text.default">Coverage period <span :class="required">*</span></MpText>
        <MpText size="body-small" color="text.secondary">The period your employees are covered under this insurance plan.</MpText>
        <MpPopover id="coverage-select" is-close-on-select>
          <MpPopoverTrigger>
            <MpFlex :class="fieldSelect" marginTop="1">
              <MpSelect :model-value="coverage" placeholder="Select coverage period" size="md" is-full-width :is-invalid="errCoverage" @mousedown.prevent>
                <option v-if="coverage" :value="coverage">{{ coverage }}</option>
              </MpSelect>
            </MpFlex>
          </MpPopoverTrigger>
          <MpPopoverContent :class="menu">
            <MpPopoverList>
              <MpPopoverListItem v-for="c in COVERAGE_OPTIONS" :key="c" :is-active="coverage === c" @click="coverage = c">{{ c }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpText v-if="errCoverage" size="body-small" color="text.danger">Coverage period is required.</MpText>
      </MpFlex>

      <MpFlex direction="column" gap="1">
        <MpText size="label" weight="semiBold" color="text.default">Eligible employment status <span :class="required">*</span></MpText>
        <MpPopover id="employment-filter" :is-close-on-select="false">
          <MpPopoverTrigger>
            <MpFlex :class="fieldSelect" marginTop="1">
              <MpSelect :model-value="''" placeholder="Select employment status" size="md" is-full-width :is-invalid="errEmployment" @mousedown.prevent>
                <option value=""></option>
              </MpSelect>
            </MpFlex>
          </MpPopoverTrigger>
          <MpPopoverContent :class="menu">
            <MpFlex direction="column" gap="3" padding="3">
              <MpCheckbox id="emp-all" :is-checked="employmentAllChecked" @change="toggleEmploymentAll">Select all</MpCheckbox>
              <MpCheckbox v-for="e in EMPLOYMENT" :key="e" :id="`emp-${e}`" :value="e" v-model="employment">{{ e }}</MpCheckbox>
            </MpFlex>
          </MpPopoverContent>
        </MpPopover>
        <!-- Selected statuses listed below, each removable -->
        <div v-if="employment.length" :class="selectedList">
          <div v-for="e in employment" :key="e" :class="selectedRow">
            <MpText size="body" color="text.default">{{ e }}</MpText>
            <MpTooltip label="Remove" position="top">
              <button type="button" :class="removeBtn" :aria-label="`Remove ${e}`" @click="removeEmployment(e)">
                <PxIcon name="minus-circular" :size="20" color="icon.secondary" />
              </button>
            </MpTooltip>
          </div>
        </div>
        <MpText v-if="errEmployment" size="body-small" color="text.danger">Select at least one employment status.</MpText>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Step 2 — Assign plans ═════ -->
    <MpFlex v-else-if="step === 2" direction="column" gap="4" flex="1">
      <MpFlex direction="column" gap="1">
        <MpText size="h3" weight="semiBold" color="text.default">Plan configuration</MpText>
        <MpText size="body-small" color="text.secondary">Add plans to this enrollment and set the criteria to auto-assign default plans.</MpText>
        <MpText size="body-small" color="text.secondary">Employees who don't match any criteria won't be auto-assigned a plan. You can manually assign them later in the enrollment.</MpText>
      </MpFlex>

      <MpFlex direction="column" gap="1">
        <MpText size="label" weight="semiBold" color="text.default">Default plan criteria <span :class="required">*</span></MpText>
        <MpFlex :class="fieldSelect" marginTop="1">
          <MpSelect :model-value="criteria" size="md" is-full-width is-disabled>
            <option :value="criteria">{{ criteria }}</option>
          </MpSelect>
        </MpFlex>
      </MpFlex>

      <MpTableContainer>
        <MpTable :is-hoverable="false" :class="css({ width: '100%', tableLayout: 'fixed' })">
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th" :class="css({ width: '56px' })">No.</MpTableCell>
              <MpTableCell as="th" :class="css({ width: '240px' })">Plan name</MpTableCell>
              <MpTableCell as="th">Default for</MpTableCell>
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="(plan, i) in PLANS" :key="plan.id">
              <MpTableCell as="td" :class="inputCell"><MpText size="body" color="text.default">{{ i + 1 }}</MpText></MpTableCell>
              <MpTableCell as="td" :class="inputCell"><MpTextlink>{{ plan.name }}</MpTextlink></MpTableCell>
              <MpTableCell as="td" :class="inputCell">
                <Pixel.div :class="css({ width: '100%' })">
                  <MpInputTag
                    :id="`default-for-${plan.id}`"
                    :key="rowKey(plan.id)"
                    :data="dataFor(plan.id)"
                    placeholder="Search..."
                    :suggestions="availableFor(plan.id)"
                    :is-show-suggestions="true"
                    :is-enable-create-new-tag="false"
                    :is-show-icon-chevron-down="true"
                    :is-adaptive-width="false"
                    :is-disabled="!criteria"
                    :max-row="-1"
                    use-portal
                    width-content="240px"
                    @change="(data) => onDefaultForChange(plan.id, data)"
                  />
                </Pixel.div>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>
    </MpFlex>

    <!-- ═════ Step 3 — Review enrollment ═════ -->
    <MpFlex v-else direction="column" gap="6" flex="1">
      <MpFlex direction="column" gap="3">
        <MpText size="h3" weight="semiBold" color="text.default">Enrollment information</MpText>
        <MpFlex>
          <MpText size="body" color="text.secondary" :class="reviewLabel">Enrollment name</MpText>
          <MpText size="body" color="text.default">{{ name || '—' }}</MpText>
        </MpFlex>
        <MpFlex>
          <MpText size="body" color="text.secondary" :class="reviewLabel">Coverage period</MpText>
          <MpText size="body" color="text.default">{{ coverage || '—' }}</MpText>
        </MpFlex>
        <MpFlex>
          <MpText size="body" color="text.secondary" :class="reviewLabel">Eligible employment status</MpText>
          <Pixel.ul :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
            <Pixel.li v-for="e in employment" :key="e"><MpText size="body" color="text.default">{{ e }}</MpText></Pixel.li>
          </Pixel.ul>
        </MpFlex>
      </MpFlex>

      <MpFlex direction="column" gap="3">
        <MpText size="h3" weight="semiBold" color="text.default">Insurance plans</MpText>
        <MpFlex v-for="(plan, i) in PLANS" :key="plan.id" align="flex-start">
          <MpText size="body" color="text.default" :class="reviewLabel">{{ i + 1 }}. {{ plan.name }}</MpText>
          <Pixel.ul v-if="defaultFor[plan.id]?.length" :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
            <Pixel.li v-for="v in defaultFor[plan.id]" :key="v"><MpText size="body" color="text.default">{{ v }}</MpText></Pixel.li>
          </Pixel.ul>
          <MpText v-else size="body" color="text.secondary">No default</MpText>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Footer — sticky bottom, no top border ═════ -->
    <div :class="footer">
      <MpButton variant="ghost" size="md" @click="saveDraft">Save as draft</MpButton>
      <MpFlex align="center" gap="2">
        <MpButton v-if="step > 1" variant="ghost" size="md" @click="back">Back</MpButton>
        <MpPopover id="leave-confirm" placement="top" use-portal>
          <MpPopoverTrigger>
            <MpButton variant="ghost" size="md">Cancel</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="leaveCard">
            <MpFlex direction="column" gap="2" padding="4">
              <MpText size="label" weight="semiBold" color="text.default">Leave this page?</MpText>
              <MpText size="body-small" color="text.secondary">
                Data you have filled will not be saved. Do you want to save as draft instead?
              </MpText>
              <MpFlex align="center" justify="flex-end" gap="2" marginTop="2">
                <MpButton variant="ghost" size="md" @click="leavePage">Leave page</MpButton>
                <MpButton variant="primary" size="md" @click="saveDraft">Save as draft &amp; exit</MpButton>
              </MpFlex>
            </MpFlex>
          </MpPopoverContent>
        </MpPopover>
        <!-- Edit mode: Continue split button (▾ → Save changes) -->
        <MpFlex v-if="step < 3 && isEdit" align="center">
          <MpButton variant="primary" size="md" :class="splitMain" @click="next">Continue</MpButton>
          <MpPopover placement="top-end" use-portal is-close-on-select>
            <MpPopoverTrigger>
              <MpButton variant="primary" size="md" left-icon="caret-down" :class="splitCaret" aria-label="More actions" />
            </MpPopoverTrigger>
            <MpPopoverContent :class="css({ minWidth: '160px' })">
              <MpPopoverList>
                <MpPopoverListItem @click="saveChanges">Save changes</MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
        </MpFlex>
        <MpButton v-else-if="step < 3" variant="primary" size="md" @click="next">Continue</MpButton>
        <MpButton v-else-if="isEdit" variant="primary" size="md" @click="saveChanges">Save changes</MpButton>
        <MpButton v-else variant="primary" size="md" @click="save">Save</MpButton>
      </MpFlex>
    </div>
  </MpFlex>

  <!-- Unassigned criteria values alert (on Continue from Assign plans) -->
  <MpModal id="unassigned-alert" :is-open="alertOpen" is-centered :is-keep-alive="false" @close="alertOpen = false">
    <MpModalContent>
      <MpModalHeader>
        Unassigned {{ criteriaNoun }} detected
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <MpFlex direction="column" gap="4">
          <MpText size="body" color="text.secondary">
            The following {{ criteriaNoun }} are not assigned to any plan. Employees in these {{ criteriaNoun }} will not receive a default plan.
          </MpText>
          <div :class="warnBox">
            <PxIcon name="warning-triangle" :size="20" color="icon.warning" />
            <MpFlex direction="column" gap="1" minWidth="0">
              <MpText size="body-small" weight="semiBold" color="text.default">{{ unassigned.length }} unassigned {{ criteriaNoun }}:</MpText>
              <Pixel.ul :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
                <Pixel.li v-for="v in unassigned" :key="v"><MpText size="body-small" color="text.default">{{ v }}</MpText></Pixel.li>
              </Pixel.ul>
            </MpFlex>
          </div>
        </MpFlex>
      </MpModalBody>
      <MpModalFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="100%">
          <MpButton variant="ghost" size="md" @click="alertOpen = false">Go back</MpButton>
          <MpButton variant="primary" size="md" @click="continueAnyway">Continue anyway</MpButton>
        </MpFlex>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>
