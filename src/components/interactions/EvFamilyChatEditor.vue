<template>
  <div class="family-editor">
    <EvCodeEditor
      :title="notesTitle"
      :model-value="runtime.notes || ''"
      :placeholder="notesPlaceholder"
      @update:model-value="patch('notes', $event)"
    />
    <EvDataSheet
      :title="channelsTitle"
      :model-value="channelRows"
      @update:model-value="updateChannels"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import EvCodeEditor from '@/components/interactions/EvCodeEditor.vue'
import EvDataSheet from '@/components/interactions/EvDataSheet.vue'

const props = defineProps({
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
  notesTitle: {
    type: String,
    default: 'Conversation context',
  },
  notesPlaceholder: {
    type: String,
    default: 'Prompt Danilo, define objectives and desired output...',
  },
  channelsTitle: {
    type: String,
    default: 'Chat channels',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const channelRows = computed(() =>
  (runtime.value.channels || []).map((item, index) => ({
    id: item.id || `channel-${index}`,
    key: item.name || item.key || '',
    value: item.goal || item.value || '',
  }))
)

function patch(field, value) {
  emit('patch', { [field]: value })
}

function updateChannels(rows) {
  emit('patch', {
    channels: rows
      .filter((row) => row.key || row.value)
      .map((row) => ({
        id: row.id,
        name: row.key,
        goal: row.value,
      })),
  })
}
</script>

<style scoped>
.family-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
