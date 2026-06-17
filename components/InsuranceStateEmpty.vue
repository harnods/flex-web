<!--
  Mekari Flex — Insurance · Reusable centered empty state
  Source: Figma 9491:18991 (no-plans), 9493:116631 (search), 9493:116633 (filter)
  Pixel 3 DT 2.4 · no MpEmptyState ships in this build — composed from primitives.
  ASSET NOTE: Figma uses a 3D illustration; placeholder = tinted icon tile.
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, css } from '@mekari/pixel3'

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
    actionLabel?: string
  }>(),
  { description: '', icon: 'protection', actionLabel: '' },
)

const emit = defineEmits<{ action: [] }>()

const illustration = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '96px', height: '96px', borderRadius: 'full',
  background: 'background.brand.selected', color: 'icon.brand',
})
</script>

<template>
  <MpFlex direction="column" align="center" justify="center" gap="2" paddingBlock="20">
    <MpFlex :class="illustration" marginBottom="2" aria-hidden="true">
      <PxIcon :name="icon" :size="32" variant="duotone" color="icon.brand" />
    </MpFlex>
    <MpText size="label" weight="semiBold" color="text.default" align="center">{{ title }}</MpText>
    <MpText v-if="description" size="body-small" color="text.secondary" align="center">
      {{ description }}
    </MpText>
    <MpFlex v-if="actionLabel" marginTop="2">
      <MpButton variant="primary" size="md" @click="emit('action')">{{ actionLabel }}</MpButton>
    </MpFlex>
  </MpFlex>
</template>
