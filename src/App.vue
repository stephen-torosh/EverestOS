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

watchEffect(() => {
  const root = document.documentElement
  const activeTheme =
    systemStore.systemTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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
  --bg-main: #050505;
  --bg-sidebar: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: rgba(255, 255, 255, 0.08);
  --glass-bg: rgba(255, 255, 255, 0.04);
}

[data-theme='light'] {
  --bg-main: #f0f2f5;
  --bg-sidebar: #e3e5e8;
  --bg-modal: #ffffff;
  --text-primary: #111112;
  --text-secondary: #4a4d55;
  --border-color: rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(0, 0, 0, 0.05);
}

/* Адаптивні акценти (світла/темна теми) */
[data-accent='cyan'] { --accent-color: #00ffd9; --accent-soft: rgba(0, 255, 217, 0.15); }
[data-theme='light'][data-accent='cyan'] { --accent-color: #007a6c; --accent-soft: rgba(0, 122, 108, 0.12); }

[data-accent='green'] { --accent-color: #deff9a; --accent-soft: rgba(222, 255, 154, 0.15); }
[data-theme='light'][data-accent='green'] { --accent-color: #5c8500; --accent-soft: rgba(92, 133, 0, 0.12); }

[data-accent='orange'] { --accent-color: #ff9f0a; --accent-soft: rgba(255, 159, 10, 0.15); }
[data-theme='light'][data-accent='orange'] { --accent-color: #bd5d00; --accent-soft: rgba(189, 93, 0, 0.12); }

[data-accent='purple'] { --accent-color: #af52de; --accent-soft: rgba(175, 82, 222, 0.15); }
[data-theme='light'][data-accent='purple'] { --accent-color: #7a28ab; --accent-soft: rgba(122, 40, 171, 0.12); }

.app-root, html, body { height: 100%; margin: 0; padding: 0; }
body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-main);
  transition: background 0.3s ease;
  overflow: hidden; /* prevent page-level scrolling */
}

.app-root { display: flex; height: 100vh; }
.main-content {
  flex: 1;
  height: 100vh;
  margin-left: 280px;
  transition: margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.app-root:has(.sidebar.is-collapsed) .main-content { margin-left: 80px; }

@media (max-width: 1024px) { .main-content { margin-left: 0; } }
</style>