<!--
  Mekari Flex — Settings · Approval edit
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel,
  MpFlex, MpText, MpButton, MpIcon,
  MpFormControl, MpFormLabel,
  MpInput, MpAutocomplete, MpCheckbox, MpRadio,
  MpPopover, MpPopoverTrigger, MpPopoverContent,
  MpTooltip,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Edit approval',
  navKey: 'settings',
  breadcrumb: [
    { label: 'Approvals', to: '/settings/approvals' },
  ],
})

const NAME_MAX = 60
const MAX_STEPS = 5
const MAX_APPROVERS = 6

interface Approver { id: string; value: string }
interface ApprovalStep { id: string; approvers: Approver[] }

const approvalName = ref('Approval untuk cabang Bandung')
const selectedBranches = ref<string[]>(['Bandung', 'Cimahi'])
const transactionTypeMode = ref<'all' | 'selected'>('selected')
const selectedTransactionTypes = ref<string[]>(['Cashout', 'e-Wallet top up'])
const steps = ref<ApprovalStep[]>([
  {
    id: 's1',
    approvers: [
      { id: 'a1', value: 'Jessie Tan' },
      { id: 'a2', value: 'Cinta Ayu' },
    ],
  },
  {
    id: 's2',
    approvers: [
      { id: 'a3', value: 'Rizal Candra' },
      { id: 'a4', value: 'Ali Imran' },
    ],
  },
])

const branchOptions = ['Jakarta', 'BSD', 'Denpasar', 'Surabaya', 'Malang', 'Bandung', 'Cimahi']
const employeeOptions = ['Jessie Tan', 'Cinta Ayu', 'Rizal Candra', 'Ali Imran', 'Siti Rahayu', 'Budi Santoso']
const TRANSACTION_TYPES = ['Cashout', 'e-Wallet top up', 'PDAM', 'Electricity', 'Mobile plan', 'Voucher']

const allBranchesInRules = new Set(['Bandung', 'Cimahi'])
const ownBranches = new Set(['Bandung', 'Cimahi'])

const branchSearch = ref('')
const filteredBranchOptions = computed(() => {
  const q = branchSearch.value.trim().toLowerCase()
  return q ? branchOptions.filter(b => b.toLowerCase().includes(q)) : branchOptions
})

const branchSearchInputRef = ref()
function onBranchOpen() {
  nextTick(() => {
    const el = branchSearchInputRef.value?.$el?.querySelector?.('input')
      ?? branchSearchInputRef.value?.querySelector?.('input')
    el?.focus()
  })
}

function approverChoices(currentApproverId: string): string[] {
  const selected = new Set<string>()
  for (const s of steps.value) {
    for (const a of s.approvers) {
      if (a.id !== currentApproverId && a.value) selected.add(a.value)
    }
  }
  return employeeOptions.filter(opt => !selected.has(opt))
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

function addStep() {
  if (steps.value.length >= MAX_STEPS) return
  steps.value.push({
    id: `s${Date.now()}`,
    approvers: [{ id: `a${Date.now()}`, value: '' }],
  })
}

function removeStep(stepId: string) {
  if (steps.value.length > 1) steps.value = steps.value.filter(s => s.id !== stepId)
}

function addApprover(stepId: string) {
  const step = steps.value.find(s => s.id === stepId)
  if (step && step.approvers.length < MAX_APPROVERS)
    step.approvers.push({ id: `a${Date.now()}`, value: '' })
}

function removeApprover(stepId: string, approverId: string) {
  const step = steps.value.find(s => s.id === stepId)
  if (step && step.approvers.length > 1)
    step.approvers = step.approvers.filter(a => a.id !== approverId)
}

const errName = ref('')
const errBranch = ref('')
const errTransactionType = ref('')
interface StepErrors { approvers: string[] }
const errSteps = ref<StepErrors[]>([])

function validate(): boolean {
  let ok = true

  errName.value = approvalName.value.trim() ? '' : 'You must fill in Approval name'
  if (errName.value) ok = false

  errBranch.value = selectedBranches.value.length ? '' : 'You must select at least one Branch'
  if (errBranch.value) ok = false

  errTransactionType.value = (transactionTypeMode.value === 'all' || selectedTransactionTypes.value.length)
    ? '' : 'You must select at least one transaction type'
  if (errTransactionType.value) ok = false

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
                  <MpCheckbox :id="`br-${branch}`" :value="branch" v-model="selectedBranches">
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

      <!-- Transaction type -->
      <MpFormControl id="transaction-type" is-required :is-invalid="!!errTransactionType">
        <MpFormLabel>Transaction type</MpFormLabel>
        <MpFlex direction="column" gap="2">
          <Pixel.div :class="css({ py: '1' })">
            <MpRadio
              id="tx-all"
              name="transaction-type"
              value="all"
              v-model="transactionTypeMode"
              @change="errTransactionType = ''"
            >
              All transaction types
            </MpRadio>
          </Pixel.div>
          <Pixel.div :class="css({ py: '1' })">
            <MpRadio
              id="tx-selected"
              name="transaction-type"
              value="selected"
              v-model="transactionTypeMode"
              @change="errTransactionType = ''"
            >
              Specific transaction types
            </MpRadio>
          </Pixel.div>
          <MpFlex v-if="transactionTypeMode === 'selected'" direction="column" gap="2" :class="css({ pl: '6' })">
            <MpCheckbox
              v-for="type in TRANSACTION_TYPES"
              :key="type"
              :id="`tx-${type}`"
              :value="type"
              v-model="selectedTransactionTypes"
              @change="errTransactionType = ''"
            >
              {{ type }}
            </MpCheckbox>
            <MpText v-if="errTransactionType" size="body-small" color="text.danger">
              {{ errTransactionType }}
            </MpText>
          </MpFlex>
        </MpFlex>
      </MpFormControl>

    </MpFlex>

    <!-- ─── Approval steps ─── -->
    <MpFlex direction="column" gap="0">

      <MpFlex direction="column" gap="1" :class="css({ pb: '3' })">
        <MpText size="h2" weight="semiBold" color="text.default">Approval steps</MpText>
        <MpText size="body" color="text.secondary">
          Set up the approval flow. Steps are completed in order, and any one of the approvers in a step can approve to move to the next.
        </MpText>
      </MpFlex>

      <MpFlex
        v-for="(step, si) in steps"
        :key="step.id"
        direction="column"
        :class="css({ pb: '5' })"
      >
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

        <MpFlex gap="3">
          <Pixel.div :class="css({ w: '6', flexShrink: 0 })" />
          <MpFlex direction="column" flex="1" gap="0">

            <MpFlex direction="column" gap="0" :class="css({ pb: '3' })">
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
                <MpFlex direction="column" gap="0" :class="css({ width: '264px' })">
                  <MpAutocomplete
                    :id="`approver-${step.id}-${ai}`"
                    v-model="approver.value"
                    :data="approverChoices(approver.id)"
                    is-searchable
                    is-clearable
                    placeholder="Select employee"
                    is-full-width
                    :is-loading="false"
                    :is-invalid="!!(errSteps[si]?.approvers[ai])"
                    @change="errSteps[si] && (errSteps[si].approvers[ai] = '')"
                  />
                  <MpText v-if="errSteps[si]?.approvers[ai]" size="body-small" color="text.danger" :class="css({ mt: '1' })">
                    {{ errSteps[si].approvers[ai] }}
                  </MpText>
                </MpFlex>
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

            <MpFlex direction="column" gap="1">
              <MpButton
                variant="ghost"
                size="sm"
                left-icon="add"
                :is-disabled="step.approvers.length >= MAX_APPROVERS"
                @click="addApprover(step.id)"
              >
                Add approver
              </MpButton>
              <MpText v-if="step.approvers.length >= MAX_APPROVERS" size="body-small" color="text.secondary">
                Maximum {{ MAX_APPROVERS }} approvers per step
              </MpText>
            </MpFlex>

          </MpFlex>
        </MpFlex>
      </MpFlex>

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
