<!--
  Mekari Flex — Settings · Approval list
  Lists all approval rules. Pixel 3 DT 2.4 only — no <style>, no raw CSS.
-->
<script setup lang="ts">
import {
  Pixel,
  MpFlex, MpText, MpTextlink, MpBadge, MpButton, MpIcon, MpTooltip,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpInputGroup, MpInputLeftAddon, MpInput, MpSkeleton,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Approvals',
  navKey: 'settings',
  headerAction: { label: 'Create approval', to: '/settings/approvals/create', variant: 'primary' },
})

interface ApprovalRule {
  id: string
  name: string
  isDefault?: boolean
  branches: string[]
  hasMoreBranches?: boolean
  approval: string
  updatedAt: Date
  updatedBy: string
}

const allRules = ref<ApprovalRule[]>([
  {
    id: '1',
    name: 'Approval cabang Bandung',
    branches: ['Bandung', 'Cimahi'],
    approval: '2 steps',
    updatedAt: new Date('2026-05-28T09:15:00'),
    updatedBy: 'Budi Santoso',
  },
])

const isLoading = ref(false)
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const perPageOptions = [10, 25, 50, 100]
const showEmptyState = ref(false)

const sourceRules = computed(() => showEmptyState.value ? [] : allRules.value)

const filteredRules = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? sourceRules.value.filter(r => r.name.toLowerCase().includes(q)) : sourceRules.value
})

const isEmpty = computed(() => !isLoading.value && sourceRules.value.length === 0)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRules.value.length / perPage.value)))

const paginatedRules = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredRules.value.slice(start, start + perPage.value)
})

watch(search, () => { currentPage.value = 1 })
watch(perPage, () => { currentPage.value = 1 })

const rangeStart = computed(() => Math.min((currentPage.value - 1) * perPage.value + 1, filteredRules.value.length))
const rangeEnd = computed(() => Math.min(currentPage.value * perPage.value, filteredRules.value.length))

function setPerPage(n: number) { perPage.value = n }

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}
function formatTime(d: Date) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(d)
}

const btnCell = css({ paddingTop: '2 !important', paddingBottom: '2 !important' })
</script>

<template>
  <MpFlex direction="column" gap="4">
    <!-- Filter bar: hidden on first-run empty state -->
    <MpFlex v-if="!isEmpty" justify="space-between" align="center">
      <MpFlex align="center" gap="2" />
      <Pixel.div :class="css({ width: '240px', flexShrink: 0 })">
        <MpInputGroup size="md" is-full-width>
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.secondary" />
          </MpInputLeftAddon>
          <MpInput v-model="search" placeholder="Search approval name..." is-clearable is-full-width />
        </MpInputGroup>
      </Pixel.div>
    </MpFlex>

    <!-- Loading skeletons -->
    <MpFlex v-if="isLoading" direction="column" gap="2">
      <MpSkeleton v-for="n in 5" :key="n" width="100%" height="56px" borderRadius="md" />
    </MpFlex>

    <!-- Empty state: no data at all -->
    <MpFlex v-else-if="isEmpty" direction="column" align="center" justify="center" :class="css({ py: '16', gap: '3' })">
      <Pixel.img src="/illustrations/empty-approvals.png" alt="" :class="css({ h: '240px', w: 'auto', objectFit: 'contain' })" />
      <MpFlex direction="column" align="center" gap="1">
        <MpText size="heading-small" color="text.default">Approvals will appear here</MpText>
        <MpText size="body" color="text.secondary">Create an approval from the <MpText as="span" size="body" weight="semibold">Create approval</MpText> button.</MpText>
      </MpFlex>
      <MpButton variant="secondary" as="NuxtLink" to="/settings/approvals/create">Create approval</MpButton>
    </MpFlex>

    <!-- Table + Pagination: dibungkus bersama agar tidak ada gap di antara keduanya -->
    <Pixel.div v-else>
      <MpTableContainer>
        <MpTable>
          <MpTableHead>
            <MpTableRow>
              <MpTableCell as="th" scope="col">Approval name</MpTableCell>
              <MpTableCell as="th" scope="col">Branch</MpTableCell>
              <MpTableCell as="th" scope="col">Approval</MpTableCell>
              <MpTableCell as="th" scope="col">Last updated</MpTableCell>
              <MpTableCell as="th" scope="col" />
            </MpTableRow>
          </MpTableHead>

          <MpTableBody>
            <template v-if="paginatedRules.length > 0">
              <MpTableRow v-for="rule in paginatedRules" :key="rule.id">
                <!-- Approval name + Default badge -->
                <MpTableCell as="td" scope="row" :class="css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })">
                  <MpFlex align="center" gap="2" wrap="wrap">
                    <MpTextlink @click="navigateTo(`/settings/approvals/${rule.id}`)">
                      {{ rule.name }}
                    </MpTextlink>
                    <MpBadge v-if="rule.isDefault" for="tableStatus" type="announcement" size="sm">
                      Default
                    </MpBadge>
                  </MpFlex>
                </MpTableCell>

                <!-- Branch: dot list + View more -->
                <MpTableCell as="td" scope="row" :class="css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })">
                  <Pixel.ul :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
                    <Pixel.li v-for="branch in rule.branches" :key="branch">
                      <MpText size="body" color="text.default">{{ branch }}</MpText>
                    </Pixel.li>
                  </Pixel.ul>
                  <MpTextlink v-if="rule.hasMoreBranches" variant="primary" :class="css({ marginTop: '1' })">
                    View more
                  </MpTextlink>
                </MpTableCell>

                <!-- Approval -->
                <MpTableCell as="td" scope="row" :class="css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })">
                  <MpText size="body" color="text.default">{{ rule.approval }}</MpText>
                </MpTableCell>

                <!-- Last updated -->
                <MpTableCell as="td" scope="row" :class="css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top' })">
                  <MpFlex direction="column" gap="0">
                    <MpText size="body" color="text.default">
                      {{ formatDate(rule.updatedAt) }}, {{ formatTime(rule.updatedAt) }}
                    </MpText>
                    <MpText size="body-small" color="text.secondary">
                      by {{ rule.updatedBy }}
                    </MpText>
                  </MpFlex>
                </MpTableCell>

                <!-- Actions -->
                <MpTableCell as="td" scope="row" :class="css({ paddingTop: '2', paddingBottom: '2', verticalAlign: 'top', textAlign: 'right', width: '120px' })">
                  <MpPopover use-portal placement="bottom-end">
                    <MpPopoverTrigger>
                      <MpButton variant="secondary" right-icon="caret-down">Actions</MpButton>
                    </MpPopoverTrigger>
                    <MpPopoverContent>
                      <MpPopoverList>
                        <MpPopoverListItem @click="navigateTo(`/settings/approvals/${rule.id}`)">View details</MpPopoverListItem>
                        <MpPopoverListItem @click="navigateTo(`/settings/approvals/${rule.id}/edit`)">Edit</MpPopoverListItem>
                        <MpPopoverListItem>Delete</MpPopoverListItem>
                      </MpPopoverList>
                    </MpPopoverContent>
                  </MpPopover>
                </MpTableCell>
              </MpTableRow>
            </template>

            <MpTableRow v-else>
              <MpTableCell as="td" scope="row" :colspan="5">
                <MpFlex justify="center" paddingY="8">
                  <MpText size="body" color="text.secondary">No approval rules match your search.</MpText>
                </MpFlex>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>

      <!-- Pagination: langsung di bawah table, tanpa gap -->
      <Pixel.div px="2" py="4">
        <MpFlex justify="space-between">
          <MpFlex align="center">
            <MpText :class="css({ pr: '1', pl: '1' })" color="gray.600">Rows per page</MpText>
            <MpPopover isCloseOnSelect>
              <MpPopoverTrigger>
                <Pixel.div>
                  <MpButton
                    size="sm"
                    variant="ghost"
                    :class="css({ h: '7', display: 'inline-flex', pl: '3', pr: '2', py: '2' })"
                  >
                    <MpText>{{ perPage }}</MpText>
                    <MpIcon name="chevrons-down" size="sm" />
                  </MpButton>
                </Pixel.div>
              </MpPopoverTrigger>
              <MpPopoverContent>
                <MpPopoverList>
                  <MpPopoverListItem
                    v-for="n in perPageOptions"
                    :key="n"
                    :is-active="perPage === n"
                    @click="setPerPage(n)"
                  >{{ n }}</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
            <MpText :class="css({ pl: '5', py: '1' })" color="gray.600">
              {{ filteredRules.length > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${filteredRules.length}` : 'No results' }}
            </MpText>
          </MpFlex>
          <MpFlex align-items="center">
            <MpText :class="css({ pl: '2', pr: '4', py: '1' })" color="gray.600">
              {{ currentPage }} of {{ totalPages }} page
            </MpText>
            <MpTooltip label="Prev page" position="bottom">
              <MpButton
                variant="ghost"
                left-icon="chevrons-left"
                size="sm"
                :is-disabled="currentPage === 1"
                @click="currentPage--"
              />
            </MpTooltip>
            <MpTooltip label="Next page" position="bottom">
              <MpButton
                variant="ghost"
                left-icon="chevrons-right"
                size="sm"
                :is-disabled="currentPage === totalPages"
                @click="currentPage++"
              />
            </MpTooltip>
          </MpFlex>
        </MpFlex>
      </Pixel.div>
    </Pixel.div>
  </MpFlex>

  <!-- FAB: scenario switcher (dev only) -->
  <Pixel.div :class="css({ position: 'fixed', bottom: '6', right: '6', zIndex: 'popover' })">
    <MpPopover is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="tertiary" is-rounded left-icon="sliders" aria-label="Switch scenario" />
      </MpPopoverTrigger>
      <MpPopoverContent>
        <MpPopoverList>
          <MpPopoverListItem :is-active="!showEmptyState" @click="showEmptyState = false">Has data</MpPopoverListItem>
          <MpPopoverListItem :is-active="showEmptyState" @click="showEmptyState = true">Empty state</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Pixel.div>
</template>
