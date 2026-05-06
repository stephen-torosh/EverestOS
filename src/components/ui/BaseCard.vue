<template>
  <div class="base-card" :class="{ interactive }">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({ interactive: Boolean })
</script>

<style scoped>
.base-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  transition: 0.3s;
}
.interactive:hover {
  border-color: var(--accent-color);
  background: var(--accent-soft);
  transform: translateY(-2px);
}
</style>
