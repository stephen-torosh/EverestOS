<template>
  <button class="base-btn" :class="[variant, size]" v-bind="$attrs">
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary, ghost, accent, outline
  size: { type: String, default: 'md' }, // sm, md, icon
})
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  color: var(--text-primary);
  box-shadow: 0 0 0 transparent;
}
.primary {
  background: var(--glass-bg);
  border-color: var(--border-color);
}
.accent {
  background: var(--accent-color);
  color: #000;
  font-weight: 600;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--accent-color) 26%, transparent);
}
.ghost {
  background: none;
  border: none;
}
.outline {
  background: none;
  border-color: var(--accent-color);
  color: var(--accent-color);
}
.sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}
.md {
  padding: 10px 20px;
  font-size: 1rem;
}
.base-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: 0 10px 26px color-mix(in srgb, var(--accent-color) 18%, transparent);
}
</style>
