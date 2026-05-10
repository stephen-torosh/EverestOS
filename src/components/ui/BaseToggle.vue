<template>
  <button
    class="toggle-wrapper"
    :class="{ active: modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div class="toggle-track">
      <div class="toggle-thumb"></div>
    </div>
    <BaseText size="sm" weight="semibold">
      {{ modelValue ? 'ON' : 'OFF' }}
    </BaseText>
  </button>
</template>

<script setup>
import BaseText from './BaseText.vue'
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: color-mix(in srgb, var(--bg-elevated) 90%, var(--bg-main) 10%);
  padding: 7px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}
.toggle-track {
  width: 36px;
  height: 20px;
  background: color-mix(in srgb, var(--text-secondary) 32%, transparent);
  border-radius: 20px;
  position: relative;
}
.toggle-thumb {
  width: 14px;
  height: 14px;
  background: color-mix(in srgb, var(--text-primary) 85%, transparent);
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
}
.active .toggle-track {
  background: var(--accent-color);
}
.active .toggle-thumb {
  left: 19px;
  background: color-mix(in srgb, #000 86%, var(--accent-color) 14%);
}
</style>
