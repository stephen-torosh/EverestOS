<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <div class="modal-header">
            <BaseText tag="h2" size="xl" weight="bold" :path="titlePath" />
            <BaseButton variant="ghost" @click="$emit('close')">✕</BaseButton>
          </div>
          <div class="modal-body custom-scroll">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import BaseText from './BaseText.vue'
import BaseButton from './BaseButton.vue'
defineProps(['show', 'titlePath'])
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, #000 70%, transparent);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 24%),
    var(--bg-modal);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 50px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}
</style>
