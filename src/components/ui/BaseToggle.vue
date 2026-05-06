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
  gap: 12px;
  background: var(--glass-bg);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: 0.3s;
}
.toggle-track {
  width: 36px;
  height: 20px;
  background: #333;
  border-radius: 20px;
  position: relative;
  transition: 0.3s;
}
.toggle-thumb {
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.active .toggle-track {
  background: var(--accent-color);
}
.active .toggle-thumb {
  left: 19px;
  background: #000;
}
</style>
