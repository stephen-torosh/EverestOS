<template>
  <div class="k-node" :class="[data.status, data.type]">
    <div class="node-content">
      <div class="node-icon-wrapper">
        <span class="node-icon">{{ getIcon(data.type) }}</span>
      </div>
      <div class="node-info">
        <div class="node-label">{{ data.label }}</div>
        <div class="node-meta">
          <span class="status-badge">{{ statusLabels[data.status] }}</span>
          <span v-if="data.xp" class="xp-badge">+{{ data.xp }} XP</span>
        </div>
      </div>
    </div>
    <Handle type="target" position="top" />
    <Handle type="source" position="bottom" />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'

const props = defineProps(['data'])

const statusLabels = {
  locked: '🔒 Locked',
  available: '🔓 Available',
  mastered: '✅ Mastered'
}

const getIcon = (type) => {
  const icons = {
    core: '💎',      // Фундаментальні знання
    tool: '🛠️',      // Інструменти
    framework: '⚡', // Фреймворки
    design: '🎨',    // Візуал/Дизайн
    terminal: '💻'   // Backend/Системне
  }
  return icons[type] || '📚'
}
</script>

<style scoped>
.k-node {
  padding: 14px;
  border-radius: 12px;
  /* Використовуємо змінні теми */
  background: var(--bg-sidebar); 
  border: 1px solid var(--border-color);
  min-width: 200px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* Колір за статусом */
.k-node.mastered {
  /* Використовуємо системний акцентний колір */
  border-color: var(--accent-color);
  box-shadow: 0 0 15px var(--accent-soft);
}

.k-node.available {
  border-color: var(--text-secondary);
  border-style: dashed;
}

.k-node.locked {
  opacity: 0.5;
  filter: grayscale(1);
}

.node-label {
  font-weight: 700;
  /* Адаптивний колір тексту */
  color: var(--text-primary);
  font-size: 13px;
  margin-bottom: 4px;
}

.status-badge { 
  font-size: 9px; 
  text-transform: uppercase; 
  color: var(--text-secondary); 
}

.xp-badge {
  font-size: 9px;
  background: var(--accent-soft);
  color: var(--accent-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
}

/* Кольорові мітки типів тепер теж підлаштовуються */
.k-node.core { border-left: 4px solid var(--accent-color); }
.k-node.tool { border-left: 4px solid #10b981; } /* Можна лишити статичним або теж винести в змінні */
</style>