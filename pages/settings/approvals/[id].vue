<!--
  Mekari Flex — Settings · Approval detail
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel,
  MpFlex, MpText, MpAvatar, MpButton,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Approval detail',
  navKey: 'settings',
  breadcrumb: [{ label: 'Approvals', to: '/settings/approvals' }],
})

const route = useRoute()
const setPageHeader = inject<(config: any) => void>('setPageHeader')

interface Approver {
  id: string
  type: 'employee' | 'position'
  name: string
  subtitle: string
}
interface ApprovalStep {
  id: string
  mode: 'everyone' | 'anyone'
  approvers: Approver[]
}
interface ApprovalRule {
  id: string
  name: string
  branches: string[]
  updatedAt: Date
  updatedBy: string
  steps: ApprovalStep[]
}

const mockRules: Record<string, ApprovalRule> = {
  '1': {
    id: '1',
    name: 'Approval untuk cabang Bandung',
    branches: ['Bandung', 'Cimahi'],
    updatedAt: new Date('2025-12-12T15:00:00'),
    updatedBy: 'Rizal Candra',
    steps: [
      {
        id: 's1',
        mode: 'everyone',
        approvers: [
          { id: 'a1', type: 'employee', name: 'Jessie Tan', subtitle: 'CP010 | Barista Head | Bar' },
          { id: 'a2', type: 'employee', name: 'Cinta Ayu', subtitle: 'CP012 | Head of Front-house | Bar' },
        ],
      },
      {
        id: 's2',
        mode: 'anyone',
        approvers: [
          { id: 'a3', type: 'employee', name: 'Rizal Candra', subtitle: 'CP001 | CEO | Management' },
          { id: 'a4', type: 'employee', name: 'Ali Imran', subtitle: 'CP011 | HR Admin | HR' },
        ],
      },
    ],
  },
}

const rule = computed(() => mockRules[route.params.id as string] ?? null)

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}
function formatTime(d: Date) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(d)
}

function deleteRule() {
  toast.notify({
    id: 'approval-deleted',
    position: 'top-center',
    variant: 'success',
    title: 'Approval deleted',
  })
  navigateTo('/settings/approvals')
}

watchEffect(() => {
  if (rule.value && setPageHeader) {
    setPageHeader({
      title: rule.value.name,
      headerRight: {
        label: 'Actions',
        variant: 'primary',
        rightIcon: 'caret-down',
        items: [
          { label: 'Edit' },
          { label: 'Delete' },
        ],
        onSelect: (label: string) => {
          if (label === 'Edit') navigateTo(`/settings/approvals/${rule.value!.id}/edit`)
          if (label === 'Delete') deleteRule()
        },
      },
    })
  }
})

const stepBadge = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, w: '24px', h: '24px', borderRadius: 'full',
  bg: 'background.brand.selected',
})
</script>

<template>
  <MpFlex v-if="rule" direction="column" gap="6" :class="css({ maxWidth: '552px' })">

    <!-- ─── Key-value metadata rows ─── -->
    <MpFlex direction="column">
      <!-- Branch row -->
      <MpFlex gap="6">
        <MpFlex direction="column" :class="css({ w: '168px', flexShrink: 0 })">
          <MpFlex py="2">
            <MpText size="body" color="text.secondary">Branch</MpText>
          </MpFlex>
        </MpFlex>
        <MpFlex flex="1" minWidth="0">
          <MpFlex py="2">
            <Pixel.ul :class="css({ paddingLeft: '5', listStyleType: 'disc' })">
              <Pixel.li v-for="branch in rule.branches" :key="branch">
                <MpText size="body" color="text.default">{{ branch }}</MpText>
              </Pixel.li>
            </Pixel.ul>
          </MpFlex>
        </MpFlex>
      </MpFlex>

      <!-- Last updated row -->
      <MpFlex gap="6">
        <MpFlex direction="column" :class="css({ w: '168px', flexShrink: 0 })">
          <MpFlex py="2">
            <MpText size="body" color="text.secondary">Last updated</MpText>
          </MpFlex>
        </MpFlex>
        <MpFlex flex="1" minWidth="0">
          <MpFlex direction="column" gap="1" py="2">
            <MpText size="body" color="text.default">
              {{ formatDate(rule.updatedAt) }}, {{ formatTime(rule.updatedAt) }}
            </MpText>
            <MpText size="body-small" color="text.secondary">{{ rule.updatedBy }}</MpText>
          </MpFlex>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- ─── Approval steps section ─── -->
    <MpFlex direction="column">
      <!-- Section header -->
      <MpFlex direction="column" :class="css({ pb: '3' })">
        <MpText size="h2" weight="semiBold" color="text.default">Approval steps</MpText>
      </MpFlex>

      <!-- Steps list -->
      <MpFlex direction="column" gap="5">
        <MpFlex
          v-for="(step, si) in rule.steps"
          :key="step.id"
          direction="column"
        >
          <!-- Step header -->
          <MpFlex align="center" gap="3" :class="css({ pb: '3' })">
            <Pixel.div :class="stepBadge">
              <MpText size="body" color="text.default">{{ si + 1 }}</MpText>
            </Pixel.div>
            <MpText size="body" weight="semiBold" color="text.default">Approval step {{ si + 1 }}</MpText>
          </MpFlex>

          <!-- Indented content -->
          <MpFlex direction="column" gap="2" :class="css({ pl: '36px' })">

            <!-- Mode as section title + caption -->
            <MpFlex direction="column">
              <MpText size="body" weight="semiBold" color="text.default">
                {{ step.mode === 'everyone' ? 'Everyone must approve' : 'Anyone can approve' }}
              </MpText>
              <MpText size="body-small" color="text.secondary">
                {{ step.mode === 'everyone'
                  ? 'All approvers must approve before the request moves forward.'
                  : 'Only one of the approvers listed below needs to approve.' }}
              </MpText>
            </MpFlex>

            <!-- Approver list -->
            <MpFlex direction="column" gap="1">
              <MpFlex
                v-for="approver in step.approvers"
                :key="approver.id"
                align="center"
                gap="3"
                py="2"
              >
                <MpAvatar :id="`avatar-${approver.id}`" :name="approver.name" size="lg" />
                <MpFlex direction="column" gap="1">
                  <MpText size="body" color="text.default">{{ approver.name }}</MpText>
                  <MpText size="body-small" color="text.secondary">{{ approver.subtitle }}</MpText>
                </MpFlex>
              </MpFlex>
            </MpFlex>
          </MpFlex>
        </MpFlex>
      </MpFlex>
    </MpFlex>

  </MpFlex>

  <!-- Rule not found -->
  <MpFlex v-else direction="column" align="center" :class="css({ py: '16', gap: '3' })">
    <MpText size="heading-small" color="text.default">Approval not found</MpText>
    <MpButton variant="secondary" as="NuxtLink" to="/settings/approvals">Back to approvals</MpButton>
  </MpFlex>
</template>
