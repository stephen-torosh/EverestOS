<template>
  <article class="logic-node">
    <div class="logic-node-head">
      <strong>{{ node.label }}</strong>
      <span>{{ node.type || 'node' }}</span>
    </div>
    <p v-if="node.note">{{ node.note }}</p>
  </article>
</template>

<script setup>
defineProps({
  node: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.logic-node {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.logic-node-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.logic-node-head span {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

p {
  margin: 6px 0 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
}
</style>
