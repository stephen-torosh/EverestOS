<template>
  <button
    class="mobile-burger"
    :class="{ 'is-active': isMobileOpen }"
    @click="isMobileOpen = !isMobileOpen"
  >
    <div class="burger-line"></div>
    <div class="burger-line"></div>
    <div class="burger-line"></div>
  </button>

  <Transition name="fade">
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="isMobileOpen = false"></div>
  </Transition>

  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed, 'is-mobile-open': isMobileOpen }">
    <div class="sidebar-inner">
      <div class="sidebar-header">
        <div class="brand-wrapper">
          <div class="brand-logo">
            <div class="logo-svg-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 20L12 4L21 20H3Z"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 20L12 11L17 20"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="4" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div class="brand-details" v-if="!isCollapsed || isMobileOpen">
            <h1 class="brand-name">Everest<span class="accent-text">OS</span></h1>
            <div class="system-status">
              <span class="status-indicator"></span>
              <span class="status-label">{{ systemStore.t('system.online') }}</span>
            </div>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav custom-scroll">
        <div class="nav-group">
          <div class="group-header" v-if="!isCollapsed || isMobileOpen">
            <span class="group-title">{{ systemStore.t('system.operations') }}</span>
            <div class="group-line"></div>
          </div>

          <RouterLink
            to="/"
            class="nav-link"
            @click="isMobileOpen = false"
            v-tooltip="isCollapsed && !isMobileOpen ? systemStore.t('menu.dashboard') : ''"
          >
            <div class="nav-icon-wrapper">◎</div>
            <span class="nav-text" v-if="!isCollapsed || isMobileOpen">{{
              systemStore.t('menu.dashboard')
            }}</span>
            <div class="active-indicator"></div>
          </RouterLink>

          <RouterLink
            to="/stages"
            class="nav-link"
            @click="isMobileOpen = false"
            v-tooltip="isCollapsed && !isMobileOpen ? systemStore.t('menu.stages') : ''"
          >
            <div class="nav-icon-wrapper">◈</div>
            <span class="nav-text" v-if="!isCollapsed || isMobileOpen">{{
              systemStore.t('menu.stages')
            }}</span>
            <div class="active-indicator"></div>
          </RouterLink>

          <RouterLink
            to="/missions"
            class="nav-link"
            @click="isMobileOpen = false"
            v-tooltip="isCollapsed && !isMobileOpen ? systemStore.t('menu.missions') : ''"
          >
            <div class="nav-icon-wrapper">▣</div>
            <span class="nav-text" v-if="!isCollapsed || isMobileOpen">{{
              systemStore.t('menu.missions')
            }}</span>
            <div class="active-indicator"></div>
          </RouterLink>
        </div>

        <div class="nav-group spacer">
          <div class="group-header" v-if="!isCollapsed || isMobileOpen">
            <span class="group-title">{{ systemStore.t('system.evolution') }}</span>
            <div class="group-line"></div>
          </div>

          <RouterLink
            to="/advancements"
            class="nav-link"
            @click="isMobileOpen = false"
            v-tooltip="isCollapsed && !isMobileOpen ? systemStore.t('menu.advancements') : ''"
          >
            <div class="nav-icon-wrapper">▤</div>
            <span class="nav-text" v-if="!isCollapsed || isMobileOpen">{{
              systemStore.t('menu.advancements')
            }}</span>
            <div class="active-indicator"></div>
          </RouterLink>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile" @click="handleProfileClick">
          <div class="user-avatar-wrapper">
            <div class="avatar-circle">UA</div>
            <div class="online-badge"></div>
          </div>
          <div class="user-meta" v-if="!isCollapsed || isMobileOpen">
            <span class="user-display-name">{{ systemStore.t('user.name') }}</span>
            <span class="user-status-rank">{{ systemStore.t('user.rank') }}</span>
          </div>
        </div>

        <button
          class="sidebar-action-btn settings-trigger"
          @click="isSettingsOpen = true"
          v-tooltip="isCollapsed && !isMobileOpen ? systemStore.t('settings.title') : ''"
        >
          <span class="icon-gear">⚙️</span>
        </button>
      </div>
    </div>
  </aside>

  <BaseModal
    v-if="isSettingsOpen"
    :show="isSettingsOpen"
    :title="systemStore.t('settings.title')"
    @close="isSettingsOpen = false"
  >
    <div class="settings-container">
      <div class="settings-row">
        <div class="setting-info">
          <span class="setting-label">{{ systemStore.t('settings.language') }}</span>
        </div>
        <BaseSelectGroup
          v-model="systemStore.currentLanguage"
          :options="[
            { label: '🇺🇦 UA', value: 'ua' },
            { label: '🇺🇸 EN', value: 'en' },
            { label: '🇵🇱 PL', value: 'pl' },
            { label: '🇩🇪 DE', value: 'de' },
          ]"
          @update:modelValue="systemStore.setLanguage"
        />
      </div>

      <div class="settings-row">
        <div class="setting-info">
          <span class="setting-label">{{ systemStore.t('settings.theme') }}</span>
        </div>
        <BaseSelectGroup
          v-model="systemStore.systemTheme"
          :options="[
            { label: 'settings.themset.dark', value: 'dark' },
            { label: 'settings.themset.light', value: 'light' },
            { label: 'settings.themset.system', value: 'system' },
          ]"
          @update:modelValue="systemStore.setSystemTheme"
        />
      </div>

      <div class="settings-row">
        <div class="setting-info">
          <span class="setting-label">{{ systemStore.t('settings.accent') }}</span>
        </div>
        <BaseAccentPicker
          v-model="systemStore.accentColor"
          @update:modelValue="systemStore.setAccentColor"
        />
      </div>

      <div class="settings-row inline">
        <div class="setting-info">
          <span class="setting-label">{{ systemStore.t('settings.performance') }}</span>
        </div>
        <BaseToggle v-model="systemStore.animationsEnabled" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'

import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import BaseAccentPicker from '@/components/ui/BaseAccentPicker.vue'

const router = useRouter()
const systemStore = useSystemStore()

const isSettingsOpen = ref(false)
const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const handleProfileClick = () => {
  router.push('/profile')
  isMobileOpen.value = false
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.is-collapsed {
  width: 80px;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px 20px;
  box-sizing: border-box;
}

/* BURGER */
.mobile-burger {
  display: none;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  background: var(--accent-color);
  border: none;
  border-radius: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 4px 15px var(--accent-soft);
}

.burger-line {
  width: 22px;
  height: 2px;
  background: #000;
  border-radius: 2px;
  transition: 0.3s;
}
.mobile-burger.is-active .burger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.mobile-burger.is-active .burger-line:nth-child(2) {
  opacity: 0;
}
.mobile-burger.is-active .burger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 90;
}

/* HEADER */
.sidebar-header {
  margin-bottom: 45px;
}
.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}
.brand-logo {
  width: 42px;
  height: 42px;
  background: var(--accent-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px var(--accent-soft);
  flex-shrink: 0;
  color: #000;
}
.logo-svg-wrapper {
  width: 26px;
  height: 26px;
}
.brand-name {
  font-size: 22px;
  font-weight: 850;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
.accent-text {
  color: var(--accent-color);
}
.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.status-indicator {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-color);
}
.status-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

/* NAVIGATION */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  margin: 0 -10px;
  padding: 0 10px;
}
.nav-group {
  margin-bottom: 30px;
}
.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-left: 10px;
}
.group-title {
  font-size: 11px;
  font-weight: 900;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.5;
}
.group-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
  opacity: 0.5;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  border-radius: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.25s ease;
  margin-bottom: 5px;
  position: relative;
}
.nav-link:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}
.nav-link.router-link-active {
  background: var(--accent-soft);
  color: var(--accent-color);
}
.nav-icon-wrapper {
  font-size: 20px;
  width: 24px;
  text-align: center;
}
.nav-text {
  font-size: 15px;
  font-weight: 600;
}
.active-indicator {
  position: absolute;
  left: 0;
  width: 4px;
  height: 0;
  background: var(--accent-color);
  border-radius: 0 4px 4px 0;
  transition: 0.3s;
}
.router-link-active .active-indicator {
  height: 20px;
}

/* FOOTER */
.sidebar-footer {
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px; /* Додав gap для безпеки */
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}
.avatar-circle {
  width: 40px;
  height: 40px;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--accent-color);
  position: relative;
  flex-shrink: 0;
}
.online-badge {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid var(--bg-sidebar);
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-display-name {
  font-size: 14px;
  font-weight: 750;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-status-rank {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-action-btn {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: 0.3s;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.sidebar-action-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
  transform: rotate(15deg);
}

/* SETTINGS MODAL INTERNAL STYLE */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 10px 0;
}
.settings-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-row.inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-bg);
  padding: 15px;
  border-radius: 16px;
}
.setting-label {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

/* MEDIA QUERIES */
@media (max-width: 768px) {
  .mobile-burger {
    display: flex;
  }
  .sidebar {
    left: -280px;
    width: 280px !important;
  }
  .sidebar.is-mobile-open {
    left: 0;
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
  }

  :deep(.modal-content) {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
