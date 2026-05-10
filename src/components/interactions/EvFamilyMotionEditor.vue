<template>
  <div class="family-editor">
    <EvCodeEditor
      :title="promptTitle"
      :model-value="runtime.prompt || ''"
      :placeholder="promptPlaceholder"
      @update:model-value="patch('prompt', $event)"
    />

    <EvCodeEditor
      :title="scriptTitle"
      :model-value="runtime.script || ''"
      :placeholder="scriptPlaceholder"
      action-label="Generate timeline"
      @update:model-value="patch('script', $event)"
      @action="$emit('action', 'motion:generate-timeline')"
    />

    <EvSvgStage
      :title="svgTitle"
      :model-value="{ markup: runtime.svgMarkup || defaultMarkup }"
      @update:model-value="patch('svgMarkup', $event.markup)"
    />

    <EvDataSheet
      title="Render setup"
      :model-value="renderRows"
      @update:model-value="updateRenderRows"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import EvCodeEditor from '@/components/interactions/EvCodeEditor.vue'
import EvDataSheet from '@/components/interactions/EvDataSheet.vue'
import EvSvgStage from '@/components/interactions/EvSvgStage.vue'

const props = defineProps({
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
  promptTitle: {
    type: String,
    default: 'Motion prompt',
  },
  promptPlaceholder: {
    type: String,
    default: 'Describe style, mood, camera movement and final effect...',
  },
  scriptTitle: {
    type: String,
    default: 'Motion script',
  },
  scriptPlaceholder: {
    type: String,
    default: 'Beat 1: ...',
  },
  svgTitle: {
    type: String,
    default: 'SVG stage',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const defaultMarkup = '<svg viewBox="0 0 400 220"><rect x="40" y="80" width="320" height="60" rx="16" fill="#113548"/><circle cx="110" cy="110" r="18" fill="#7ad4ff"/><circle cx="200" cy="110" r="18" fill="#bb9bff"/><circle cx="290" cy="110" r="18" fill="#4dffb0"/></svg>'
const renderRows = computed(() => {
  const render = runtime.value.render || {}
  return [
    { id: 'fps', key: 'fps', value: String(render.fps || 24) },
    { id: 'durationSec', key: 'durationSec', value: String(render.durationSec || 12) },
    { id: 'resolution', key: 'resolution', value: render.resolution || '1920x1080' },
    { id: 'format', key: 'format', value: render.format || 'mp4' },
  ]
})

function patch(field, value) {
  emit('patch', { [field]: value })
}

function updateRenderRows(rows) {
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]))
  emit('patch', {
    render: {
      fps: Number(map.fps) || 24,
      durationSec: Number(map.durationSec) || 12,
      resolution: map.resolution || '1920x1080',
      format: map.format || 'mp4',
    },
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
