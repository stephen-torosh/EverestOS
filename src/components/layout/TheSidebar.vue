<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed, 'is-mobile-open': isMobileOpen }">
    <div class="sidebar-inner">
      <!-- HEADER -->
      <div class="sidebar-header">
        <div class="brand-wrapper">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" class="logo-icon">
              <path d="M3 20L12 4L21 20H3Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="brand-details" v-if="!isCollapsed">
            <h1 class="brand-name">Everest<span class="accent-text">OS</span></h1>
            <div class="system-status">
              <span class="status-dot"></span>
              <span class="status-label">{{ systemStore.t('system.online') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- NAVIGATION -->
      <nav class="sidebar-nav custom-scroll">
        <div class="nav-group">
          <div class="group-header" v-if="!isCollapsed">
            <span class="group-title">{{ systemStore.t('menu.operations') }}</span>
            <div class="group-line"></div>
          </div>
          
          <RouterLink to="/" class="nav-link" @click="handleNavClick">
            <div class="nav-icon">◎</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.dashboard') }}</span>
          </RouterLink>

          <RouterLink to="/stages" class="nav-link" @click="handleNavClick">
            <div class="nav-icon">◈</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.stages') }}</span>
          </RouterLink>

          <RouterLink to="/missions" class="nav-link" @click="handleNavClick">
            <div class="nav-icon">▣</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.missions') }}</span>
          </RouterLink>
        </div>

        <div class="nav-group" style="margin-top: 25px;">
          <div class="group-header" v-if="!isCollapsed">
            <span class="group-title">{{ systemStore.t('menu.evolution') }}</span>
            <div class="group-line"></div>
          </div>
          <RouterLink to="/achievements" class="nav-link" @click="handleNavClick">
            <div class="nav-icon">▤</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.advancements') }}</span>
          </RouterLink>
          <RouterLink to="/incubator" class="nav-link" @click="handleNavClick">
            <div class="nav-icon">⟡</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.incubator') }}</span>
          </RouterLink>
        </div>
      </nav>


      <!-- FOOTER -->
      <div class="sidebar-footer">
        <RouterLink to="/profile" class="user-profile" :class="{ 'is-active': route.name === 'profile' }" @click="handleNavClick">
          <div class="avatar-circle">
            {{ userStore.profile.initials }}
            <div class="online-badge"></div>
          </div>

          <div class="user-meta" v-if="!isCollapsed">
            <span class="user-name">{{ userStore.displayName }}</span>
            <span class="user-rank">{{ userStore.rankLabel }}</span>
          </div>
        </RouterLink>
        <!-- КНОПКА, ЩО ВІДКРИВАЄ НАЛАШТУВАННЯ -->
        <button class="settings-btn" @click="isSettingsOpen = true" :title="systemStore.t('settings.title')">
          ⚙️
        </button>
      </div>
    </div>
  </aside>

  <!-- МОДАЛЬНЕ ВІКНО НАЛАШТУВАНЬ -->
  <!-- Переконайся, що BaseModal підтримує пропс :show або використовуй v-if -->
  <!-- МОДАЛЬНЕ ВІКНО НАЛАШТУВАНЬ -->
  <BaseModal 
    :show="isSettingsOpen" 
    titlePath="settings.title" 
    @close="isSettingsOpen = false"
  >
    <div class="settings-container">
      <!-- Вибір мови -->
      <div class="settings-row">
        <span class="setting-label">{{ systemStore.t('settings.language') }}</span>
        <BaseSelectGroup 
          v-model="languageModel" 
          :options="languageOptions" 
        />
      </div>

      <!-- Вибір теми -->
      <div class="settings-row">
        <span class="setting-label">{{ systemStore.t('settings.theme') }}</span>
        <BaseSelectGroup 
          v-model="themeModel" 
          :options="themeOptions" 
        />
      </div>

      <!-- Вибір акценту -->
      <div class="settings-row">
        <span class="setting-label">{{ systemStore.t('settings.accent') }}</span>
        <BaseAccentPicker 
          v-model="accentModel" 
        />
      </div>
      
      <div class="settings-row-inline">
        <span class="setting-label">{{ systemStore.t('settings.performance') }}</span>
        <BaseToggle v-model="animationsModel" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'
import { useUserStore } from '@/stores/userStore'

// Імпортуємо всі необхідні компоненти
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import BaseAccentPicker from '@/components/ui/BaseAccentPicker.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'

const props = defineProps({
  isMobileOpen: Boolean,
  isMobileView: Boolean,
})

const emit = defineEmits(['close-mobile'])

const systemStore = useSystemStore()
const userStore = useUserStore()
const route = useRoute()

// Стан модалки
const isSettingsOpen = ref(false)
const isCollapsed = ref(false)

// Опції мов з іконками-прапорами (для Windows)
const languageOptions = [
  { label: 'UA UA', value: 'ua', icon: 'https://flagcdn.com/w40/ua.png' },
  { label: 'US EN', value: 'en', icon: 'https://flagcdn.com/w40/us.png' },
  { label: 'PL PL', value: 'pl', icon: 'https://flagcdn.com/w40/pl.png' },
  { label: 'DE DE', value: 'de', icon: 'https://flagcdn.com/w40/de.png' }
]

const themeOptions = computed(() => [
  { label: systemStore.t('settings.themset.dark'), value: 'dark' },
  { label: systemStore.t('settings.themset.light'), value: 'light' },
  { label: systemStore.t('settings.themset.system'), value: 'system' },
])

const languageModel = computed({
  get: () => systemStore.currentLanguage,
  set: (value) => systemStore.setLanguage(value),
})

const themeModel = computed({
  get: () => systemStore.systemTheme,
  set: (value) => systemStore.setSystemTheme(value),
})

const accentModel = computed({
  get: () => systemStore.accentColor,
  set: (value) => systemStore.setAccentColor(value),
})

const animationsModel = computed({
  get: () => systemStore.animationsEnabled,
  set: (value) => systemStore.setAnimationsEnabled(value),
})

const handleNavClick = () => {
  if (props.isMobileView) emit('close-mobile')
}

watch(
  () => route.fullPath,
  () => {
    if (props.isMobileView && props.isMobileOpen) emit('close-mobile')
  }
)
</script>

<style scoped>
/* ОСНОВНИЙ САЙДБАР */
.sidebar {
  width: 280px;
  height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-sidebar) 95%, #000 5%), var(--bg-sidebar));
  border-right: 1px solid color-mix(in srgb, var(--accent-color) 16%, var(--border-color));
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow:
    inset -1px 0 0 color-mix(in srgb, var(--accent-color) 8%, transparent),
    14px 0 28px rgba(0, 0, 0, 0.22);
}

.sidebar.is-collapsed { width: 80px; }

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 20px;
  box-sizing: border-box;
}

/* HEADER & STATUS */
.sidebar-header { margin-bottom: 28px; }
.brand-wrapper { display: flex; align-items: center; gap: 14px; }
.brand-logo { 
  width: 42px;
  height: 42px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 90%, white 10%), color-mix(in srgb, var(--accent-color) 82%, black 18%));
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center; color: #000; flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--accent-color) 56%, black 44%);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--accent-color) 24%, transparent);
}
.logo-icon { width: 24px; }
.brand-name { font-size: 22px; font-weight: 850; margin: 0; color: var(--text-primary); letter-spacing: -0.5px; }
.accent-text { color: var(--accent-color); }

.system-status { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.status-dot {
  width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}
.status-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); opacity: 0.8; }

/* NAVIGATION */
.sidebar-nav { flex: 1; overflow-y: auto; margin: 0 -8px; padding: 0 8px; }
.group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; margin-top: 8px; }
.group-title { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.62; }
.group-line { flex: 1; height: 1px; background: var(--border-color); }

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 6px;
  background: color-mix(in srgb, var(--bg-main) 97%, transparent);
}
.nav-link:hover {
  border-color: color-mix(in srgb, var(--accent-color) 28%, var(--border-color));
  background: color-mix(in srgb, var(--glass-bg) 88%, transparent);
  color: var(--text-primary);
}
.nav-link.router-link-active {
  border-color: color-mix(in srgb, var(--accent-color) 45%, var(--border-color));
  background: linear-gradient(90deg, color-mix(in srgb, var(--accent-soft) 76%, transparent), transparent 92%);
  color: var(--accent-color);
  font-weight: 700;
}
.nav-icon {
  font-size: 17px;
  width: 22px;
  text-align: center;
  opacity: 0.9;
}

/* FOOTER & USER */
.sidebar-footer { 
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--accent-color) 12%, var(--border-color));
  display: flex; align-items: center; justify-content: space-between; 
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 14px;
  text-decoration: none;
  border: 1px solid transparent;
  background: transparent;
}
.user-profile:hover {
  border-color: color-mix(in srgb, var(--accent-color) 24%, var(--border-color));
  background: color-mix(in srgb, var(--glass-bg) 90%, transparent);
}
.user-profile.is-active {
  border-color: color-mix(in srgb, var(--accent-color) 36%, var(--border-color));
  background: color-mix(in srgb, var(--accent-soft) 80%, transparent);
}
.user-profile.is-active .avatar-circle {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-color);
}
.avatar-circle { 
  width: 40px; height: 40px; background: var(--glass-bg); border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; font-weight: 800; 
  color: var(--accent-color); position: relative; font-size: 13px; border: 1px solid transparent;
}
.online-badge { 
  width: 10px; height: 10px; background: #22c55e; border: 2px solid var(--bg-sidebar); 
  border-radius: 50%; position: absolute; bottom: 0; right: 0; 
}
.user-meta { min-width: 0; }
.user-name { font-size: 14px; font-weight: 700; color: var(--text-primary); display: block; line-height: 1.2; }
.user-rank { font-size: 11px; color: var(--text-secondary); }

.settings-btn { 
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, transparent);
  font-size: 16px;
  cursor: pointer;
  opacity: 0.9;
}
.settings-btn:hover { border-color: var(--accent-color); }

/* МОДАЛКА КОНТЕЙНЕР */
.settings-container { display: flex; flex-direction: column; gap: 24px; padding: 15px 5px; }
.settings-row { display: flex; flex-direction: column; gap: 10px; }
.settings-row-inline { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: var(--glass-bg); border-radius: 12px; }
.setting-label { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

/* Мобільна адаптація */
@media (max-width: 1024px) {
  .sidebar {
    /* Ховаємо його вліво за межі екрану */
    transform: translateX(-100%);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    z-index: 150;
    box-shadow: none;
  }

  .sidebar.is-mobile-open {
    transform: translateX(0);
    box-shadow: 24px 0 60px rgba(0, 0, 0, 0.4);
  }

  .sidebar-inner {
    padding-top: 82px;
  }
}
</style>
