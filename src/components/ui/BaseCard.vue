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
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
    var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.12);
}

.base-card > * {
  position: relative;
  z-index: 2;
}

.base-card::before {
  content: none;
}

.base-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 22%);
  opacity: 0.7;
  z-index: 1;
}

.interactive:hover {
  border-color: var(--accent-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    var(--bg-elevated);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 12px 28px rgba(0, 0, 0, 0.16),
    0 0 0 1px color-mix(in srgb, var(--accent-color) 10%, transparent);
}
</style>
