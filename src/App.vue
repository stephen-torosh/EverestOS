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
          <Transition
            v-if="routeTransitionEnabled"
            mode="out-in"
            :css="false"
            @enter="onRouteEnter"
            @leave="onRouteLeave"
          >
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
import { gsap } from 'gsap'
import { useRoute } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'
import TheSidebar from '@/components/layout/TheSidebar.vue'

const systemStore = useSystemStore()
const route = useRoute()
const isMobileViewport = ref(false)
const isMobileMenuOpen = ref(false)
const prefersReducedMotion = ref(false)
const balancedPerformanceMode = ref(false)
const backgroundCatalog = {
  limbus: new URL('./assets/backgrounds/codioful-formerly-gradienta-O10vBIDRkZw-unsplash.jpg', import.meta.url).href,
  missions: new URL('./assets/backgrounds/rohit-choudhari-_E6sXQHsgQc-unsplash.jpg', import.meta.url).href,
  stages: new URL('./assets/backgrounds/scott-webb-OxHPDs4WV8Y-unsplash.jpg', import.meta.url).href,
  achievements: new URL('./assets/backgrounds/maxim-berg-ANuuRuCRRAc-unsplash.jpg', import.meta.url).href,
  profile: new URL('./assets/backgrounds/dileepa-nipun-5bakUnqvBo0-unsplash.jpg', import.meta.url).href,
  incubator: new URL('./assets/backgrounds/milad-fakurian-dQDDMWgvotg-unsplash.jpg', import.meta.url).href,
  fallback: new URL('./assets/backgrounds/milad-fakurian-iFu2HILEng8-unsplash.jpg', import.meta.url).href,
}

let mobileMediaQuery
let reducedMotionMediaQuery

const syncMobileViewport = (event) => {
  isMobileViewport.value = event.matches
  if (!event.matches) isMobileMenuOpen.value = false
}

const syncReducedMotion = (event) => {
  prefersReducedMotion.value = event.matches
}

const syncPerformanceMode = () => {
  const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 8) : 8
  const memory = typeof navigator !== 'undefined' ? (navigator.deviceMemory ?? 8) : 8
  const lowPowerDevice = cores <= 4 || memory <= 4
  balancedPerformanceMode.value = isMobileViewport.value || prefersReducedMotion.value || lowPowerDevice
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
const routeTransitionEnabled = computed(() => systemStore.animationsEnabled && !prefersReducedMotion.value)
const activeBackgroundImage = computed(() => {
  const routeName = String(route.name || '')
  return backgroundCatalog[routeName] || backgroundCatalog.fallback
})

function onRouteEnter(element, done) {
  gsap.killTweensOf(element)
  gsap.set(element, { autoAlpha: 0, y: 10 })
  gsap.to(element, {
    autoAlpha: 1,
    y: 0,
    duration: 0.18,
    ease: 'power2.out',
    onComplete: done,
  })
}

function onRouteLeave(element, done) {
  gsap.killTweensOf(element)
  gsap.to(element, {
    autoAlpha: 0,
    y: -6,
    duration: 0.1,
    ease: 'power1.in',
    onComplete: done,
  })
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 1024px)')
  reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMobileViewport(mobileMediaQuery)
  syncReducedMotion(reducedMotionMediaQuery)
  if (!systemStore.animationsEnabled) {
    systemStore.setAnimationsEnabled(true)
  }
  syncPerformanceMode()
  mobileMediaQuery.addEventListener('change', syncMobileViewport)
  reducedMotionMediaQuery.addEventListener('change', syncReducedMotion)
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncMobileViewport)
  reducedMotionMediaQuery?.removeEventListener('change', syncReducedMotion)
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
  syncPerformanceMode()
  root.setAttribute('data-performance', balancedPerformanceMode.value ? 'balanced' : 'full')
  root.style.setProperty('--app-bg-image', activeBackgroundImage.value ? `url("${activeBackgroundImage.value}")` : 'none')
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
  --bg-main: #06080b;
  --bg-sidebar: #0a0d11;
  --bg-elevated: rgba(9, 14, 18, 0.74);
  --text-primary: #ffffff;
  --text-secondary: #a7adb7;
  --border-color: rgba(255, 255, 255, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glow-bottom: color-mix(in srgb, var(--accent-color) 32%, transparent);
  --glow-soft: color-mix(in srgb, var(--accent-color) 14%, transparent);
  --surface-shadow-soft: 0 10px 24px rgba(0, 0, 0, 0.16);
  --surface-shadow-strong: 0 18px 34px rgba(0, 0, 0, 0.24);
  --app-bg-image: none;
}

[data-theme='light'] {
  --bg-main: #edf1f7;
  --bg-sidebar: #e5e9f1;
  --bg-modal: #ffffff;
  --bg-elevated: rgba(255, 255, 255, 0.84);
  --text-primary: #111827;
  --text-secondary: #4b5565;
  --border-color: rgba(17, 24, 39, 0.12);
  --glass-bg: rgba(17, 24, 39, 0.05);
  --glow-bottom: color-mix(in srgb, var(--accent-color) 22%, transparent);
  --glow-soft: color-mix(in srgb, var(--accent-color) 10%, transparent);
  --surface-shadow-soft: 0 10px 20px rgba(25, 32, 44, 0.09);
  --surface-shadow-strong: 0 16px 28px rgba(25, 32, 44, 0.14);
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

html[data-performance='balanced'] {
  --motion-quick: 0.16s;
  --motion-base: 0.3s;
  --motion-slow: 0.5s;
}

html *,
html *::before,
html *::after {
  animation: none !important;
  transition: none !important;
}

html[data-animations='true'] body {
  transition: background 0.16s linear, color 0.16s linear !important;
}

html[data-animations='true'] .mobile-menu-btn span {
  transition: transform 0.12s ease, opacity 0.12s ease, background-color 0.12s ease !important;
}

html[data-animations='true'] :is(button, a, input, textarea, select) {
  transition:
    color 0.12s linear,
    border-color 0.12s linear,
    opacity 0.12s linear !important;
}

.app-root, html, body { height: 100%; margin: 0; padding: 0; }
body {
  position: relative;
  background:
    radial-gradient(circle at 52% 112%, color-mix(in srgb, var(--accent-color) 18%, transparent), transparent 36%),
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-color) 16%, transparent), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 22%),
    var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-main);
  overflow: hidden; /* prevent page-level scrolling */
}

html[data-performance='balanced'] body {
  background:
    radial-gradient(circle at 50% 115%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent 18%),
    var(--bg-main);
  transition: none;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: var(--app-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.34;
  filter: none;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    linear-gradient(180deg, rgba(4, 7, 11, 0.22), rgba(4, 7, 11, 0.44)),
    radial-gradient(circle at 84% 8%, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 22%);
}

[data-theme='light'] body::before { opacity: 0.2; filter: none; }
[data-theme='light'] body::after { background: linear-gradient(180deg, rgba(237, 241, 247, 0.28), rgba(237, 241, 247, 0.52)); }
html[data-performance='balanced'] body::before { opacity: 0.16; filter: none; }

.app-root {
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
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
    var(--app-bg-image) center / cover no-repeat,
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent 16%),
    radial-gradient(circle at 84% 14%, color-mix(in srgb, var(--accent-color) 13%, transparent), transparent 20%),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 18px,
      rgba(255, 255, 255, 0.01) 18px,
      rgba(255, 255, 255, 0.01) 19px
    );
  opacity: 0.22;
  z-index: 0;
}

html[data-performance='balanced'] .main-content::before {
  background:
    var(--app-bg-image) center / cover no-repeat,
    linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent 18%),
    radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--accent-color) 9%, transparent), transparent 20%);
  opacity: 0.14;
}

.main-content::after {
  content: none;
}

[data-theme='light'] .main-content::before {
  opacity: 0.12;
}

.route-shell {
  position: relative;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.route-frame {
  position: relative;
  height: 100%;
  isolation: isolate;
  will-change: auto;
  backface-visibility: hidden;
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

}

</style>
