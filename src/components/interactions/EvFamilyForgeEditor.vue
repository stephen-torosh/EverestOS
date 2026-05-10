<template>
  <div class="family-editor">
    <EvCodeEditor
      :title="blueprintTitle"
      :model-value="runtime.blueprint || ''"
      :placeholder="blueprintPlaceholder"
      @update:model-value="patch('blueprint', $event)"
    />

    <EvCodeEditor
      :title="planTitle"
      :model-value="runtime.plan || ''"
      :placeholder="planPlaceholder"
      @update:model-value="patch('plan', $event)"
    />

    <section class="todo-card">
      <header class="todo-head">
        <BaseText tag="h4" size="md" weight="bold">{{ todoTitle }}</BaseText>
        <BaseButton size="sm" variant="outline" @click="$emit('action', 'forge:add-task')">＋</BaseButton>
      </header>
      <label v-for="task in runtime.tasks || []" :key="task.id" class="todo-item">
        <input
          type="checkbox"
          :checked="Boolean(task.done)"
          @change="toggleTask(task.id)"
        />
        <span :class="{ 'is-done': task.done }">{{ task.title }}</span>
      </label>
    </section>

    <EvLogicCanvas
      title="Mindmap"
      :model-value="runtime.mindmap || { nodes: [], edges: [] }"
      @update:model-value="patch('mindmap', $event)"
    />

    <EvLogicCanvas
      title="Logic map"
      :model-value="runtime.logic || { nodes: [], edges: [] }"
      @update:model-value="patch('logic', $event)"
    />

    <EvDataSheet
      :title="requirementsTitle"
      :model-value="requirementRows"
      @update:model-value="updateRequirements"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'
import EvCodeEditor from '@/components/interactions/EvCodeEditor.vue'
import EvDataSheet from '@/components/interactions/EvDataSheet.vue'
import EvLogicCanvas from '@/components/interactions/EvLogicCanvas.vue'

const props = defineProps({
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
  blueprintTitle: {
    type: String,
    default: 'Forge blueprint',
  },
  blueprintPlaceholder: {
    type: String,
    default: 'Describe project concept, audience and value...',
  },
  planTitle: {
    type: String,
    default: 'Execution plan',
  },
  planPlaceholder: {
    type: String,
    default: 'List milestones, ownership and rollout sequence...',
  },
  todoTitle: {
    type: String,
    default: 'Forge TODO',
  },
  requirementsTitle: {
    type: String,
    default: 'Requirements',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const requirementRows = computed(() =>
  (runtime.value.requirements || []).map((item, index) => ({
    id: item.id || `req-${index}`,
    key: item.title || item.key || '',
    value: item.value || item.description || '',
  }))
)

function patch(field, value) {
  emit('patch', { [field]: value })
}

function toggleTask(taskId) {
  emit('patch', {
    tasks: (runtime.value.tasks || []).map((task) => (
      task.id === taskId ? { ...task, done: !task.done } : task
    )),
  })
}

function updateRequirements(rows) {
  emit('patch', {
    requirements: rows
      .filter((row) => row.key || row.value)
      .map((row) => ({
        id: row.id,
        title: row.key,
        value: row.value,
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

.todo-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.todo-item .is-done {
  color: var(--text-secondary);
  text-decoration: line-through;
}
</style>
