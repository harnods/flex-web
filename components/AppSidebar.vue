<script setup lang="ts">
import { MpFlex, MpText, MpIcon, css, cx, token } from '@mekari/pixel3'

interface NavChild { label: string; path: string; dividerBefore?: boolean }
interface NavItem {
  icon: string
  label: string
  path?: string
  children?: NavChild[]
}

// Group 1 — primary
const group1: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'performance', label: 'Statistics', path: '/statistics' },
  { icon: 'employee', label: 'Employees', path: '/employees' },
]

// Insurance has no level-2 submenu until at least one plan exists — you can't
// configure enrollments without a plan, so first-run shows a flat menu item.
// `coachmarkOpen` pulses the Enrollments item on the very first import.
const route = useRoute()
const scenario = useState<'first-run' | 'coachmark' | 'has-plans'>('insurance-scenario', () => 'first-run')
const coachmarkOpen = useState('insurance-coachmark-open', () => false)
// Enrollment pages only exist once plans do — always show the submenu there,
// even if the demo scenario resets to first-run on a direct load/reload.
const hasInsurancePlans = computed(() =>
  scenario.value !== 'first-run'
  || route.path.startsWith('/insurance/enrollments')
  || route.path.startsWith('/insurance/plans/import-history'),
)
// Being on an enrollment or import-history route proves plans exist, so promote
// the scenario out of first-run — that way clicking "Insurance plans" lands on
// the plans table, never the first-run page.
watchEffect(() => {
  if (scenario.value === 'first-run'
    && (route.path.startsWith('/insurance/enrollments') || route.path.startsWith('/insurance/plans/import-history'))) {
    scenario.value = 'has-plans'
  }
})

// Group 2 — products (divider before this group)
const group2 = computed<NavItem[]>(() => [
  { icon: 'wallet', label: 'Accessible salary', path: '/accessible-salary' },
  { icon: 'plans', label: 'Flex benefit', path: '/flex-benefit' },
  { icon: 'loan', label: 'Flex installment', path: '/flex-installment' },
  hasInsurancePlans.value
    ? {
        icon: 'protection', label: 'Insurance',
        children: [
          { label: 'Enrollments', path: '/insurance/enrollments' },
          { label: 'Insurance plans', path: '/insurance/plans' },
          { label: 'Import history', path: '/insurance/plans/import-history', dividerBefore: true },
        ],
      }
    : { icon: 'protection', label: 'Insurance', path: '/insurance/plans' },
])

// Group 3 — settings (divider between Insurance and Settings)
const group3: NavItem[] = [
  {
    icon: 'settings', label: 'Settings',
    children: [
      { label: 'Company', path: '/settings/company' },
      { label: 'Balance reminder', path: '/settings/balance-reminder' },
      { label: 'Imported files', path: '/settings/imported-files' },
      { label: 'Exported files', path: '/settings/exported-files' },
      { label: 'Approvals', path: '/settings/approvals' },
    ],
  },
]

const allGroups = computed(() => [group1, group2.value, group3])
const allItems = computed(() => [group1, group2.value, group3].flat())

const pathMatches = (p: string) => route.path === p || route.path.startsWith(p + '/')
// A child is active only if it's the most specific (longest path) sibling the
// route matches — so "Insurance plans" (/insurance/plans) doesn't stay lit while
// on the nested "Import history" (/insurance/plans/import-history) route.
const isChildActive = (child: NavChild, siblings: NavChild[] = []) =>
  pathMatches(child.path)
  && !siblings.some(s => s.path !== child.path && s.path.length > child.path.length && pathMatches(s.path))
const hasActiveChild = (item: NavItem) =>
  !!item.children?.some(c => pathMatches(c.path))
const isItemActive = (item: NavItem) =>
  item.path
    ? (route.path === item.path || route.path.startsWith(item.path + '/'))
    : hasActiveChild(item)
const itemTarget = (item: NavItem) => item.path ?? item.children?.[0]?.path ?? '/'

const activeParent = computed<NavItem | undefined>(() => allItems.value.find(hasActiveChild))
const isSubmenuMode = computed(() => !!activeParent.value)

const isMainNavCollapsed = useState('sidebar-main-collapsed', () => false)
watch(isSubmenuMode, (open) => { if (open) isMainNavCollapsed.value = true }, { immediate: true })

const isPanelCollapsed = useState('sidebar-panel-collapsed', () => false)

const mode = computed<'full' | 'rail' | 'submenu'>(() =>
  activeParent.value ? 'submenu' : (isMainNavCollapsed.value ? 'rail' : 'full'),
)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const shortcutLabel = isMac ? '⌘B' : 'Ctrl+B'
const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    isMainNavCollapsed.value = !isMainNavCollapsed.value
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const panelStyle = computed(() => ({
  width: isPanelCollapsed.value ? '16px' : '208px',
  marginRight: isPanelCollapsed.value ? '16px' : '8px',
  borderColor: isPanelCollapsed.value ? token.var('colors.border.default') : 'transparent',
  boxShadow: isPanelCollapsed.value
    ? '6px 0 15px -3px rgba(0, 0, 0, 0.10) inset, 4px 0 6px -2px rgba(0, 0, 0, 0.05) inset'
    : 'none',
}))

/* ---------- styles ---------- */
const rootFull = css({ display: 'flex', flexDirection: 'column', w: '216px', h: '100%', flexShrink: 0 })
const rootRailOrSubmenu = css({ display: 'flex', flexDirection: 'row', h: '100%', flexShrink: 0, position: 'relative' })

const railBoxBase = { display: 'flex', flexDirection: 'column', w: '56px', h: '100%', flexShrink: 0 } as const
const railBoxSubmenu = css({
  // #E7EDF5 — dedicated nav-parent token for the collapsed level-1 rail when a
  // level-2 submenu is open. Rail-only (no submenu) uses transparent (railBoxOnly).
  ...railBoxBase, bg: 'background.nav.parent', position: 'relative', zIndex: 1,
  borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: 'border.default',
})
const railBoxOnly = css({ ...railBoxBase, bg: 'transparent' })

const panelBase = css({
  display: 'flex', flexDirection: 'column', h: '100%', flexShrink: 0,
  overflow: 'hidden', boxSizing: 'border-box',
  borderLeftWidth: '1px', borderRightWidth: '1px', borderStyle: 'solid',
  transitionProperty: 'width, margin-right, border-color, box-shadow',
  transitionDuration: '200ms', transitionTimingFunction: 'ease',
})
const panelInner = css({
  display: 'flex', flexDirection: 'column', w: '208px', h: '100%', flexShrink: 0,
  transition: 'opacity 150ms ease',
})

const halfCircleExpand = css({
  position: 'absolute', bottom: '5', left: '72px', zIndex: 30,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  w: '24px', h: '36px', bg: 'background.neutral', color: 'text.secondary',
  borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px',
  borderStyle: 'solid', borderColor: 'border.default',
  borderTopRightRadius: 'full', borderBottomRightRadius: 'full',
  boxShadow: 'sm', cursor: 'pointer',
  transition: 'opacity 150ms ease',
  _hover: { bg: 'background.neutral.hovered' },
})

const navGroup = css({
  display: 'flex', flexDirection: 'column', gap: '0.5', py: '2', px: '2',
})
const groupDivider = css({ marginInline: '3', height: '1px', background: 'border.default' })
const submenuDivider = css({ marginInline: '2', marginBlock: '1', height: '1px', background: 'border.default' })

const itemBase = {
  display: 'flex', alignItems: 'center', gap: '2', w: 'full', height: '36px', px: '3',
  border: 'none', borderRadius: 'md', cursor: 'pointer', textAlign: 'left',
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
} as const
const itemDefault = css({ ...itemBase, bg: 'transparent', color: 'text.default', fontWeight: 'regular', _hover: { bg: 'background.neutral.hovered' } })
const itemActive = css({ ...itemBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })
const itemLabel = css({ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

const railGroup = css({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5', py: '2', w: 'full',
})
const railBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', w: '40px', h: '36px',
  border: 'none', borderRadius: 'md', cursor: 'pointer', flexShrink: 0,
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
} as const
const railDefault = css({ ...railBase, bg: 'transparent', color: 'text.default', _hover: { bg: 'background.neutral.hovered' } })
const railActive = css({ ...railBase, bg: 'background.brand.selected', _hover: { bg: 'background.brand.selected' } })
const railActiveParent = css({ ...railBase, bg: 'background.nav.parent', _hover: { bg: 'background.nav.parent' } })

const childBase = {
  display: 'flex', alignItems: 'center', w: 'full', height: '36px', px: '3',
  border: 'none', cursor: 'pointer', borderRadius: 'md',
  textDecoration: 'none',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'md',
  transition: 'background-color 120ms ease',
} as const
const childDefault = css({ ...childBase, bg: 'transparent', color: 'text.default', fontWeight: 'regular', _hover: { bg: 'background.surface' } })
const childActive = css({ ...childBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })

const ghostBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', w: '36px', h: '36px',
  border: 'none', bg: 'transparent', borderRadius: 'md', cursor: 'pointer', flexShrink: 0, color: 'text.secondary',
  transition: 'background-color 120ms ease', _hover: { bg: 'background.neutral.hovered' },
})

const sectionTitle = css({
  display: 'flex', alignItems: 'center', h: '36px', mt: '4', px: '4',
  fontSize: 'sm', fontWeight: 'semiBold', letterSpacing: 'wider',
  textTransform: 'uppercase', color: 'text.link', whiteSpace: 'nowrap',
})

const itemClassFull = (item: NavItem) => cx(isItemActive(item) ? itemActive : itemDefault)
const itemClassRail = (item: NavItem) => {
  if (!isItemActive(item)) return railDefault
  return item.children?.length ? railActiveParent : railActive
}
</script>

<template>
  <aside :class="mode === 'full' ? rootFull : rootRailOrSubmenu">
    <!-- ============ FULL MODE ============ -->
    <template v-if="mode === 'full'">
      <MpFlex as="nav" direction="column" flex="1" overflowY="auto" overflowX="hidden" minHeight="0" aria-label="Main">
        <template v-for="(group, gi) in allGroups" :key="gi">
          <div v-if="gi > 0" :class="groupDivider" />
          <div :class="navGroup" :style="gi === 0 ? { paddingTop: '16px' } : {}">
            <NuxtLink
              v-for="item in group"
              :key="item.label"
              :to="itemTarget(item)"
              :class="itemClassFull(item)"
              :aria-current="isItemActive(item) ? 'page' : undefined"
            >
              <PxIcon :name="item.icon" :size="20" :variant="isItemActive(item) ? 'fill' : 'outline'" :color="isItemActive(item) ? 'icon.brand' : ''" />
              <span :class="itemLabel">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </template>
      </MpFlex>

      <MpFlex align="center" gap="0.5" paddingInline="3" height="68px" borderTop="1px solid" borderTopColor="border.default" flexShrink="0">
        <button type="button" :class="ghostBtn"
          :aria-label="`Collapse sidebar (${shortcutLabel})`"
          :title="`Collapse sidebar · ${shortcutLabel}`"
          @click="isMainNavCollapsed = true"
        >
          <MpIcon name="chevrons-left" />
        </button>
        <MpText as="span" size="body-small" color="text.secondary">Company ID : 102938</MpText>
      </MpFlex>
    </template>

    <!-- ============ RAIL + SUBMENU ============ -->
    <template v-else>
      <div :class="mode === 'submenu' ? railBoxSubmenu : railBoxOnly">
        <MpFlex direction="column" flex="1" align="center" paddingInline="1" overflowY="auto" overflowX="hidden" minHeight="0">
          <template v-for="(group, gi) in allGroups" :key="gi">
            <div v-if="gi > 0" :class="groupDivider" style="width: 40px" />
            <div :class="railGroup" :style="gi === 0 ? { paddingTop: '16px' } : {}">
              <NuxtLink
                v-for="item in group"
                :key="item.label"
                :to="itemTarget(item)"
                :class="itemClassRail(item)"
                :aria-label="item.label"
                :title="item.label"
              >
                <PxIcon :name="item.icon" :size="20" :variant="isItemActive(item) ? 'fill' : 'outline'" :color="isItemActive(item) ? 'icon.brand' : ''" />
              </NuxtLink>
            </div>
          </template>
        </MpFlex>

        <MpFlex v-if="mode === 'rail'" align="center" justify="center" height="68px" flexShrink="0" borderTop="1px solid" borderTopColor="border.default">
          <button type="button" :class="ghostBtn"
            :aria-label="`Expand sidebar (${shortcutLabel})`"
            :title="`Expand sidebar · ${shortcutLabel}`"
            @click="isMainNavCollapsed = false"
          >
            <MpIcon name="chevrons-right" />
          </button>
        </MpFlex>
      </div>

      <div v-if="mode === 'submenu'" :class="panelBase" :style="panelStyle">
        <div :class="panelInner" :style="{ opacity: isPanelCollapsed ? 0 : 1, pointerEvents: isPanelCollapsed ? 'none' : 'auto' }">
          <div :class="sectionTitle">{{ activeParent?.label }}</div>
          <MpFlex direction="column" gap="0.5" flex="1" paddingInline="2" overflowY="auto" minHeight="0">
            <template v-for="child in activeParent?.children" :key="child.path">
              <div v-if="child.dividerBefore" :class="submenuDivider" />
              <NuxtLink
                :to="child.path"
                :class="isChildActive(child, activeParent?.children) ? childActive : childDefault"
                :aria-current="isChildActive(child, activeParent?.children) ? 'page' : undefined"
              >
                <span :class="css({ flex: '1 1 auto' })">{{ child.label }}</span>
                <span
                  v-if="coachmarkOpen && child.path === '/insurance/enrollments'"
                  class="flex-pulse-dot"
                  aria-hidden="true"
                />
              </NuxtLink>
            </template>
          </MpFlex>
          <MpFlex align="center" justify="flex-end" height="68px" paddingInline="3" flexShrink="0">
            <button type="button" :class="ghostBtn" aria-label="Collapse submenu" @click="isPanelCollapsed = true">
              <MpIcon name="chevrons-left" />
            </button>
          </MpFlex>
        </div>
      </div>

      <button
        v-if="mode === 'submenu'"
        type="button"
        :class="halfCircleExpand"
        :style="{ opacity: isPanelCollapsed ? 1 : 0, pointerEvents: isPanelCollapsed ? 'auto' : 'none' }"
        aria-label="Expand submenu"
        @click="isPanelCollapsed = false"
      >
        <MpIcon name="chevrons-right" size="sm" />
      </button>
    </template>
  </aside>
</template>
