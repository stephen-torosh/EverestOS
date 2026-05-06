<template>
  <div class="select-group">
    <button
      v-for="option in options"
      :key="option.value"
      class="select-btn"
      :class="{ 'is-active': modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ renderLabel(option.label) }}
    </button>
  </div>
</template>

<script setup>
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true,
    // Очікує: [{ label: 'ключ.перекладу' або 'Текст', value: 'val' }]
  },
})

const emit = defineEmits(['update:modelValue'])
const systemStore = useSystemStore()

// Функція, яка вирішує: перекладати рядок чи виводити як є
const renderLabel = (label) => {
  if (!label) return ''

  // Якщо в рядку є крапка (наприклад, settings.title),
  // пробуємо отримати переклад через наш стор
  if (label.includes('.')) {
    return systemStore.t(label)
  }

  return label
}
</script>

<style scoped>
.select-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.select-btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.select-btn.is-active {
  background: var(--accent-soft);
  border-color: var(--accent-color);
  color: var(--accent-color);
}
</style>
