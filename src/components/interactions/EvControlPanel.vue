<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
      <span class="kind-chip">{{ kindLabel }}</span>
    </header>

    <div class="action-row">
      <BaseButton
        v-for="action in resolvedActions"
        :key="action.id"
        size="sm"
        variant="outline"
        @click="$emit('action', action.id)"
      >
        {{ action.label }}
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Control panel',
  },
  kind: {
    type: String,
    default: 'chat',
  },
})

defineEmits(['action'])

const motionActions = [
  { id: 'motion:generate-timeline', label: 'Generate timeline' },
  { id: 'motion:play', label: 'Play' },
  { id: 'motion:pause', label: 'Pause' },
]
const canvasActions = [
  { id: 'canvas:add-node', label: 'Add node' },
  { id: 'canvas:connect-latest', label: 'Connect latest' },
]
const logActions = [
  { id: 'log:add-entry', label: 'Add entry' },
]
const forgeActions = [
  { id: 'forge:add-task', label: 'Add task' },
  { id: 'forge:add-mind-node', label: 'Mind node' },
  { id: 'forge:connect-mind', label: 'Connect nodes' },
]

const actionMap = {
  motion: motionActions,
  timeline: motionActions,
  storyboard: motionActions,
  scene: canvasActions,
  sim: canvasActions,
  entity: canvasActions,
  mission: canvasActions,
  js: canvasActions,
  ts: canvasActions,
  logic: canvasActions,
  schema: canvasActions,
  canvas: canvasActions,
  note: logActions,
  log: logActions,
  brief: logActions,
  research: logActions,
  forge: forgeActions,
  plan: forgeActions,
  spec: forgeActions,
  system: forgeActions,
  chat: [{ id: 'chat:add-note', label: 'Add note' }],
}

const resolvedActions = computed(() => actionMap[props.kind] || actionMap.chat)
const kindLabel = computed(() => props.kind.toUpperCase())
</script>

<style scoped>
.ev-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.ev-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kind-chip {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
