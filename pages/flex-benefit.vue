<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Flex benefit', navKey: 'flex-benefit' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Flex benefit
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for Flex benefit.
    </MpText>
  </MpFlex>
</template>
