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

defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true,
    // Очікує: [{ label: 'ключ.перекладу' або 'Текст', value: 'val' }]
  },
})

defineEmits(['update:modelValue'])
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
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 90%, var(--bg-main) 10%);
}

.select-btn {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transform: translate3d(0, 0, 0);
}

.select-btn:hover {
  border-color: color-mix(in srgb, var(--accent-color) 45%, var(--border-color));
  color: var(--text-primary);
}

.select-btn.is-active {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent-soft) 85%, transparent), var(--accent-soft));
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 14%, transparent);
}

:global(html[data-animations='true'] .select-btn) {
  transition:
    transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 120ms linear,
    color 120ms linear,
    background-color 120ms linear,
    box-shadow 160ms ease !important;
}

:global(html[data-animations='true'] .select-btn:hover) {
  transform: translate3d(0, -1px, 0);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--accent-color) 22%, transparent);
}

:global(html[data-animations='true'] .select-btn.is-active) {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--accent-color) 24%, transparent),
    0 8px 16px color-mix(in srgb, var(--accent-color) 18%, transparent);
}
</style>
