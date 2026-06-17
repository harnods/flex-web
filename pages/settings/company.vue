<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Company', navKey: 'settings' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Company
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for Company settings.
    </MpText>
  </MpFlex>
</template>
