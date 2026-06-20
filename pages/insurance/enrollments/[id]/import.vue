<!--
  Mekari Flex — Insurance · Enrollment · Import employees (enrollment-level)
  Reached from the enrollment detail "Add employee ▾ → Upload from CSV". The
  template includes a plan column so each employee can be assigned a plan.
  Pixel 3 DT 2.4 only.
-->
<script setup lang="ts">
definePageMeta({ navKey: 'insurance' })

const ENROLLMENTS: Record<string, string> = {
  'e-2026': 'FY2026 Rawat Inap',
  'e-dental': 'Dental Add-on 2026',
  'e-2025': '2025 Health Enrollment',
}

const route = useRoute()
const enrollmentId = computed(() => route.params.id as string)
const enrollmentName = computed(() => ENROLLMENTS[enrollmentId.value] ?? 'Enrollment')
const enrollmentDetailPath = computed(() => `/insurance/enrollments/${enrollmentId.value}`)

const setPageHeader = inject<(c: unknown) => void>('setPageHeader')
watchEffect(() => {
  setPageHeader?.({
    title: 'Import employee',
    breadcrumb: [
      { label: 'Enrollments', to: '/insurance/enrollments' },
      { label: enrollmentName.value, to: enrollmentDetailPath.value },
    ],
    headerRight: null,
  })
})
</script>

<template>
  <InsuranceImportFlow
    import-type="employee"
    :back-path="enrollmentDetailPath"
    template-name="employees-template.xlsx"
    step1-help="Fill in the template with the employees and the plan to enroll them in."
  />
</template>
