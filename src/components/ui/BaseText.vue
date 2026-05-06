<template>
  <component :is="tag" class="base-text" :class="[size, weight, color]">
    <template v-if="path">{{ systemStore.t(path) }}</template>
    <slot v-else></slot>
  </component>
</template>

<script setup>
import { useSystemStore } from '@/stores/systemStore'
const systemStore = useSystemStore()
defineProps({
  tag: { type: String, default: 'span' },
  path: String,
  size: { type: String, default: 'md' }, // xs(0.75), sm(0.875), md(1), lg(1.125), xl(1.25), h1(1.5)
  weight: { type: String, default: 'normal' }, // light, normal, semibold, bold
  color: { type: String, default: 'primary' }, // primary, secondary, accent
})
</script>

<style scoped>
.base-text {
  line-height: 1.5;
  transition: color 0.3s;
}
.xs {
  font-size: 0.75rem;
}
.sm {
  font-size: 0.875rem;
}
.md {
  font-size: 1rem;
}
.lg {
  font-size: 1.125rem;
}
.xl {
  font-size: 1.25rem;
}
.h1 {
  font-size: 1.5rem;
}
.light {
  font-weight: 300;
}
.normal {
  font-weight: 400;
}
.semibold {
  font-weight: 600;
}
.bold {
  font-weight: 700;
}
.primary {
  color: var(--text-primary);
}
.secondary {
  color: var(--text-secondary);
}
.accent {
  color: var(--accent-color);
}
</style>
