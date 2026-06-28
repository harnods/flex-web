<!--
  Mekari Flex — Settings · Approval settings (global)
  Controls which transaction types require approval. Read-only by default;
  the admin must click Edit to change it. Pixel 3 DT 2.4 only — no <style>, no raw CSS.
  Static segment "settings" resolves before the dynamic [id] route in Nuxt.
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpRadio, MpCheckbox,
  MpInputGroup, MpInputLeftAddon, MpInput, css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Approvals',
  navKey: 'settings',
  tabs: [
    { label: 'Rules', to: '/settings/approvals' },
    { label: 'Settings', to: '/settings/approvals/settings' },
  ],
})

const TRANSACTION_TYPES = ['Cashout', 'e-Wallet top-up', 'PDAM', 'Electricity', 'Mobile plan', 'Voucher']

type Scope = 'all' | 'selected'
type AmountMode = 'any' | 'minimum'

// Saved configuration — the source of truth shown in view mode.
const savedScope = ref<Scope>('all')
const savedTypes = ref<string[]>([])
const savedAmountMode = ref<AmountMode>('any')
const savedMinAmount = ref<number>(0)

// Edit form draft (only meaningful while editing).
const isEditing = ref(false)
const draftScope = ref<Scope>('all')
const draftTypes = ref<string[]>([])
const draftAmountMode = ref<AmountMode>('any')
const draftMinAmount = ref<number | null>(null)

const savedTypeList = computed(() =>
  TRANSACTION_TYPES.filter(t => savedTypes.value.includes(t)),
)

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

// Text input bound to draftMinAmount but displayed with thousand separators
// (id-ID uses "." e.g. 1.000.000). Strips non-digits on input.
const minAmountDisplay = computed<string>({
  get: () => (draftMinAmount.value != null ? formatRupiah(draftMinAmount.value) : ''),
  set: (val) => {
    const digits = String(val).replace(/\D/g, '')
    draftMinAmount.value = digits ? Number(digits) : null
  },
})

const canSave = computed(() => {
  if (draftScope.value === 'selected') return draftTypes.value.length > 0
  if (draftAmountMode.value === 'minimum') return !!draftMinAmount.value && draftMinAmount.value > 0
  return true
})

function startEdit() {
  draftScope.value = savedScope.value
  draftTypes.value = [...savedTypes.value]
  draftAmountMode.value = savedAmountMode.value
  draftMinAmount.value = savedMinAmount.value || null
  isEditing.value = true
}

function cancel() {
  isEditing.value = false
}

function save() {
  savedScope.value = draftScope.value
  savedTypes.value = draftScope.value === 'selected' ? [...draftTypes.value] : []
  savedAmountMode.value = draftScope.value === 'all' ? draftAmountMode.value : 'any'
  savedMinAmount.value = draftScope.value === 'all' && draftAmountMode.value === 'minimum'
    ? (draftMinAmount.value ?? 0)
    : 0
  isEditing.value = false
  toast.notify({ id: 'approval-settings-saved', position: 'top-center', variant: 'success', title: 'Settings saved' })
}
</script>

<template>
  <MpFlex direction="column" gap="6" :class="css({ maxWidth: '640px' })">
    <!-- Section header + Edit action -->
    <MpFlex justify="space-between" align="flex-start" gap="4">
      <MpFlex direction="column" gap="1">
        <MpText as="h2" size="h3" weight="semiBold" color="text.default">General settings</MpText>
        <MpText size="body" color="text.secondary">
          Applies to all branches and approval rules.
        </MpText>
      </MpFlex>
      <MpButton v-if="!isEditing" variant="ghost" left-icon="edit" @click="startEdit">Edit</MpButton>
    </MpFlex>

    <!-- VIEW MODE -->
    <MpFlex v-if="!isEditing" direction="column" gap="1">
      <MpText size="label" weight="semiBold" color="text.secondary">Transaction types requiring approval</MpText>

      <MpFlex v-if="savedScope === 'all'" direction="column" gap="1" :class="css({ paddingLeft: '4' })">
        <MpText size="body" color="text.default">All transaction types</MpText>
        <MpText size="body" color="text.secondary">
          {{ savedAmountMode === 'any'
            ? 'Any amount requires approval'
            : `Only transactions of at least Rp ${formatRupiah(savedMinAmount)} require approval` }}
        </MpText>
      </MpFlex>

      <Pixel.div v-else :class="css({ paddingLeft: '4' })">
        <Pixel.ul :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
          <Pixel.li v-for="t in savedTypeList" :key="t">
            <MpText size="body" color="text.default">{{ t }}</MpText>
          </Pixel.li>
        </Pixel.ul>
      </Pixel.div>
    </MpFlex>

    <!-- EDIT MODE -->
    <template v-else>
      <MpFlex direction="column" gap="3">
        <MpRadio id="scope-all" value="all" v-model="draftScope">
          All transaction types
          <template #description>Every transaction type requires approval.</template>
        </MpRadio>

        <!-- Amount rule, only when "All transaction types" is chosen -->
        <MpFlex
          v-if="draftScope === 'all'"
          direction="column"
          gap="3"
          :class="css({ paddingLeft: '28px' })"
        >
          <MpRadio id="amount-any" value="any" v-model="draftAmountMode">
            Any amount requires approval
            <template #description>Every transaction requires approval, regardless of amount.</template>
          </MpRadio>

          <MpRadio id="amount-minimum" value="minimum" v-model="draftAmountMode">
            Set a minimum amount
            <template #description>Only transactions at or above this amount require approval.</template>
          </MpRadio>

          <Pixel.div v-if="draftAmountMode === 'minimum'" :class="css({ paddingLeft: '28px', maxWidth: '240px' })">
            <MpInputGroup size="md" is-full-width>
              <MpInputLeftAddon>Rp</MpInputLeftAddon>
              <MpInput
                v-model="minAmountDisplay"
                type="text"
                inputmode="numeric"
                placeholder="0"
                is-full-width
              />
            </MpInputGroup>
          </Pixel.div>
        </MpFlex>

        <MpRadio id="scope-selected" value="selected" v-model="draftScope">
          Selected transaction types
          <template #description>Only the selected transaction types require approval.</template>
        </MpRadio>

        <!-- Multi-select, shown only when "Selected" is chosen -->
        <MpFlex
          v-if="draftScope === 'selected'"
          direction="column"
          gap="3"
          :class="css({ paddingLeft: '28px' })"
        >
          <MpCheckbox
            v-for="t in TRANSACTION_TYPES"
            :key="t"
            :id="`type-${t}`"
            :value="t"
            v-model="draftTypes"
          >{{ t }}</MpCheckbox>
        </MpFlex>
      </MpFlex>

      <MpFlex justify="flex-end" gap="2">
        <MpButton variant="ghost" @click="cancel">Cancel</MpButton>
        <MpButton variant="primary" :is-disabled="!canSave" @click="save">Save changes</MpButton>
      </MpFlex>
    </template>
  </MpFlex>
</template>
