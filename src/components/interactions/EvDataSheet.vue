<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
      <BaseButton size="sm" variant="outline" @click="addRow">＋</BaseButton>
    </header>

    <div class="ev-sheet">
      <div v-for="row in rows" :key="row.id" class="ev-row">
        <input
          class="ev-input"
          :value="row.key"
          placeholder="key"
          @input="updateRow(row.id, 'key', $event.target.value)"
        />
        <input
          class="ev-input"
          :value="row.value"
          placeholder="value"
          @input="updateRow(row.id, 'value', $event.target.value)"
        />
        <button class="ev-delete" type="button" @click="removeRow(row.id)">✕</button>
      </div>
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
    default: 'Data sheet',
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const rows = computed(() => props.modelValue)

function nextId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `sheet-${crypto.randomUUID().split('-')[0]}`
  }
  return `sheet-${Math.random().toString(36).slice(2, 8)}`
}

function addRow() {
  emit('update:modelValue', [
    ...rows.value,
    { id: nextId(), key: '', value: '' },
  ])
}

function updateRow(id, field, value) {
  emit('update:modelValue', rows.value.map((row) => (
    row.id === id ? { ...row, [field]: value } : row
  )))
}

function removeRow(id) {
  emit('update:modelValue', rows.value.filter((row) => row.id !== id))
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

.ev-sheet {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ev-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
}

.ev-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 8px 10px;
  font: inherit;
  box-sizing: border-box;
}

.ev-delete {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
</style>
