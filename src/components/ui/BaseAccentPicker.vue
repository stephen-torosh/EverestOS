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
  gap: 12px;
}
button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: 0.3s;
}
button.active {
  border-color: #fff;
  transform: scale(1.15);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
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
