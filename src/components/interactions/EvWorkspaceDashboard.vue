<template>
  <section class="workspace-dashboard" :class="`is-${workspaceId}`">
    <header class="dashboard-head">
      <div>
        <BaseText tag="h4" size="md" weight="bold">{{ heading }}</BaseText>
        <BaseText size="xs" color="secondary">{{ subtitle }}</BaseText>
      </div>
      <span class="workspace-chip">{{ fileCount }} files</span>
    </header>

    <div class="dashboard-stats">
      <article v-for="item in stats" :key="item.label" class="dashboard-stat">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </article>
    </div>

    <div v-if="workspaceId === 'forge'" class="dashboard-actions">
      <BaseButton size="sm" variant="accent" @click="$emit('create-task')">Create TODO</BaseButton>
      <BaseButton size="sm" variant="outline" @click="$emit('create-mind-node')">Create mindmap node</BaseButton>
      <BaseButton size="sm" variant="outline" @click="$emit('open-main-file')">Open Forge file</BaseButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'

const props = defineProps({
  workspaceId: {
    type: String,
    default: 'research',
  },
  fileCount: {
    type: Number,
    default: 0,
  },
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['create-task', 'create-mind-node', 'open-main-file'])

const runtime = computed(() => props.runtimeData || {})

const heading = computed(() => {
  if (props.workspaceId === 'motion') return 'Motion Command'
  if (props.workspaceId === 'sim') return 'Simulation Deck'
  if (props.workspaceId === 'code') return 'Code Operations'
  if (props.workspaceId === 'forge') return 'Forge Strategy Board'
  return 'Research Intelligence'
})

const subtitle = computed(() => {
  if (props.workspaceId === 'motion') return 'Animation direction, shots, and render setup.'
  if (props.workspaceId === 'sim') return 'Systems, entities, and mission flow map.'
  if (props.workspaceId === 'code') return 'Modules, schema, and implementation logic.'
  if (props.workspaceId === 'forge') return 'Project structure, todo, mindmap, and decisions.'
  return 'Findings, logs, briefs, and knowledge references.'
})

const stats = computed(() => {
  if (props.workspaceId === 'motion') {
    return [
      { label: 'beats', value: runtime.value.timeline?.length || 0 },
      { label: 'shots', value: runtime.value.shots?.length || 0 },
      { label: 'fps', value: runtime.value.render?.fps || 24 },
      { label: 'duration', value: `${runtime.value.render?.durationSec || 12}s` },
    ]
  }

  if (props.workspaceId === 'sim') {
    return [
      { label: 'nodes', value: runtime.value.nodes?.length || 0 },
      { label: 'edges', value: runtime.value.edges?.length || 0 },
      { label: 'facts', value: runtime.value.logicBlocks?.length || 0 },
      { label: 'zoom', value: runtime.value.viewport?.zoom || 1 },
    ]
  }

  if (props.workspaceId === 'code') {
    return [
      { label: 'modules', value: runtime.value.logicBlocks?.length || 0 },
      { label: 'nodes', value: runtime.value.nodes?.length || 0 },
      { label: 'edges', value: runtime.value.edges?.length || 0 },
      { label: 'selection', value: runtime.value.selection?.length || 0 },
    ]
  }

  if (props.workspaceId === 'forge') {
    const tasks = runtime.value.tasks || []
    return [
      { label: 'tasks', value: tasks.length },
      { label: 'done', value: tasks.filter((task) => task.done).length },
      { label: 'mindmap', value: runtime.value.mindmap?.nodes?.length || 0 },
      { label: 'logic', value: runtime.value.logic?.nodes?.length || 0 },
    ]
  }

  return [
    { label: 'entries', value: runtime.value.entries?.length || 0 },
    { label: 'refs', value: runtime.value.references?.length || 0 },
    { label: 'tags', value: runtime.value.tags?.length || 0 },
    { label: 'filter', value: runtime.value.filter || 'all' },
  ]
})
</script>

<style scoped>
.workspace-dashboard {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.dashboard-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dashboard-stat {
  border-radius: 10px;
  padding: 8px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dashboard-stat strong {
  font-size: 0.95rem;
}

.dashboard-stat span {
  color: var(--text-secondary);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.is-motion {
  background: linear-gradient(120deg, rgba(122, 212, 255, 0.16), transparent 45%);
}

.is-sim {
  background: linear-gradient(120deg, rgba(187, 155, 255, 0.16), transparent 45%);
}

.is-code {
  background: linear-gradient(120deg, rgba(141, 210, 255, 0.14), transparent 45%);
}

.is-research {
  background: linear-gradient(120deg, rgba(255, 217, 120, 0.14), transparent 45%);
}

.is-forge {
  background: linear-gradient(120deg, rgba(255, 143, 110, 0.14), transparent 45%);
}

@media (max-width: 980px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
