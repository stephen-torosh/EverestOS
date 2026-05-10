<template>
  <section class="ev-card">
    <header class="ev-head">
      <BaseText tag="h4" size="md" weight="bold">{{ title }}</BaseText>
    </header>
    <div class="viz-grid">
      <article v-for="item in stats" :key="item.label" class="viz-card">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </article>
    </div>
  </section>
</template>

<script setup>
import BaseText from '@/components/ui/BaseText.vue'

defineProps({
  title: {
    type: String,
    default: 'Visualizer',
  },
  stats: {
    type: Array,
    default: () => [],
  },
})
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

.viz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
}

.viz-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px;
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.viz-card strong {
  font-size: 1rem;
}

.viz-card span {
  color: var(--text-secondary);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
