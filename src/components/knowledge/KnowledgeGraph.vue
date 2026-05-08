<template>
  <div class="graph-container" :class="{ 'is-light': systemStore.systemTheme === 'light' }">
    <VueFlow
      v-model="elements"
      :node-types="nodeTypes"
      :default-edge-options="defaultEdgeOptions"
      :min-zoom="0.2"
      :max-zoom="1.5"
      fit-view-on-init
      class="custom-flow"
    >
      <!-- Фонова сітка, що адаптується до теми -->
      <Background
        :pattern-color="systemStore.systemTheme === 'dark' ? '#222' : '#ddd'"
        :gap="26"
      />
      
      <Controls position="bottom-right" />
    </VueFlow>
  </div>
</template>

<script setup>
import { ref, watch, markRaw, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import dagre from 'dagre'

// Імпортуємо стор системи для відстеження теми та акценту
import { useSystemStore } from '@/stores/systemStore'
import KnowledgeNode from './KnowledgeNode.vue'

// Стилі
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

const props = defineProps({
  nodesData: {
    type: Array,
    required: true
  }
})

const systemStore = useSystemStore()
const nodeTypes = {
  knowledge: markRaw(KnowledgeNode)
}

const elements = ref([])

// Налаштування ліній за замовчуванням
const defaultEdgeOptions = computed(() => ({
  type: 'smoothstep',
  animated: false,
  style: {
    strokeWidth: 2,
    stroke: 'var(--border-color)'
  }
}))

/**
 * АЛГОРИТМ DAGRE ДЛЯ РОЗМІЩЕННЯ
 */
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 100 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.position = {
      x: nodeWithPosition.x - 110,
      y: nodeWithPosition.y - 50,
    }
  })

  return [...nodes, ...edges]
}

/**
 * ТРАНСФОРМАЦІЯ ДАНИХ З ПІДТРИМКОЮ ТЕМИ
 */
const transformData = (rawData) => {
  const nodes = []
  const edges = []

  rawData.forEach((item) => {
    nodes.push({
      id: item.id,
      type: 'knowledge',
      data: { ...item },
      position: { x: 0, y: 0 },
    })

    if (item.dependsOn && item.dependsOn.length > 0) {
      item.dependsOn.forEach((depId) => {
        const isMastered = item.status === 'mastered'
        const isLocked = item.status === 'locked'
        
        edges.push({
          id: `e-${depId}-${item.id}`,
          source: depId,
          target: item.id,
          // Динамічний стиль лінії залежно від акценту та статусу
          style: {
            stroke: isMastered ? 'var(--accent-color)' : 'var(--border-color)',
            strokeDasharray: isLocked ? '5 5' : '0',
            opacity: isLocked ? 0.4 : 1,
            transition: 'stroke 0.3s ease'
          },
          animated: systemStore.animationsEnabled && isMastered && rawData.length <= 8
        })
      })
    }
  })

  return getLayoutedElements(nodes, edges)
}

// Слідкуємо за даними знань
watch(() => props.nodesData, (newData) => {
  elements.value = transformData(newData)
}, { immediate: true, deep: true })

// Слідкуємо за зміною теми/акценту, щоб перемалювати лінії
watch([() => systemStore.systemTheme, () => systemStore.accentColor, () => systemStore.animationsEnabled], () => {
  elements.value = transformData(props.nodesData)
})
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  background: var(--bg-main); /* Використовуємо твою змінну фону */
  position: relative;
  transition: background 0.3s ease;
}

.custom-flow {
  background-color: transparent;
}

/* Адаптація вбудованих компонентів Vue Flow до EverestOS */
:deep(.vue-flow__controls) {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

:deep(.vue-flow__controls-button) {
  background: transparent;
  fill: var(--text-primary);
  border-right: none;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s;
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.vue-flow__controls-button:hover) {
  background: var(--accent-soft);
  fill: var(--accent-color);
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2.5;
}

/* Колір стрілочок на кінцях ліній */
:deep(.vue-flow__arrowhead path) {
  fill: var(--border-color);
}
</style>
