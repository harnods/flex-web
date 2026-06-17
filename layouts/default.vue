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
  MpFlex, MpText, MpButton,
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

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || 'Page Title')
const breadcrumb = computed(() => (route.meta.breadcrumb as Crumb[] | undefined) ?? [])
const headerAction = computed(() => route.meta.headerAction as HeaderAction | undefined)

// Pages can inject this to set a custom popover button in the title bar
const pageHeaderRight = ref<PageHeaderRight | null>(null)
provide('setPageHeaderRight', (config: PageHeaderRight | null) => {
  pageHeaderRight.value = config
})

// Clear custom header right when route changes
watch(() => route.fullPath, () => { pageHeaderRight.value = null })

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
              <NuxtLink
                v-for="crumb in breadcrumb"
                :key="crumb.to"
                :to="crumb.to"
                :class="crumbLink"
              >
                {{ crumb.label }}
              </NuxtLink>
            </MpFlex>
            <MpText as="h1" size="h1" weight="semiBold" color="text.default">
              {{ pageTitle }}
            </MpText>
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
