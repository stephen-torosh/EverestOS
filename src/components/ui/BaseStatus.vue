<template>
  <div class="status-indicator">
    <span class="dot" :class="{ pulse: active }"></span>
    <BaseText size="xs" weight="bold" color="secondary" :path="path" />
  </div>
</template>

<script setup>
import BaseText from './BaseText.vue'
defineProps({ active: Boolean, path: String })
</script>

<style scoped>
.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 6px;
  height: 6px;
  background: #00ff88;
  border-radius: 50%;
}
.pulse {
  box-shadow: 0 0 8px #00ff88;
  animation: blink 2s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
