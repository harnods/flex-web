<!--
  Mekari Flex — Settings · Approval edit
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel,
  MpFlex, MpText, MpButton, MpIcon,
  MpFormControl, MpFormLabel,
  MpInput, MpAutocomplete, MpCheckbox,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpRadio, MpTooltip,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Edit approval',
  navKey: 'settings',
  breadcrumb: [
    { label: 'Approvals', to: '/settings/approvals' },
  ],
})

const isEdit = true

const NAME_MAX = 60

interface Approver { id: string; type: 'employee' | 'position'; value: string }
interface ApprovalStep { id: string; mode: 'everyone' | 'anyone'; approvers: Approver[] }

const approvalName = ref(isEdit ? 'Approval untuk cabang Bandung' : '')
const selectedBranches = ref<string[]>(isEdit ? ['Bandung', 'Cimahi'] : [])
const steps = ref<ApprovalStep[]>(
  isEdit
    ? [
        {
          id: 's1', mode: 'everyone',
          approvers: [
            { id: 'a1', type: 'employee', value: 'Jessie Tan' },
            { id: 'a2', type: 'position', value: 'Manager' },
          ],
        },
        {
          id: 's2', mode: 'everyone',
          approvers: [
            { id: 'a3', type: 'employee', value: 'Rizal Candra' },
            { id: 'a4', type: 'employee', value: 'Ali Imran' },
          ],
        },
      ]
    : [{ id: 's1', mode: 'everyone', approvers: [{ id: 'a1', type: 'employee', value: '' }] }],
)

const branchOptions = ['Jakarta', 'BSD', 'Denpasar', 'Surabaya', 'Malang', 'Bandung', 'Cimahi']
const employeeOptions = ['Jessie Tan', 'Cinta Ayu', 'Rizal Candra', 'Ali Imran', 'Siti Rahayu', 'Budi Santoso']
const positionOptions = ['Manager', 'HR Staff', 'Director', 'Finance Staff', 'Supervisor', 'Team Lead']


// Branches used in other existing rules — shown as "Used" in the dropdown.
// Branches owned by the current rule are excluded.
const allBranchesInRules = new Set(['Bandung', 'Cimahi'])
const ownBranches = new Set(isEdit ? ['Bandung', 'Cimahi'] : [])

const branchSearch = ref('')
const filteredBranchOptions = computed(() => {
  const q = branchSearch.value.trim().toLowerCase()
  return q ? branchOptions.filter(b => b.toLowerCase().includes(q)) : branchOptions
})

// Auto-focus search input when branch popover opens — ref on MpInput component
const branchSearchInputRef = ref()
function onBranchOpen() {
  nextTick(() => {
    const el = branchSearchInputRef.value?.$el?.querySelector?.('input')
      ?? branchSearchInputRef.value?.querySelector?.('input')
    el?.focus()
  })
}

function setApproverType(step: ApprovalStep, approver: Approver, type: 'employee' | 'position') {
  if (approver.type !== type) { approver.type = type; approver.value = '' }
}

// When a step switches to "everyone", reset any position approvers to employee
watch(
  () => steps.value.map(s => s.mode),
  (newModes, oldModes) => {
    steps.value.forEach((s, i) => {
      if (oldModes[i] !== 'everyone' && newModes[i] === 'everyone') {
        s.approvers.forEach(a => { if (a.type === 'position') { a.type = 'employee'; a.value = '' } })
      }
    })
  },
)

// Approver choices per row — excludes same-type values already selected in other rows/steps
function approverChoices(currentApproverId: string, type: 'employee' | 'position'): string[] {
  const options = type === 'employee' ? employeeOptions : positionOptions
  const selected = new Set<string>()
  for (const s of steps.value) {
    for (const a of s.approvers) {
      if (a.id !== currentApproverId && a.type === type && a.value) selected.add(a.value)
    }
  }
  return options.filter(opt => !selected.has(opt))
}

const usedElsewhere = computed<Set<string>>(() => {
  const out = new Set<string>()
  for (const b of allBranchesInRules) {
    if (!ownBranches.has(b)) out.add(b)
  }
  return out
})

function removeBranch(branch: string) {
  selectedBranches.value = selectedBranches.value.filter(b => b !== branch)
}

const MAX_STEPS = 5

function addStep() {
  if (steps.value.length >= MAX_STEPS) return
  steps.value.push({
    id: `s${Date.now()}`, mode: 'everyone',
    approvers: [{ id: `a${Date.now()}`, type: 'employee', value: '' }],
  })
}

function removeStep(stepId: string) {
  if (steps.value.length > 1) steps.value = steps.value.filter(s => s.id !== stepId)
}

function addApprover(stepId: string) {
  const step = steps.value.find(s => s.id === stepId)
  if (step) step.approvers.push({ id: `a${Date.now()}`, type: 'employee', value: '' })
}

function removeApprover(stepId: string, approverId: string) {
  const step = steps.value.find(s => s.id === stepId)
  if (step && step.approvers.length > 1)
    step.approvers = step.approvers.filter(a => a.id !== approverId)
}

// Validation errors
const errName = ref('')
const errBranch = ref('')
interface StepErrors { approvers: string[] }
const errSteps = ref<StepErrors[]>([])

function validate(): boolean {
  let ok = true

  errName.value = approvalName.value.trim()
    ? '' : 'You must fill in Approval name'
  if (errName.value) ok = false

  errBranch.value = selectedBranches.value.length
    ? '' : 'You must select at least one Branch'
  if (errBranch.value) ok = false

  errSteps.value = steps.value.map((step) => ({
    approvers: step.approvers.map((a) => {
      if (!a.value) { ok = false; return 'You must select Approver' }
      return ''
    }),
  }))

  return ok
}

function save() {
  if (!validate()) return
  toast.notify({
    id: 'approval-saved',
    position: 'top-center',
    variant: 'success',
    title: 'Approval changes saved',
  })
  navigateTo('/settings/approvals')
}

// Pre-computed style classes
const typeTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  h: '10', px: '3', w: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'md', cursor: 'pointer', bg: 'background.neutral', outline: 'none',
  _hover: { borderColor: 'border.selected' }, _focus: { borderColor: 'border.selected' },
})
const branchTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  h: '10', px: '3', w: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'md', cursor: 'pointer', bg: 'background.neutral', outline: 'none',
  _hover: { borderColor: 'border.selected' }, _focus: { borderColor: 'border.selected' },
})
const stepBadge = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, w: '24px', h: '24px', borderRadius: 'full',
  bg: 'background.brand.selected',
})
</script>

<template>
  <MpFlex direction="column" gap="6" :class="css({ maxWidth: '552px' })">

    <!-- ─── Approval name + Branch ─── -->
    <MpFlex direction="column" gap="0">

      <!-- Approval name with character counter -->
      <MpFormControl id="approval-name" is-required :is-invalid="!!errName" :class="css({ pb: '5' })">
        <MpFlex justify="space-between" align="center" :class="css({ mb: '1' })">
          <MpFormLabel :class="css({ mb: '0' })">Approval name</MpFormLabel>
          <MpText size="body-small" color="text.secondary">
            {{ approvalName.length }} / {{ NAME_MAX }}
          </MpText>
        </MpFlex>
        <MpInput
          v-model="approvalName"
          is-full-width
          :maxlength="NAME_MAX"
          placeholder="Enter approval name"
          :is-invalid="!!errName"
          @input="errName = ''"
        />
        <MpText v-if="errName" size="body-small" color="text.danger" :class="css({ mt: '1' })">
          {{ errName }}
        </MpText>
      </MpFormControl>

      <!-- Branch: MpPopover multi-select with MpCheckbox — stays open on each pick -->
      <MpFormControl id="branch" is-required :is-invalid="!!errBranch" :class="css({ pb: '5' })">
        <MpFormLabel>Branch</MpFormLabel>
        <Pixel.div :class="css({ width: '264px' })">
          <MpPopover @open="onBranchOpen" @close="branchSearch = ''">
            <MpPopoverTrigger>
              <Pixel.button :class="branchTrigger">
                <MpText :color="selectedBranches.length ? 'text.default' : 'text.placeholder'">
                  {{ selectedBranches.length ? `${selectedBranches.length} branch selected` : 'Select branch' }}
                </MpText>
                <MpIcon name="caret-down" size="sm" color="icon.secondary" />
              </Pixel.button>
            </MpPopoverTrigger>
            <MpPopoverContent>
              <MpFlex direction="column" :class="css({ w: '264px', py: '2' })">
                <Pixel.div :class="css({ px: '2', pb: '1' })">
                  <MpInput
                    ref="branchSearchInputRef"
                    v-model="branchSearch"
                    placeholder="Search branch"
                    left-icon="search"
                    is-full-width
                  />
                </Pixel.div>
                <MpFlex
                  v-for="branch in filteredBranchOptions"
                  :key="branch"
                  align="center"
                  :class="css({ px: '3', h: '9', justifyContent: 'space-between' })"
                >
                  <MpCheckbox :id="`br-${branch}`" :value="branch" v-model="selectedBranches" :is-disabled="usedElsewhere.has(branch)">
                    {{ branch }}
                  </MpCheckbox>
                  <MpText v-if="usedElsewhere.has(branch)" size="body-small" color="text.secondary">
                    Used
                  </MpText>
                </MpFlex>
              </MpFlex>
            </MpPopoverContent>
          </MpPopover>
        </Pixel.div>
        <!-- Selected branches: 36px height, no gap between items -->
        <Pixel.div :class="css({ width: '264px' })">
          <MpFlex
            v-for="branch in selectedBranches"
            :key="branch"
            justify="space-between"
            align="center"
            :class="css({ h: '9' })"
          >
            <MpText size="body" color="text.default">{{ branch }}</MpText>
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="minus-circular"
              :aria-label="`Remove ${branch}`"
              @click="removeBranch(branch)"
            />
          </MpFlex>
        </Pixel.div>
        <MpText v-if="errBranch" size="body-small" color="text.danger" :class="css({ mt: '1' })">
          {{ errBranch }}
        </MpText>
      </MpFormControl>

    </MpFlex>

    <!-- ─── Approval steps ─── -->
    <MpFlex direction="column" gap="0">

      <!-- Section header -->
      <MpFlex direction="column" gap="1" :class="css({ pb: '3' })">
        <MpText size="h2" weight="semiBold" color="text.default">Approval steps</MpText>
        <MpText size="body" color="text.secondary">
          Define who must approve requests before they are processed. Steps are evaluated in order — step 1 first.
        </MpText>
      </MpFlex>

      <!-- Steps list -->
      <MpFlex
        v-for="(step, si) in steps"
        :key="step.id"
        direction="column"
        :class="css({ pb: '5' })"
      >
        <!-- Step header: badge + title + delete -->
        <MpFlex align="center" gap="3" :class="css({ pb: '3' })">
          <Pixel.div :class="stepBadge">
            <MpText size="body" color="text.default">{{ si + 1 }}</MpText>
          </Pixel.div>
          <MpText size="body" weight="semiBold" color="text.default">Approval step {{ si + 1 }}</MpText>
          <MpFlex flex="1" />
          <MpTooltip label="Remove" position="top">
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="minus-circular"
              :aria-label="`Remove step ${si + 1}`"
              :is-disabled="steps.length === 1"
              @click="removeStep(step.id)"
            />
          </MpTooltip>
        </MpFlex>

        <!-- Content: spacer (badge 24px) + gap-3 → aligns with title text -->
        <MpFlex gap="3">
          <Pixel.div :class="css({ w: '6', flexShrink: 0 })" />
          <MpFlex direction="column" flex="1" gap="0">

            <!-- Approval mode radio -->
            <MpFlex direction="column" :class="css({ pb: '5' })">
              <Pixel.div :class="css({ py: '1' })">
                <MpRadio
                  :id="`mode-everyone-${step.id}`"
                  :name="`mode-${step.id}`"
                  value="everyone"
                  v-model="step.mode"
                >
                  Everyone must approve
                  <template #description>
                    All approvers in this step must act before moving to the next step
                  </template>
                </MpRadio>
              </Pixel.div>
              <Pixel.div :class="css({ py: '1' })">
                <MpRadio
                  :id="`mode-anyone-${step.id}`"
                  :name="`mode-${step.id}`"
                  value="anyone"
                  v-model="step.mode"
                >
                  Anyone can approve
                  <template #description>
                    Any one approver is enough to move the request forward
                  </template>
                </MpRadio>
              </Pixel.div>
            </MpFlex>

            <!-- Approvers: type select + value autocomplete in one row -->
            <MpFlex direction="column" gap="0" :class="css({ pb: '5' })">
              <!-- Section label -->
              <MpFlex align="center" gap="1" :class="css({ mb: '1' })">
                <MpText size="body" weight="semiBold" color="text.default">Approver</MpText>
                <MpText as="span" size="body" color="text.danger">*</MpText>
              </MpFlex>
              <MpFlex
                v-for="(approver, ai) in step.approvers"
                :key="approver.id"
                gap="2"
                align="flex-start"
                :class="css({ pb: ai < step.approvers.length - 1 ? '3' : '0' })"
              >
                <!-- Type selector -->
                <Pixel.div :class="css({ width: '140px', flexShrink: 0 })">
                  <MpPopover is-close-on-select>
                    <MpPopoverTrigger>
                      <Pixel.button :class="typeTrigger">
                        <MpText color="text.default">
                          {{ approver.type === 'employee' ? 'Employee' : 'Job position' }}
                        </MpText>
                        <MpIcon name="caret-down" size="sm" color="icon.secondary" />
                      </Pixel.button>
                    </MpPopoverTrigger>
                    <MpPopoverContent>
                      <MpPopoverList>
                        <MpPopoverListItem :is-active="approver.type === 'employee'" @click="setApproverType(step, approver, 'employee')">Employee</MpPopoverListItem>
                        <MpPopoverListItem v-if="step.mode === 'anyone'" :is-active="approver.type === 'position'" @click="setApproverType(step, approver, 'position')">Job position</MpPopoverListItem>
                      </MpPopoverList>
                    </MpPopoverContent>
                  </MpPopover>
                </Pixel.div>

                <!-- Value autocomplete + error -->
                <MpFlex direction="column" gap="0" :class="css({ width: '264px' })">
                  <MpAutocomplete
                    :id="`approver-${step.id}-${ai}`"
                    v-model="approver.value"
                    :data="approverChoices(approver.id, approver.type)"
                    is-searchable
                    is-clearable
                    :placeholder="approver.type === 'employee' ? 'Select employee' : 'Select job position'"
                    is-full-width
                    :is-loading="false"
                    :is-invalid="!!(errSteps[si]?.approvers[ai])"
                    @change="errSteps[si] && (errSteps[si].approvers[ai] = '')"
                  />
                  <MpText v-if="errSteps[si]?.approvers[ai]" size="body-small" color="text.danger" :class="css({ mt: '1' })">
                    {{ errSteps[si].approvers[ai] }}
                  </MpText>
                </MpFlex>

                <!-- Remove button -->
                <MpTooltip label="Remove" position="top">
                  <MpButton
                    variant="ghost"
                    size="sm"
                    left-icon="minus-circular"
                    :aria-label="`Remove approver ${ai + 1}`"
                    :is-disabled="step.approvers.length === 1"
                    @click="removeApprover(step.id, approver.id)"
                  />
                </MpTooltip>
              </MpFlex>
            </MpFlex>

            <!-- Add approver -->
            <MpButton variant="ghost" size="sm" left-icon="add" @click="addApprover(step.id)">
              Add approver
            </MpButton>

          </MpFlex>
        </MpFlex>
      </MpFlex>

      <!-- Add approval step -->
      <MpFlex direction="column" gap="1">
        <MpButton variant="secondary" left-icon="add" :is-disabled="steps.length >= MAX_STEPS" @click="addStep">
          Add approval step
        </MpButton>
        <MpText v-if="steps.length >= MAX_STEPS" size="body-small" color="text.secondary">
          Maximum {{ MAX_STEPS }} approval steps allowed
        </MpText>
      </MpFlex>

    </MpFlex>

    <!-- ─── Action group ─── -->
    <MpFlex gap="2" :class="css({ pb: '5', pt: '1', w: 'full', justifyContent: 'flex-end' })">
      <MpButton variant="ghost" @click="navigateTo('/settings/approvals')">Cancel</MpButton>
      <MpButton variant="primary" @click="save">Save</MpButton>
    </MpFlex>

  </MpFlex>
</template>
