<template>
  <div class="family-editor">
    <EvCodeEditor
      :title="summaryTitle"
      :model-value="runtime.summary || ''"
      :placeholder="summaryPlaceholder"
      @update:model-value="patch('summary', $event)"
    />

    <EvDataSheet
      :title="referencesTitle"
      :model-value="referenceRows"
      @update:model-value="updateReferences"
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
  summaryTitle: {
    type: String,
    default: 'Research summary',
  },
  summaryPlaceholder: {
    type: String,
    default: 'Capture discoveries, links and next actions...',
  },
  referencesTitle: {
    type: String,
    default: 'References',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const referenceRows = computed(() =>
  (runtime.value.references || []).map((item, index) => ({
    id: item.id || `ref-${index}`,
    key: item.title || item.key || '',
    value: item.url || item.value || '',
  }))
)

function patch(field, value) {
  emit('patch', { [field]: value })
}

function updateReferences(rows) {
  emit('patch', {
    references: rows
      .filter((row) => row.key || row.value)
      .map((row) => ({
        id: row.id,
        title: row.key,
        url: row.value,
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
