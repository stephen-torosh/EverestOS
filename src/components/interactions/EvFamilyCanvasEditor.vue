<template>
  <div class="family-editor">
    <EvLogicCanvas
      :title="graphTitle"
      :model-value="{ nodes: runtime.nodes || [], edges: runtime.edges || [] }"
      @update:model-value="patchGraph"
    />

    <EvCodeEditor
      :title="annotationTitle"
      :model-value="runtime.annotation || ''"
      :placeholder="annotationPlaceholder"
      @update:model-value="patch('annotation', $event)"
    />

    <EvDataSheet
      :title="factsTitle"
      :model-value="factRows"
      @update:model-value="updateFacts"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import EvCodeEditor from '@/components/interactions/EvCodeEditor.vue'
import EvDataSheet from '@/components/interactions/EvDataSheet.vue'
import EvLogicCanvas from '@/components/interactions/EvLogicCanvas.vue'

const props = defineProps({
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
  graphTitle: {
    type: String,
    default: 'System graph',
  },
  annotationTitle: {
    type: String,
    default: 'Canvas annotation',
  },
  annotationPlaceholder: {
    type: String,
    default: 'Explain mechanics, states and transitions...',
  },
  factsTitle: {
    type: String,
    default: 'Key facts',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const factRows = computed(() =>
  (runtime.value.logicBlocks || []).map((item, index) => ({
    id: item.id || `fact-${index}`,
    key: item.title || item.key || '',
    value: item.note || item.value || '',
  }))
)

function patch(field, value) {
  emit('patch', { [field]: value })
}

function patchGraph(payload) {
  emit('patch', {
    nodes: payload.nodes || [],
    edges: payload.edges || [],
  })
}

function updateFacts(rows) {
  emit('patch', {
    logicBlocks: rows
      .filter((row) => row.key || row.value)
      .map((row) => ({
        id: row.id,
        title: row.key,
        note: row.value,
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
