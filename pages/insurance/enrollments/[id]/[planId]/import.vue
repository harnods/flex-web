<!--
  Mekari Flex — Insurance · Enrollment · Plan · Import employees
  Reached from the plan detail "Add employee ▾ → Upload from CSV". Same flow as
  importing insurance plans: download template → upload → submit → Import history.
  Pixel 3 DT 2.4 only.
-->
<script setup lang="ts">
definePageMeta({ navKey: 'insurance' })

const ENROLLMENTS: Record<string, string> = {
  'e-2026': 'FY2026 Rawat Inap',
  'e-dental': 'Dental Add-on 2026',
  'e-2025': '2025 Health Enrollment',
}
const PLANS: Record<string, string> = {
  ri2500: 'RI 2500', ri2000: 'RI 2000', ri1500: 'RI 1500', ri1000: 'RI 1000', ri500: 'RI 500',
  'dental-basic': 'Dental Basic', 'dental-plus': 'Dental Plus',
}

const route = useRoute()
const enrollmentId = computed(() => route.params.id as string)
const planId = computed(() => route.params.planId as string)
const enrollmentName = computed(() => ENROLLMENTS[enrollmentId.value] ?? 'Enrollment')
const planName = computed(() => PLANS[planId.value] ?? (planId.value as string))
const planDetailPath = computed(() => `/insurance/enrollments/${enrollmentId.value}/${planId.value}`)

const setPageHeader = inject<(c: unknown) => void>('setPageHeader')
watchEffect(() => {
  setPageHeader?.({
    title: 'Import employee',
    breadcrumb: [
      { label: 'Enrollments', to: '/insurance/enrollments' },
      { label: enrollmentName.value, to: `/insurance/enrollments/${enrollmentId.value}` },
      { label: planName.value, to: planDetailPath.value },
    ],
    headerRight: null,
  })
})
</script>

<template>
  <InsuranceImportFlow
    import-type="employee"
    :back-path="planDetailPath"
    :template-name="`${planName}-employees-template.xlsx`"
    :step1-help="`Fill in the template with the employees to enroll in ${planName}.`"
  />
</template>
