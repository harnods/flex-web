<!--
  Mekari Flex — Flex benefit · Packages list
  For now this page shows the empty state only (3D illustration), mirroring the
  Insurance · Enrollments empty state pattern.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import { MpFlex } from '@mekari/pixel3'

definePageMeta({
  title: 'Packages',
  navKey: 'flex-benefit',
  headerAction: { label: 'New package', to: '/flex-benefit/packages/create', variant: 'primary' },
})
</script>

<template>
  <MpFlex direction="column" gap="6">
    <!-- 3D illustration empty state (same component/asset as Insurance · Enrollments) -->
    <InsuranceStateEmpty
      image="/illustrations/enrollments-empty.png"
      title="No packages yet"
      description="Packages will appear here once you create one."
    />
  </MpFlex>
</template>
