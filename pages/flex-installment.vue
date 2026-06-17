<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

definePageMeta({ title: 'Flex installment', navKey: 'flex-installment' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <MpText as="h2" size="h3" weight="semiBold" color="text.default">
      Flex installment
    </MpText>
    <MpText size="body" color="text.secondary">
      This page is reserved for Flex installment.
    </MpText>
  </MpFlex>
</template>
