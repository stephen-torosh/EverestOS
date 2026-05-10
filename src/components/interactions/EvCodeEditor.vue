<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
      <BaseButton
        v-if="actionLabel"
        size="sm"
        variant="outline"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </BaseButton>
    </header>
    <textarea
      :value="modelValue"
      class="ev-textarea"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <BaseText v-if="hint" size="xs" color="secondary">{{ hint }}</BaseText>
  </section>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'

defineProps({
  title: {
    type: String,
    default: 'Editor',
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue', 'action'])
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
  min-height: 120px;
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
</style>
