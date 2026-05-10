<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
    </header>
    <textarea
      :value="markup"
      class="ev-textarea"
      :placeholder="placeholder"
      @input="updateMarkup($event.target.value)"
    ></textarea>
    <div class="svg-stage" v-html="markup"></div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BaseText from '@/components/ui/BaseText.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'SVG stage',
  },
  modelValue: {
    type: Object,
    default: () => ({ markup: '' }),
  },
  placeholder: {
    type: String,
    default: '<svg viewBox="0 0 400 220">...</svg>',
  },
})

const emit = defineEmits(['update:modelValue'])

const markup = computed(() => String(props.modelValue?.markup || ''))

function updateMarkup(value) {
  emit('update:modelValue', { ...props.modelValue, markup: value })
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

.ev-textarea {
  width: 100%;
  min-height: 110px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font: inherit;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: 10px;
  resize: vertical;
  box-sizing: border-box;
}

.svg-stage {
  min-height: 150px;
  border: 1px dashed color-mix(in srgb, var(--accent-color) 30%, var(--border-color));
  border-radius: 10px;
  padding: 8px;
  background: color-mix(in srgb, var(--bg-main) 96%, var(--accent-color) 4%);
}
</style>
