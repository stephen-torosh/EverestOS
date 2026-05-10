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
  min-height: 34px;
  border-radius: 11px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-elevated) 92%, var(--bg-main) 8%);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}
.primary {
  background: color-mix(in srgb, var(--bg-elevated) 88%, var(--bg-main) 12%);
}
.accent {
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--accent-color) 96%, white 4%),
      color-mix(in srgb, var(--accent-color) 86%, black 14%)
    );
  border-color: color-mix(in srgb, var(--accent-color) 55%, black 45%);
  color: #07110d;
  box-shadow:
    0 10px 24px color-mix(in srgb, var(--accent-color) 30%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.ghost {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
.outline {
  background: color-mix(in srgb, var(--bg-main) 94%, transparent);
  border-color: color-mix(in srgb, var(--accent-color) 55%, var(--border-color));
  color: color-mix(in srgb, var(--accent-color) 88%, var(--text-primary));
}
.sm {
  padding: 6px 12px;
  font-size: 0.84rem;
}
.md {
  padding: 9px 16px;
  font-size: 0.94rem;
}
.base-btn:hover {
  filter: brightness(1.04);
}
</style>
