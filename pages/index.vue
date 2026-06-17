<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Dashboard', navKey: 'dashboard' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Welcome to Mekari Flex
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for the Dashboard overview.
    </MpText>
  </MpFlex>
</template>
