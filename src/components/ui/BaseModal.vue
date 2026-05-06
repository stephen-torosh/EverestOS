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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background: var(--bg-modal);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
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
