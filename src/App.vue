<template>
  <div class="app-root" :class="{ 'no-scroll': isMenuLocked }">
    <TheSidebar @toggle-menu="isMenuLocked = $event" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useSystemStore } from '@/stores/systemStore'
import TheSidebar from '@/components/layout/TheSidebar.vue'

const systemStore = useSystemStore()
const isMenuLocked = ref(false)

// Синхронізація станів стору з атрибутами HTML для CSS
watchEffect(() => {
  const root = document.documentElement

  // Визначаємо тему (якщо 'system', беремо реальне значення з медіа-запиту)
  const activeTheme =
    systemStore.systemTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark').matches
        ? 'dark'
        : 'light'
      : systemStore.systemTheme

  root.setAttribute('data-theme', activeTheme)
  root.setAttribute('data-accent', systemStore.accentColor)
  root.setAttribute('data-animations', systemStore.animationsEnabled.toString())
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850&display=swap');

:root {
  --font-main: 'Inter', system-ui, -apple-system, sans-serif;

  /* --- DARK THEME (Default) --- */
  --bg-main: #050505;
  --bg-sidebar: #0a0a0a;
  --bg-modal: #111111;

  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;

  --border-color: rgba(255, 255, 255, 0.08);
  --glass-bg: rgba(255, 255, 255, 0.04);

  /* Акценти за замовчуванням (Cyan) */
  --accent-color: #00ffd9;
  --accent-soft: rgba(0, 255, 217, 0.12);
}

[data-theme='light'] {
  /* --- LIGHT THEME (Soft & High Contrast) --- */
  --bg-main: #f5f5f7;
  --bg-sidebar: #ebebed;
  --bg-modal: #ffffff; /* Жодної прозорості у вікні */

  --text-primary: #1d1d1f; /* Глибокий темний для читабельності */
  --text-secondary: #515154; /* Чіткий сірий */

  --border-color: rgba(0, 0, 0, 0.12);
  --glass-bg: rgba(0, 0, 0, 0.06);

  /* Приглушені акценти для світлого фону */
  --accent-color: #007a68;
  --accent-soft: rgba(0, 122, 104, 0.15);
}

/* --- СИСТЕМА ДИНАМІЧНИХ АКЦЕНТІВ --- */
/* Cyan */
[data-accent='cyan'] {
  --accent-color: #00ffd9;
  --accent-soft: rgba(0, 255, 217, 0.12);
}
[data-theme='light'][data-accent='cyan'] {
  --accent-color: #007a68;
}

/* Green */
[data-accent='green'] {
  --accent-color: #deff9a;
  --accent-soft: rgba(222, 255, 154, 0.12);
}
[data-theme='light'][data-accent='green'] {
  --accent-color: #5a8000;
}

/* Orange */
[data-accent='orange'] {
  --accent-color: #ff9f0a;
  --accent-soft: rgba(255, 159, 10, 0.12);
}
[data-theme='light'][data-accent='orange'] {
  --accent-color: #c97b00;
}

/* Purple */
[data-accent='purple'] {
  --accent-color: #af52de;
  --accent-soft: rgba(175, 82, 222, 0.12);
}
[data-theme='light'][data-accent='purple'] {
  --accent-color: #7d2eb0;
}

/* --- GLOBAL STYLES --- */
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-main);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  transition: background-color 0.3s ease;
}

.app-root {
  display: flex;
  min-height: 100vh;
}

.no-scroll {
  overflow: hidden;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 280px; /* Ширина сайдбару */
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
  transition: margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Анімації (вимикаються через стор) */
[data-animations='false'] * {
  transition: none !important;
  animation: none !important;
}

/* Scrollbar customization */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 5rem;
  }
}
</style>
