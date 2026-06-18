<!-- DT 2.4 token map:
  Shell bg  → background.surface   (#F1F5F9 grey) ← NOT background.neutral
  Stage bg  → background.neutral   (#FFFFFF white) ← NOT background.surface
  Text h1   → text.default
  Border    → border.default

  Title bar reads route.meta:
    title         → string, H1 in the bar
    breadcrumb    → { label, to }[]  rendered as text links above the H1
    headerAction  → { label, to, variant? } rendered as a button on the right

  Pages can also inject 'setPageHeaderRight' to set a full MpPopover button
  in the title bar (used when dropdown actions are needed).
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpToastManager, css,
} from '@mekari/pixel3'

interface Crumb { label: string; to: string }
interface HeaderAction { label: string; to: string; variant?: string }
interface PageHeaderRightItem { label: string; isDanger?: boolean }
interface PageHeaderRight {
  label: string
  variant?: string
  rightIcon?: string
  items: PageHeaderRightItem[]
  onSelect: (label: string) => void
}
interface TitleBadge { label: string; type?: string }
interface PageHeader {
  title?: string
  badge?: TitleBadge | null
  headerRight?: PageHeaderRight | null
  breadcrumb?: Crumb[]
}

const route = useRoute()
const headerAction = computed(() => route.meta.headerAction as HeaderAction | undefined)

// Dynamic pages ([id].vue) register a title/badge/header-button stamped with the
// route they belong to. The layout only shows it while that route is active, so
// stale state from the previous page can never leak and there's no clear-vs-set
// race on client navigation (which the route.meta / onMounted approaches both lost,
// leaving "Page Title" until a manual refresh). Static pages keep using
// definePageMeta (route.meta) as the fallback.
const injected = ref<PageHeader & { path: string }>({ path: '' })
provide('setPageHeader', (config: PageHeader) => {
  injected.value = { ...config, path: route.fullPath }
})
const isInjectedCurrent = computed(() => injected.value.path === route.fullPath)

const pageTitle = computed(() =>
  (isInjectedCurrent.value && injected.value.title)
  || (route.meta.title as string)
  || 'Page Title')
const titleBadge = computed<TitleBadge | undefined>(() =>
  (isInjectedCurrent.value ? injected.value.badge : undefined)
  ?? (route.meta.titleBadge as TitleBadge | undefined))
const pageHeaderRight = computed<PageHeaderRight | null>(() =>
  isInjectedCurrent.value ? (injected.value.headerRight ?? null) : null)
const breadcrumb = computed<Crumb[]>(() =>
  (isInjectedCurrent.value && injected.value.breadcrumb)
  || (route.meta.breadcrumb as Crumb[] | undefined)
  || [])

const crumbLink = css({
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'md',
  color: 'text.link', textDecoration: 'none', cursor: 'pointer',
  _hover: { textDecoration: 'underline' },
})
</script>

<template>
  <MpFlex direction="column" height="100vh" background="background.surface">
    <AppHeader />

    <MpFlex flex="1" minHeight="0">
      <AppSidebar />

      <MpFlex as="main" direction="column" flex="1" minWidth="0">
        <!-- title bar 72px: no Pixel spacing token equivalent. -->
        <MpFlex align="center" justify="space-between" gap="4" height="72px" paddingInline="6">
          <MpFlex direction="column" gap="0.5" minWidth="0">
            <MpFlex v-if="breadcrumb.length" align="center" gap="1">
              <template v-for="(crumb, i) in breadcrumb" :key="crumb.to">
                <MpText v-if="i > 0" size="label" color="text.secondary">/</MpText>
                <NuxtLink :to="crumb.to" :class="crumbLink">{{ crumb.label }}</NuxtLink>
              </template>
            </MpFlex>
            <MpFlex align="center" gap="2" minWidth="0">
              <MpText as="h1" size="h1" weight="semiBold" color="text.default">
                {{ pageTitle }}
              </MpText>
              <MpBadge v-if="titleBadge" for="additionalInformation" size="md" :type="titleBadge.type ?? 'announcement'">{{ titleBadge.label }}</MpBadge>
            </MpFlex>
          </MpFlex>

          <!-- Custom popover button (set by page via inject) -->
          <MpPopover v-if="pageHeaderRight" is-close-on-select>
            <MpPopoverTrigger>
              <MpButton
                :variant="pageHeaderRight.variant ?? 'primary'"
                :right-icon="pageHeaderRight.rightIcon"
              >
                {{ pageHeaderRight.label }}
              </MpButton>
            </MpPopoverTrigger>
            <MpPopoverContent :class="css({ minW: '160px' })">
              <MpPopoverList>
                <MpPopoverListItem
                  v-for="item in pageHeaderRight.items"
                  :key="item.label"
                  @click="pageHeaderRight?.onSelect(item.label)"
                >
                  {{ item.label }}
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>

          <!-- Simple link button fallback -->
          <MpButton
            v-else-if="headerAction"
            :variant="headerAction.variant ?? 'secondary'"
            size="md"
            @click="navigateTo(headerAction.to)"
          >
            {{ headerAction.label }}
          </MpButton>
        </MpFlex>

        <!-- Stage: white sheet, rounded top-left, top + left border only. -->
        <MpFlex
          direction="column"
          flex="1"
          overflowY="auto"
          background="background.neutral"
          paddingInline="6"
          paddingBlock="6"
          borderTopLeftRadius="md"
          borderTop="1px solid"
          borderTopColor="border.default"
          borderLeft="1px solid"
          borderLeftColor="border.default"
        >
          <slot />
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- Toast host — required for toast() calls to render. Mounted once. -->
    <MpToastManager />
  </MpFlex>
</template>
