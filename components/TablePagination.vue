<!--
  Mekari Flex — Shared table pagination control.
  Extracted from the Approvals list so every table uses the same footer.
  Pixel 3 DT 2.4 only — no <style>, no raw CSS.

  Usage:
    <TablePagination
      v-model:current-page="currentPage"
      v-model:per-page="perPage"
      :total="filteredItems.length"
    />
-->
<script setup lang="ts">
import {
  Pixel, MpFlex, MpText, MpButton, MpIcon, MpTooltip,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  css,
} from '@mekari/pixel3'

const props = withDefaults(defineProps<{
  currentPage: number
  perPage: number
  total: number
  perPageOptions?: number[]
}>(), {
  perPageOptions: () => [10, 25, 50, 100],
})

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:perPage': [value: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const rangeStart = computed(() => Math.min((props.currentPage - 1) * props.perPage + 1, props.total))
const rangeEnd = computed(() => Math.min(props.currentPage * props.perPage, props.total))

function setPerPage(n: number) { emit('update:perPage', n) }
function prev() { if (props.currentPage > 1) emit('update:currentPage', props.currentPage - 1) }
function next() { if (props.currentPage < totalPages.value) emit('update:currentPage', props.currentPage + 1) }
</script>

<template>
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
          {{ total > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${total}` : 'No results' }}
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
            @click="prev"
          />
        </MpTooltip>
        <MpTooltip label="Next page" position="bottom">
          <MpButton
            variant="ghost"
            left-icon="chevrons-right"
            size="sm"
            :is-disabled="currentPage === totalPages"
            @click="next"
          />
        </MpTooltip>
      </MpFlex>
    </MpFlex>
  </Pixel.div>
</template>
