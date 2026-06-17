<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Exported files', navKey: 'settings' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Exported files
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for Exported files.
    </MpText>
  </MpFlex>
</template>
