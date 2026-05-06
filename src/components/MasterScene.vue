<template>
  <div class="everest-viewport">
    <!-- Контейнер для Three.js Canvas -->
    <div ref="container" class="canvas-container"></div>

    <!-- Накладення UI (приклад використання твого UIStore) -->
    <div class="mission-overlay">
      <div v-for="(log, index) in engine.UIStore.logs" :key="index" class="log-entry">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { engine } from '@/utils/masterEngine'
import { startTestMission } from '@/missions/TestMission'

const container = ref(null)

onMounted(() => {
  if (container.value) {
    // 1. Ініціалізуємо рендерер та вставляємо його в DOM
    engine.init(container.value)

    // 2. Завантажуємо скрипт нашої місії
    startTestMission()

    // Додатково: реагуємо на зміну розміру вікна
    window.addEventListener('resize', handleResize)
  }
})

const handleResize = () => {
  if (engine.renderer && engine.activeCamera) {
    const width = window.innerWidth
    const height = window.innerHeight
    engine.renderer.setSize(width, height)
    engine.activeCamera.aspect = width / height
    engine.activeCamera.updateProjectionMatrix()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  engine.stop() // Очищаємо сцену та зупиняємо цикл
})
</script>

<style scoped>
.everest-viewport {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #050505;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.mission-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  pointer-events: none;
  font-family: 'Courier New', monospace;
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
}

.log-entry {
  background: rgba(0, 0, 0, 0.5);
  margin-bottom: 4px;
  padding: 4px 8px;
  border-left: 2px solid #00ffff;
  font-size: 14px;
}
</style>
