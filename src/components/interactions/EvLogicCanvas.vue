<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
      <BaseButton size="sm" variant="outline" @click="addNode">＋ Node</BaseButton>
    </header>

    <div class="logic-canvas-grid">
      <EvLogicNode
        v-for="node in safeNodes"
        :key="node.id"
        :node="node"
      />
    </div>

    <div class="logic-canvas-actions">
      <BaseText size="xs" color="secondary">
        Nodes: {{ safeNodes.length }} · Edges: {{ safeEdges.length }}
      </BaseText>
      <BaseButton
        v-if="safeNodes.length > 1"
        size="sm"
        variant="outline"
        @click="connectLatest"
      >
        Connect latest
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'
import EvLogicNode from '@/components/interactions/EvLogicNode.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Logic canvas',
  },
  modelValue: {
    type: Object,
    default: () => ({ nodes: [], edges: [] }),
  },
})

const emit = defineEmits(['update:modelValue'])

const safeNodes = computed(() => Array.isArray(props.modelValue?.nodes) ? props.modelValue.nodes : [])
const safeEdges = computed(() => Array.isArray(props.modelValue?.edges) ? props.modelValue.edges : [])

function nextId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().split('-')[0]}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function updatePayload(nodes, edges) {
  emit('update:modelValue', { nodes, edges })
}

function addNode() {
  const node = {
    id: nextId('logic'),
    label: `Node ${safeNodes.value.length + 1}`,
    type: safeNodes.value.length ? 'detail' : 'core',
    note: '',
  }
  updatePayload([...safeNodes.value, node], safeEdges.value)
}

function connectLatest() {
  const from = safeNodes.value[safeNodes.value.length - 2]
  const to = safeNodes.value[safeNodes.value.length - 1]
  if (!from || !to) return
  const nextEdge = {
    id: nextId('edge'),
    from: from.id,
    to: to.id,
  }
  updatePayload(safeNodes.value, [...safeEdges.value, nextEdge])
}
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

.logic-canvas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 8px;
}

.logic-canvas-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
</style>
