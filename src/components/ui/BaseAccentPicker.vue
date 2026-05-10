<template>
  <div class="accent-grid">
    <button
      v-for="color in colors"
      :key="color"
      :class="[color, { active: modelValue === color }]"
      @click="$emit('update:modelValue', color)"
      :title="color"
    ></button>
  </div>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
const colors = ['green', 'cyan', 'orange', 'purple']
</script>

<style scoped>
.accent-grid {
  display: flex;
  gap: 10px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 92%, var(--bg-main) 8%);
}
button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
}
button.active {
  border-color: color-mix(in srgb, var(--text-primary) 70%, transparent);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--accent-color) 22%, transparent),
    inset 0 0 0 1px rgba(255, 255, 255, 0.36);
}
.green {
  background: #deff9a;
}
.cyan {
  background: #00ffd9;
}
.orange {
  background: #ff9f0a;
}
.purple {
  background: #af52de;
}
</style>
