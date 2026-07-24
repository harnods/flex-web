<!--
  Mekari Flex — Flex benefit · Create new package (2-step wizard)
  Step 1: Set up package → Step 2: Arrange group.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS (stepper + tree composed from primitives).
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpInput, MpInputGroup, MpInputLeftAddon,
  MpRadio, MpCheckbox, MpTextlink, MpDatePicker, MpSelect,
  MpPopover, MpPopoverTrigger, MpPopoverContent,
  toast, css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Create new package',
  navKey: 'flex-benefit',
  breadcrumb: [{ label: 'Package', to: '/flex-benefit/packages' }],
})

const router = useRouter()
const { addPackage } = usePackages()

// ── Wizard state ──────────────────────────────────────────────────────────────
const STEPS = ['Set up package', 'Arrange group']
const step = ref(1)

// ── Step 1 — Package detail ─────────────────────────────────────────────────────
const name = ref('')
const cyclePeriod = ref<'Monthly' | 'Custom'>('Monthly')

// Monthly-only settings.
// topUpDay: which day of the month the balance tops up (was hardcoded to the 1st).
//   1–31, or 'last' for the last day of the month.
// carryOver: if true, unused balance carries over instead of being reset.
const TOP_UP_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const topUpDay = ref<number | 'last'>(1)
const carryOver = ref(false)

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
// Days 29–31 don't exist in every month, so they fall back to the last day of the
// shorter month — spell that out in the helper so the behaviour isn't ambiguous.
const topUpWhen = computed(() => {
  if (topUpDay.value === 'last') return 'the last day of every month'
  const n = Number(topUpDay.value)
  const suffix = n > 28 ? ' (or the last day in shorter months)' : ''
  return `the ${ordinal(n)} of every month${suffix}`
})
const monthlyHelper = computed(() =>
  carryOver.value
    ? `Unused balance carries over. Balance tops up on ${topUpWhen.value}.`
    : `Balance resets on ${topUpWhen.value}.`,
)

const today = new Date()
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
const effectiveStart = ref<Date>(today)
const effectiveEnd = ref<Date>(tomorrow)

// ── Package categories (tri-state checkbox tree) ────────────────────────────────
interface CatItem { id: string; label: string }
interface CatGroup { id: string; label: string; items: CatItem[] }
interface CatRoot { id: string; label: string; groups: CatGroup[] }

// Top-level categories. Wellness & Lifestyle sit at the SAME level as
// Top up & Bills. A group with no items (e.g. PDAM, Dental) acts as its own leaf.
const CATEGORIES: CatRoot[] = [
  {
    id: 'topup', label: 'Top up & Bills',
    groups: [
      { id: 'mobile', label: 'Mobile plan & data', items: [
        { id: 'mobile-postpaid', label: 'Postpaid' },
        { id: 'mobile-prepaid', label: 'Prepaid' },
        { id: 'mobile-dataplan', label: 'Data plan' },
      ] },
      { id: 'electricity', label: 'Electricity', items: [
        { id: 'elec-postpaid', label: 'Postpaid' },
        { id: 'elec-token', label: 'Token PLN' },
      ] },
      { id: 'ewallet', label: 'E-wallet', items: [
        { id: 'ew-gopay', label: 'Gopay' },
        { id: 'ew-ovo', label: 'Ovo' },
        { id: 'ew-shopee', label: 'Shopee' },
      ] },
      { id: 'pdam', label: 'PDAM', items: [] },
    ],
  },
  {
    id: 'wellness', label: 'Wellness',
    groups: [
      { id: 'well-dental', label: 'Dental', items: [] },
      { id: 'well-healthcare', label: 'Healthcare', items: [] },
      { id: 'well-vitamin', label: 'Vitamin & Supplement', items: [] },
      { id: 'well-gym', label: 'Gym Membership', items: [] },
      { id: 'well-medlab', label: 'Medical Laboratory', items: [] },
      { id: 'well-catering', label: 'Healthy Catering', items: [] },
      { id: 'well-mental', label: 'Mental health', items: [] },
      { id: 'well-optical', label: 'Optical', items: [] },
      { id: 'well-sportequip', label: 'Sport Equipment', items: [] },
      { id: 'well-telehealth', label: 'Telehealth', items: [] },
      { id: 'well-selfdev', label: 'Self Development', items: [] },
      { id: 'well-msn-groceries', label: 'MSN Online Groceries', items: [] },
      { id: 'well-msn-transport', label: 'MSN Transportation', items: [] },
      { id: 'well-msn-donation', label: 'MSN Donation', items: [] },
      { id: 'well-sportvenue', label: 'Sport Venue and Activity', items: [] },
      { id: 'well-msn-pulsa', label: 'MSN Pulsa', items: [] },
    ],
  },
  {
    id: 'lifestyle', label: 'Lifestyle',
    groups: [
      { id: 'life-groceries', label: 'Groceries', items: [] },
      { id: 'life-household', label: 'Household', items: [] },
      { id: 'life-beauty', label: 'Beauty & Treatment', items: [] },
      { id: 'life-fnb', label: 'F&B', items: [] },
      { id: 'life-donation', label: 'Donation', items: [] },
      { id: 'life-selfdev', label: 'Self Development', items: [] },
      { id: 'life-homeliving', label: 'Home & Living', items: [] },
      { id: 'life-retail', label: 'Retail', items: [] },
      { id: 'life-shopping', label: 'Shopping experience', items: [] },
      { id: 'life-conference', label: 'Mekari Conference', items: [] },
      { id: 'life-others', label: 'Others', items: [] },
    ],
  },
  {
    id: 'commuting', label: 'Commuting',
    groups: [
      { id: 'commute-bikecar', label: 'Bike/Car Transport', items: [] },
      { id: 'commute-delivery', label: 'Food/Package Delivery', items: [] },
      { id: 'commute-others', label: 'Others', items: [] },
      { id: 'commute-transport', label: 'Transportation', items: [] },
    ],
  },
  {
    id: 'protection', label: 'Protection',
    groups: [
      { id: 'protect-accident', label: 'Personal Accident', items: [] },
      { id: 'protect-telehealth', label: 'Telehealth', items: [] },
      { id: 'protect-msn-insurance', label: 'MSN Insurance 2022', items: [] },
      { id: 'protect-vip', label: 'Mekari VIP', items: [] },
    ],
  },
]

// A group with no items acts as its own leaf — its checkbox toggles the group id
// directly and it's never in an indeterminate state.
const groupLeafIds = (g: CatGroup) => g.items.length ? g.items.map((i) => i.id) : [g.id]
const rootLeafIds = (r: CatRoot) => r.groups.flatMap(groupLeafIds)
const allLeafIds = computed(() => CATEGORIES.flatMap(rootLeafIds))
const selected = ref<string[]>([])

const isLeafChecked = (id: string) => selected.value.includes(id)
function toggleLeaf(id: string, checked: boolean) {
  if (checked) { if (!selected.value.includes(id)) selected.value.push(id) }
  else selected.value = selected.value.filter((x) => x !== id)
}

function addLeaves(ids: string[], checked: boolean) {
  if (checked) selected.value = Array.from(new Set([...selected.value, ...ids]))
  else selected.value = selected.value.filter((x) => !ids.includes(x))
}
function stateOf(ids: string[]) {
  const n = ids.filter((id) => selected.value.includes(id)).length
  return { checked: n === ids.length, indeterminate: n > 0 && n < ids.length }
}

const isGroupChecked = (g: CatGroup) => stateOf(groupLeafIds(g)).checked
const isGroupIndeterminate = (g: CatGroup) => stateOf(groupLeafIds(g)).indeterminate
const toggleGroup = (g: CatGroup, checked: boolean) => addLeaves(groupLeafIds(g), checked)

const isRootChecked = (r: CatRoot) => stateOf(rootLeafIds(r)).checked
const isRootIndeterminate = (r: CatRoot) => stateOf(rootLeafIds(r)).indeterminate
const toggleRoot = (r: CatRoot, checked: boolean) => addLeaves(rootLeafIds(r), checked)

function selectAll() {
  selected.value = [...allLeafIds.value]
}

// ── Limit ───────────────────────────────────────────────────────────────────────
const overallBalance = ref(0)
const overallBalanceDisplay = computed({
  get: () => overallBalance.value ? overallBalance.value.toLocaleString('id-ID') : '',
  set: (v: string) => { overallBalance.value = Number(String(v).replace(/[^\d]/g, '')) || 0 },
})
const classifyByCategory = ref(false)

// ── Reimbursement settings ──────────────────────────────────────────────────────
const reimbursement = ref<'Yes' | 'No'>('No')

// ── Validation ──────────────────────────────────────────────────────────────────
const triggered = ref(false)
const errName = computed(() => triggered.value && !name.value.trim())
const errDate = computed(() => triggered.value && (!effectiveStart.value || !effectiveEnd.value))
const errBalance = computed(() => triggered.value && !(overallBalance.value > 0))
const step1Valid = computed(() =>
  name.value.trim() && effectiveStart.value && effectiveEnd.value && overallBalance.value > 0)

// ── Footer actions ──────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

function leavePage() { router.push('/flex-benefit/packages') }
function back() { step.value = Math.max(1, step.value - 1) }
function next() {
  triggered.value = true
  if (step.value === 1) {
    if (!step1Valid.value) return
  }
  triggered.value = false
  if (step.value < STEPS.length) step.value += 1
}
function save() {
  const isMonthly = cyclePeriod.value === 'Monthly'
  addPackage({
    name: name.value.trim(),
    cyclePeriod: cyclePeriod.value,
    effectivePeriod: `${fmt(effectiveStart.value)} - ${fmt(effectiveEnd.value)}`,
    overallBalance: overallBalance.value,
    reimbursement: reimbursement.value === 'Yes',
    topUpDay: isMonthly ? topUpDay.value : undefined,
    carryOver: isMonthly ? carryOver.value : undefined,
  })
  toast.notify({ position: 'top-center', variant: 'success', title: 'Package created.' })
  router.push('/flex-benefit/packages')
}

// ── styles ──────────────────────────────────────────────────────────────────────
const fieldName = css({ width: '480px', maxWidth: '100%' })
const dateField = css({ width: '200px' })
const required = css({ color: 'text.danger' })
const sectionDivider = css({ height: '1px', background: 'border.default', marginBlock: '2' })
const leaveCard = css({ width: '360px', maxWidth: '360px' })

// category tree card
const treeCard = css({ width: '480px', maxWidth: '100%', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md', overflow: 'hidden' })
const treeHeader = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingInline: '4', paddingBlock: '3', background: 'background.surface',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
// Scroll region — top-level headers stick within it.
const treeScroll = css({ maxHeight: '360px', overflowY: 'auto', paddingBottom: '2' })
// Top-level category header — sticky so it pins to the top of the scroll box
// while its own items scroll under it. Opaque bg covers rows passing behind.
const rootRow = css({
  position: 'sticky', top: '0', zIndex: '1',
  display: 'flex', alignItems: 'center', gap: '2', paddingInline: '4', paddingBlock: '3',
  background: 'background.surface',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const groupRow = css({ display: 'flex', alignItems: 'center', gap: '2', paddingInline: '4', paddingBlock: '2', paddingLeft: '12' })
const itemRow = css({ display: 'flex', alignItems: 'center', gap: '2', paddingInline: '4', paddingBlock: '2', paddingLeft: '20' })

// sticky footer — bottom:-6 (−24px) cancels the stage's bottom padding so the
// white bar sits flush to the viewport bottom (no shell showing through below it).
const footer = css({
  position: 'sticky', bottom: '-6', zIndex: '1',
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  marginInline: '-6', marginTop: '6', marginBottom: '-6',
  paddingInline: '6', paddingBlock: '4',
  background: 'background.neutral',
})

// stepper — mirrors the enrollments create stepper (equal-width columns)
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

    <!-- ═════ Step 1 — Set up package ═════ -->
    <MpFlex v-if="step === 1" direction="column" gap="6" flex="1">
      <!-- Package detail -->
      <MpFlex direction="column" gap="3">
        <MpFlex direction="column" gap="0">
          <MpText size="h3" weight="semiBold" color="text.default">Package detail</MpText>
          <MpText size="body-small" color="text.secondary">Details of plans for the employee's benefits.</MpText>
        </MpFlex>

        <MpFlex direction="column" gap="5">
          <MpFlex direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Package name <span :class="required">*</span></MpText>
            <MpFlex :class="fieldName" direction="column" gap="1">
              <MpInput v-model="name" placeholder="" is-full-width :is-invalid="errName" />
              <MpText v-if="errName" size="body-small" color="text.danger">Package name is required.</MpText>
            </MpFlex>
          </MpFlex>

          <MpFlex direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Cycle period <span :class="required">*</span></MpText>
            <MpFlex align="center" gap="6">
              <MpRadio id="cycle-monthly" value="Monthly" v-model="cyclePeriod">Monthly</MpRadio>
              <MpRadio id="cycle-custom" value="Custom" v-model="cyclePeriod">Custom</MpRadio>
            </MpFlex>
          </MpFlex>

          <!-- Monthly-only: configurable top-up date + carry-over option -->
          <MpFlex v-if="cyclePeriod === 'Monthly'" direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Top-up date <span :class="required">*</span></MpText>
            <Pixel.div :class="css({ width: '264px' })">
              <MpSelect id="top-up-day" v-model="topUpDay" size="md" is-full-width>
                <option v-for="d in TOP_UP_DAYS" :key="d" :value="d">{{ ordinal(d) }} of every month</option>
                <option value="last">Last day of month</option>
              </MpSelect>
            </Pixel.div>
            <MpText size="body-small" color="text.secondary">{{ monthlyHelper }}</MpText>
            <MpFlex marginTop="1">
              <MpCheckbox id="carry-over" v-model:is-checked="carryOver">
                Carry over unused balance
                <template #description>Remaining balance from the previous month carries over to the next month instead of being reset.</template>
              </MpCheckbox>
            </MpFlex>
          </MpFlex>

          <MpFlex direction="column" gap="2">
            <MpText size="label" weight="semiBold" color="text.default">Effective date <span :class="required">*</span></MpText>
            <MpFlex align="center" gap="2">
              <div :class="dateField">
                <MpDatePicker id="eff-start" v-model="effectiveStart" format="D MMM YYYY" :is-clearable="false" :is-invalid="errDate" use-portal />
              </div>
              <MpText size="body" color="text.secondary">-</MpText>
              <div :class="dateField">
                <MpDatePicker id="eff-end" v-model="effectiveEnd" format="D MMM YYYY" :is-clearable="false" :is-invalid="errDate" use-portal />
              </div>
            </MpFlex>
            <MpText v-if="cyclePeriod === 'Custom'" size="body-small" color="text.secondary">Balance is available for the entire active period, without reset.</MpText>
          </MpFlex>
        </MpFlex>
      </MpFlex>

      <div :class="sectionDivider" />

      <!-- Package categories -->
      <MpFlex direction="column" gap="3">
        <MpFlex direction="column" gap="0">
          <MpText size="h3" weight="semiBold" color="text.default">Package categories</MpText>
          <MpText size="body-small" color="text.secondary">Select allowed categories for your employees to use their benefits.</MpText>
        </MpFlex>

        <div :class="treeCard">
          <div :class="treeHeader">
            <MpText size="label" weight="semiBold" color="text.default">Categories</MpText>
            <MpTextlink @click="selectAll">Select all</MpTextlink>
          </div>

          <!-- Scrollable body: each top-level category header sticks to the top
               of this box while its items scroll under it. -->
          <div :class="treeScroll">
            <!-- Each root is its own section, so its sticky header pins only while
                 that section is in view, then is pushed out by the next one. -->
            <div v-for="root in CATEGORIES" :key="root.id">
              <div :class="rootRow">
                <MpCheckbox
                  :id="`cat-${root.id}`"
                  :is-checked="isRootChecked(root)"
                  :is-indeterminate="isRootIndeterminate(root)"
                  @change="(v) => toggleRoot(root, v)"
                >{{ root.label }}</MpCheckbox>
              </div>

              <template v-for="g in root.groups" :key="g.id">
                <div :class="groupRow">
                  <MpCheckbox
                    :id="`cat-${g.id}`"
                    :is-checked="isGroupChecked(g)"
                    :is-indeterminate="isGroupIndeterminate(g)"
                    @change="(v) => toggleGroup(g, v)"
                  >{{ g.label }}</MpCheckbox>
                </div>
                <div v-for="item in g.items" :key="item.id" :class="itemRow">
                  <MpCheckbox
                    :id="`cat-${item.id}`"
                    :is-checked="isLeafChecked(item.id)"
                    @change="(v) => toggleLeaf(item.id, v)"
                  >{{ item.label }}</MpCheckbox>
                </div>
              </template>
            </div>
          </div>
        </div>
      </MpFlex>

      <div :class="sectionDivider" />

      <!-- Limit -->
      <MpFlex direction="column" gap="3">
        <MpFlex direction="column" gap="0">
          <MpText size="h3" weight="semiBold" color="text.default">Limit</MpText>
          <MpText size="body-small" color="text.secondary">Set employees limit balance.</MpText>
        </MpFlex>

        <MpFlex direction="column" gap="2">
          <MpText size="label" weight="semiBold" color="text.default">Overall balance <span :class="required">*</span></MpText>
          <Pixel.div :class="css({ width: '264px' })">
            <MpInputGroup size="md" is-full-width>
              <MpInputLeftAddon>Rp</MpInputLeftAddon>
              <MpInput
                v-model="overallBalanceDisplay"
                type="text"
                inputmode="numeric"
                placeholder="0"
                is-full-width
                :is-invalid="errBalance"
              />
            </MpInputGroup>
          </Pixel.div>
          <MpText v-if="errBalance" size="body-small" color="text.danger">Overall balance is required.</MpText>
          <MpFlex marginTop="1">
            <MpCheckbox id="classify-limit" v-model:is-checked="classifyByCategory">Classify limit by category</MpCheckbox>
          </MpFlex>
        </MpFlex>
      </MpFlex>

      <div :class="sectionDivider" />

      <!-- Reimbursement settings -->
      <MpFlex direction="column" gap="3">
        <MpFlex direction="column" gap="0">
          <MpText size="h3" weight="semiBold" color="text.default">Reimbursement settings</MpText>
          <MpText size="body-small" color="text.secondary">You can set the reimbursement only at package creation and cannot be changed afterward.</MpText>
        </MpFlex>

        <MpFlex direction="column" gap="2">
          <MpText size="label" weight="semiBold" color="text.default">Activate the reimbursement for this package</MpText>
          <MpFlex align="center" gap="6">
            <MpRadio id="reimb-yes" value="Yes" v-model="reimbursement">Yes</MpRadio>
            <MpRadio id="reimb-no" value="No" v-model="reimbursement">No</MpRadio>
          </MpFlex>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Step 2 — Arrange group (placeholder) ═════ -->
    <MpFlex v-else direction="column" gap="4" flex="1">
      <MpFlex direction="column" gap="1">
        <MpText size="h3" weight="semiBold" color="text.default">Arrange group</MpText>
        <MpText size="body-small" color="text.secondary">This step will be built next.</MpText>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Footer — sticky bottom, no top border ═════ -->
    <div :class="footer">
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
                Data you have filled will not be saved.
              </MpText>
              <MpFlex align="center" justify="flex-end" gap="2" marginTop="2">
                <MpButton variant="ghost" size="md" @click="leavePage">Leave page</MpButton>
              </MpFlex>
            </MpFlex>
          </MpPopoverContent>
        </MpPopover>
        <MpButton v-if="step < STEPS.length" variant="primary" size="md" @click="next">Continue</MpButton>
        <MpButton v-else variant="primary" size="md" @click="save">Save</MpButton>
      </MpFlex>
    </div>
  </MpFlex>
</template>
