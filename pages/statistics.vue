<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Statistics', navKey: 'statistics' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Statistics
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for Statistics.
    </MpText>
  </MpFlex>
</template>
