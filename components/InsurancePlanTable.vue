<!--
  Mekari Flex — Insurance · Grouped plan table (Story 2)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9491:21862 · Pixel 3 DT 2.4
  Plans grouped by coverage period: the left meta columns are shared across the
  group (native rowspan), the right side lists each named plan. Built on the
  Pixel MpTable family — no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpText, MpFlex, MpTooltip, css,
} from '@mekari/pixel3'

export interface InsurancePlan { id: string; name: string }
export interface InsurancePlanGroup {
  id: string
  coveragePeriod: string
  benefitTypes: string[]
  provider: string
  broker: string
  status: 'Active' | 'Inactive' | 'Expired'
  updatedAt: string
  updatedBy: string
  plans: InsurancePlan[]
  // `inUse` = the coverage period is associated to at least one enrollment →
  // the whole insurance plan can't be deleted.
  inUse?: boolean
}

const props = defineProps<{ groups: InsurancePlanGroup[] }>()
const emit = defineEmits<{ delete: [group: InsurancePlanGroup] }>()

const expanded = ref<Record<string, boolean>>({})
const isOpen = (id: string, first: boolean) => expanded.value[id] ?? first
const toggle = (id: string, first: boolean) => { expanded.value[id] = !isOpen(id, first) }

// Match the approvals table: 8px (token 2) vertical padding, cells top-aligned
// so the shared (rowspan) meta cells line up against the stacked plan rows.
const cellPad = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })
const metaCell = cellPad
const periodToggle = css({
  display: 'inline-flex', alignItems: 'center', gap: '2',
  border: 'none', background: 'transparent', cursor: 'pointer',
  padding: '0', color: 'text.default',
})
const wPeriod = css({ width: '208px' })
// Plan-name rows below the first are `:last-child` (the Last-updated rowspan
// covers their right slot), so the bordered table strips their right border —
// force it back on so the column divider runs the full group height.
const planCell = css({
  paddingTop: '2', paddingBottom: '2', verticalAlign: 'top',
  borderRightWidth: '1px !important', borderRightColor: 'border.default !important',
})
// Benefit types as a real disc list — normal bullet size, black marker (text.default).
const benefitList = css({ listStyleType: 'disc', paddingLeft: '4', color: 'text.default' })
const actionCell = css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', width: '56px', textAlign: 'center' })
const iconBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  width: '32px', height: '32px', borderRadius: 'md', cursor: 'pointer',
  border: 'none', background: 'transparent', color: 'icon.secondary',
  _hover: { background: 'background.neutral.hovered', color: 'icon.danger' },
  _disabled: { cursor: 'not-allowed', color: 'icon.disabled', background: 'transparent' },
})
</script>

<template>
  <MpTableContainer>
    <MpTable :is-hoverable="false">
      <MpTableHead is-bordered>
        <MpTableRow>
          <MpTableCell as="th" :class="wPeriod">Coverage period</MpTableCell>
          <MpTableCell as="th">Benefit Type</MpTableCell>
          <MpTableCell as="th">Insurance provider</MpTableCell>
          <MpTableCell as="th">Insurance broker</MpTableCell>
          <MpTableCell as="th">Plan name</MpTableCell>
          <MpTableCell as="th">Last updated</MpTableCell>
          <MpTableCell as="th" :class="actionCell" />
        </MpTableRow>
      </MpTableHead>

      <MpTableBody is-bordered>
        <template v-for="(group, gi) in props.groups" :key="group.id">
          <!-- Collapsed: single summary row -->
          <MpTableRow v-if="!isOpen(group.id, gi === 0)">
            <MpTableCell as="td" :colspan="6" :class="cellPad">
              <button type="button" :class="periodToggle" @click="toggle(group.id, gi === 0)">
                <PxIcon name="caret-right" :size="16" color="icon.secondary" />
                <MpText size="body" color="text.default">{{ group.coveragePeriod }}</MpText>
              </button>
            </MpTableCell>
            <MpTableCell as="td" :class="actionCell">
              <MpTooltip :label="group.inUse ? 'Used in an enrollment — can\'t be deleted' : 'Delete insurance plan'" position="top">
                <button
                  type="button"
                  :class="iconBtn"
                  :disabled="group.inUse"
                  :aria-label="`Delete ${group.coveragePeriod}`"
                  @click="emit('delete', group)"
                >
                  <PxIcon name="delete" :size="20" :color="group.inUse ? 'icon.disabled' : 'icon.secondary'" />
                </button>
              </MpTooltip>
            </MpTableCell>
          </MpTableRow>

          <!-- Expanded: first plan row carries the shared meta cells (rowspan) -->
          <template v-else>
            <MpTableRow v-for="(plan, pi) in group.plans" :key="plan.id">
              <template v-if="pi === 0">
                <MpTableCell as="td" :rowspan="group.plans.length" :class="[metaCell, wPeriod]">
                  <button type="button" :class="periodToggle" @click="toggle(group.id, gi === 0)">
                    <PxIcon name="caret-down" :size="16" color="icon.secondary" />
                    <MpText size="body" color="text.default">{{ group.coveragePeriod }}</MpText>
                  </button>
                </MpTableCell>

                <MpTableCell as="td" :rowspan="group.plans.length" :class="metaCell">
                  <Pixel.ul v-if="group.benefitTypes.length" :class="benefitList">
                    <Pixel.li v-for="b in group.benefitTypes" :key="b">
                      <MpText size="body" color="text.default">{{ b }}</MpText>
                    </Pixel.li>
                  </Pixel.ul>
                  <MpText v-else size="body" color="text.secondary">—</MpText>
                </MpTableCell>

                <MpTableCell as="td" :rowspan="group.plans.length" :class="metaCell">
                  <MpText size="body" :color="group.provider ? 'text.default' : 'text.secondary'">
                    {{ group.provider || '—' }}
                  </MpText>
                </MpTableCell>

                <MpTableCell as="td" :rowspan="group.plans.length" :class="metaCell">
                  <MpText size="body" :color="group.broker ? 'text.default' : 'text.secondary'">
                    {{ group.broker || '—' }}
                  </MpText>
                </MpTableCell>
              </template>

              <MpTableCell as="td" :class="planCell">
                <MpText size="body" color="text.default">{{ plan.name }}</MpText>
              </MpTableCell>

              <MpTableCell v-if="pi === 0" as="td" :rowspan="group.plans.length" :class="metaCell">
                <MpFlex direction="column" gap="0">
                  <MpText size="body" color="text.default">{{ group.updatedAt }}</MpText>
                  <MpText size="body-small" color="text.secondary">by {{ group.updatedBy }}</MpText>
                </MpFlex>
              </MpTableCell>

              <!-- Delete the whole coverage period — only if not associated with any enrollment -->
              <MpTableCell v-if="pi === 0" as="td" :rowspan="group.plans.length" :class="actionCell">
                <MpTooltip :label="group.inUse ? 'Used in an enrollment — can\'t be deleted' : 'Delete insurance plan'" position="top">
                  <button
                    type="button"
                    :class="iconBtn"
                    :disabled="group.inUse"
                    :aria-label="`Delete ${group.coveragePeriod}`"
                    @click="emit('delete', group)"
                  >
                    <PxIcon name="delete" :size="20" :color="group.inUse ? 'icon.disabled' : 'icon.secondary'" />
                  </button>
                </MpTooltip>
              </MpTableCell>
            </MpTableRow>
          </template>
        </template>
      </MpTableBody>
    </MpTable>
  </MpTableContainer>
</template>
