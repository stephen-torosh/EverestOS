<template>
  <div class="app-root" :class="{ 'no-scroll': isMobileMenuOpen }">
    <div v-if="isMobileViewport" class="mobile-topbar">
      <button
        class="mobile-menu-btn"
        :class="{ 'is-open': isMobileMenuOpen }"
        :aria-expanded="isMobileMenuOpen"
        :aria-label="isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="toggleMobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="mobile-status-chip">
        <span class="mobile-status-dot"></span>
        <span class="mobile-status-text">{{ systemStore.t('system.online') }}</span>
        <span class="mobile-status-divider"></span>
        <strong class="mobile-status-route">{{ mobileRouteTitle }}</strong>
      </div>
    </div>

    <button
      v-if="isMobileViewport && isMobileMenuOpen"
      class="mobile-menu-overlay"
      aria-label="Close navigation menu"
      @click="closeMobileMenu"
    ></button>

    <TheSidebar
      :is-mobile-open="isMobileMenuOpen"
      :is-mobile-view="isMobileViewport"
      @close-mobile="closeMobileMenu"
    />
    <main class="main-content">
      <div class="route-shell">
        <RouterView v-slot="{ Component, route: activeRoute }">
          <Transition v-if="systemStore.animationsEnabled" name="route-pulse" mode="out-in">
            <div :key="activeRoute.fullPath" class="route-frame">
              <component :is="Component" />
            </div>
          </Transition>
          <div v-else :key="activeRoute.fullPath" class="route-frame">
            <component :is="Component" />
          </div>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'
import TheSidebar from '@/components/layout/TheSidebar.vue'

const systemStore = useSystemStore()
const route = useRoute()
const isMobileViewport = ref(false)
const isMobileMenuOpen = ref(false)

let mobileMediaQuery

const syncMobileViewport = (event) => {
  isMobileViewport.value = event.matches
  if (!event.matches) isMobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const mobileRouteTitle = computed(() => {
  const titleKey = route.meta?.title
  return titleKey ? systemStore.t(titleKey) : 'EverestOS'
})

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 1024px)')
  syncMobileViewport(mobileMediaQuery)
  mobileMediaQuery.addEventListener('change', syncMobileViewport)
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncMobileViewport)
})

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
  --motion-quick: 0.22s;
  --motion-base: 0.5s;
  --motion-slow: 0.85s;
  --motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --bg-main: #050505;
  --bg-sidebar: #0a0a0a;
  --bg-elevated: rgba(8, 11, 14, 0.72);
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: rgba(255, 255, 255, 0.08);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glow-bottom: color-mix(in srgb, var(--accent-color) 32%, transparent);
  --glow-soft: color-mix(in srgb, var(--accent-color) 14%, transparent);
}

[data-theme='light'] {
  --bg-main: #f0f2f5;
  --bg-sidebar: #e3e5e8;
  --bg-modal: #ffffff;
  --bg-elevated: rgba(255, 255, 255, 0.78);
  --text-primary: #111112;
  --text-secondary: #4a4d55;
  --border-color: rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(0, 0, 0, 0.05);
  --glow-bottom: color-mix(in srgb, var(--accent-color) 22%, transparent);
  --glow-soft: color-mix(in srgb, var(--accent-color) 10%, transparent);
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

html[data-animations='false'] {
  --motion-quick: 0.01ms;
  --motion-base: 0.01ms;
  --motion-slow: 0.01ms;
}

.app-root, html, body { height: 100%; margin: 0; padding: 0; }
body {
  position: relative;
  background:
    radial-gradient(circle at 50% 115%, color-mix(in srgb, var(--accent-color) 18%, transparent), transparent 34%),
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 28%),
    radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 26%),
    var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-main);
  transition: background 0.3s ease, color 0.3s ease;
  overflow: hidden; /* prevent page-level scrolling */
}

body::before,
body::after {
  content: none;
}

body::before {
  left: 18%;
  right: 10%;
  bottom: -22%;
  height: 38vh;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-color) 26%, transparent) 0%, transparent 62%),
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 42%);
  opacity: 1;
}

body::after {
  width: 28vw;
  min-width: 240px;
  height: 60vh;
  top: 10%;
  right: -8vw;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-color) 18%, transparent) 0%, transparent 66%);
  opacity: 0.85;
}

.app-root {
  display: flex;
  height: 100vh;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.mobile-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.015)),
    var(--bg-elevated);
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.18),
    0 0 0 1px color-mix(in srgb, var(--accent-color) 8%, transparent);
}

.mobile-topbar {
  position: fixed;
  top: max(8px, env(safe-area-inset-top, 0px) + 4px);
  left: 12px;
  right: 12px;
  display: none;
  align-items: center;
  gap: 10px;
  z-index: 160;
  pointer-events: none;
}

.mobile-status-chip {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 54px);
  height: 36px;
  padding: 0 12px 0 10px;
  box-sizing: border-box;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015)),
    var(--bg-elevated);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.16),
    0 0 0 1px color-mix(in srgb, var(--accent-color) 6%, transparent);
  pointer-events: auto;
}

.mobile-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--accent-color);
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent-color) 55%, transparent);
}

.mobile-status-text,
.mobile-status-route {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-status-text {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.mobile-status-divider {
  width: 1px;
  height: 12px;
  flex-shrink: 0;
  background: var(--border-color);
}

.mobile-status-route {
  font-size: 0.74rem;
  line-height: 1;
  color: var(--text-primary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mobile-menu-btn span {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--text-primary);
  transition: transform 0.22s ease, opacity 0.22s ease, background 0.22s ease;
}

.mobile-menu-btn.is-open span {
  background: var(--accent-color);
}

.mobile-menu-btn.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-menu-btn.is-open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(2, 5, 10, 0.54);
  z-index: 130;
}

.app-root::before,
.app-root::after {
  content: none;
}

.app-root::before {
  width: 46vw;
  height: 46vw;
  min-width: 320px;
  min-height: 320px;
  left: -12vw;
  bottom: -22vh;
  background:
    radial-gradient(circle, color-mix(in srgb, var(--accent-color) 36%, transparent) 0%, transparent 62%),
    radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 45%);
}

.app-root::after {
  width: 40vw;
  height: 40vw;
  min-width: 280px;
  min-height: 280px;
  right: -10vw;
  top: -14vh;
  background:
    radial-gradient(circle, color-mix(in srgb, var(--accent-color) 26%, transparent) 0%, transparent 64%),
    radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 42%);
}

.main-content {
  flex: 1;
  height: 100vh;
  margin-left: 280px;
  transition: margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  contain: layout paint;
}

.main-content::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 18%),
    radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--accent-color) 16%, transparent), transparent 18%),
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.012), transparent);
  z-index: -1;
}

.main-content::after {
  content: none;
}

.route-shell {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.route-frame {
  position: relative;
  height: 100%;
  isolation: isolate;
  will-change: opacity, transform;
  backface-visibility: hidden;
}

.route-frame::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: min(22vw, 180px);
  pointer-events: none;
  opacity: 0;
  z-index: 2;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent-color) 18%, transparent) 0%,
    color-mix(in srgb, var(--accent-color) 7%, transparent) 42%,
    transparent 100%
  );
  transform: translate3d(-115%, 0, 0);
}

.route-pulse-enter-active,
.route-pulse-leave-active {
  will-change: opacity, transform;
  backface-visibility: hidden;
}

.route-pulse-enter-active {
  transition:
    opacity 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.route-pulse-enter-active::before {
  animation: route-accent-sweep 0.34s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.route-pulse-leave-active {
  transition: opacity 0.1s linear;
}

.route-pulse-enter-from {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
}

.route-pulse-enter-to,
.route-pulse-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.route-pulse-leave-to {
  opacity: 0;
}

@keyframes route-accent-sweep {
  0% {
    opacity: 0;
    transform: translate3d(-115%, 0, 0);
  }

  18% {
    opacity: 0.9;
  }

  100% {
    opacity: 0;
    transform: translate3d(190%, 0, 0);
  }
}

.app-root:has(.sidebar.is-collapsed) .main-content { margin-left: 80px; }

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-top: 54px;
  }
  .mobile-topbar { display: flex; }
  .mobile-menu-btn { display: inline-flex; flex-shrink: 0; }
  .app-root::before {
    width: 54vw;
    height: 54vw;
    left: -18vw;
  }
  .app-root::after {
    width: 46vw;
    height: 46vw;
    right: -18vw;
  }
  body::before {
    left: 6%;
    right: 6%;
    height: 32vh;
  }
  body::after {
    width: 42vw;
    right: -16vw;
  }

  .route-pulse-enter-active {
    transition-duration: 0.18s;
  }

  .route-pulse-leave-active {
    transition-duration: 0.08s;
  }

  .route-pulse-enter-from {
    transform: translate3d(0, 10px, 0);
  }

  .route-pulse-enter-active::before {
    animation-duration: 0.26s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-pulse-enter-active,
  .route-pulse-leave-active {
    transition-duration: 0.01ms;
  }

  .route-pulse-enter-from,
  .route-pulse-enter-to,
  .route-pulse-leave-from,
  .route-pulse-leave-to {
    transform: none;
  }

  .route-pulse-enter-active::before {
    animation: none;
  }
}
</style>
