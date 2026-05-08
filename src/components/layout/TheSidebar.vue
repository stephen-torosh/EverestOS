<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
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
          
          <RouterLink to="/" class="nav-link">
            <div class="nav-icon">◎</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.dashboard') }}</span>
          </RouterLink>

          <RouterLink to="/stages" class="nav-link">
            <div class="nav-icon">◈</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.stages') }}</span>
          </RouterLink>

          <RouterLink to="/missions" class="nav-link">
            <div class="nav-icon">▣</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.missions') }}</span>
          </RouterLink>
        </div>

        <div class="nav-group" style="margin-top: 25px;">
          <div class="group-header" v-if="!isCollapsed">
            <span class="group-title">{{ systemStore.t('menu.evolution') }}</span>
            <div class="group-line"></div>
          </div>
          <RouterLink to="/achievements" class="nav-link">
            <div class="nav-icon">▤</div>
            <span v-if="!isCollapsed">{{ systemStore.t('menu.advancements') }}</span>
          </RouterLink>
        </div>
      </nav>


      <!-- FOOTER -->
      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar-circle">
            UA
            <div class="online-badge"></div>
          </div>
          
        <div class="user-meta" v-if="!isCollapsed">
          <span class="user-name">{{ systemStore.t('user.name') }}</span>
          <span class="user-rank">{{ systemStore.t('user.rank') }}</span>
        </div>
        </div>
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
          v-model="systemStore.currentLanguage" 
          :options="languageOptions" 
        />
      </div>

      <!-- Вибір теми -->
      <div class="settings-row">
        <span class="setting-label">{{ systemStore.t('settings.theme') }}</span>
        <BaseSelectGroup 
          v-model="systemStore.systemTheme" 
          :options="themeOptions" 
        />
      </div>

      <!-- Вибір акценту -->
      <div class="settings-row">
        <span class="setting-label">{{ systemStore.t('settings.accent') }}</span>
        <BaseAccentPicker 
          v-model="systemStore.accentColor" 
        />
      </div>
      
      <div class="settings-row-inline">
        <span class="setting-label">{{ systemStore.t('settings.performance') }}</span>
        <div class="toggle-placeholder">
          <span :style="{ color: systemStore.animationsEnabled ? 'var(--accent-color)' : 'gray' }">
            {{ systemStore.animationsEnabled ? 'ON' : 'OFF' }}
          </span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useSystemStore } from '@/stores/systemStore'

// Імпортуємо всі необхідні компоненти
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import BaseAccentPicker from '@/components/ui/BaseAccentPicker.vue'

const systemStore = useSystemStore()

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

const themeOptions = [
  { label: systemStore.t('settings.themset.dark'), value: 'dark' },
  { label: systemStore.t('settings.themset.light'), value: 'light' },
  { label: systemStore.t('settings.themset.system'), value: 'system' },
]
</script>

<style scoped>
/* ОСНОВНИЙ САЙДБАР */
.sidebar {
  width: 280px;
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.is-collapsed { width: 80px; }

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px 24px;
  box-sizing: border-box;
}

/* HEADER & STATUS */
.sidebar-header { margin-bottom: 40px; }
.brand-wrapper { display: flex; align-items: center; gap: 14px; }
.brand-logo { 
  width: 44px; height: 44px; background: var(--accent-color); border-radius: 12px; 
  display: flex; align-items: center; justify-content: center; color: #000; flex-shrink: 0;
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
.sidebar-nav { flex: 1; overflow-y: auto; margin: 0 -10px; padding: 0 10px; }
.group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; margin-top: 10px; }
.group-title { font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; }
.group-line { flex: 1; height: 1px; background: var(--border-color); }

.nav-link {
  display: flex; align-items: center; gap: 14px; padding: 12px 16px;
  border-radius: 12px; color: var(--text-secondary); text-decoration: none;
  margin-bottom: 4px; transition: 0.2s;
}
.nav-link:hover { background: var(--glass-bg); color: var(--text-primary); }
.nav-link.router-link-active { background: var(--accent-soft); color: var(--accent-color); font-weight: 600; }
.nav-icon { font-size: 20px; width: 24px; text-align: center; }

/* FOOTER & USER */
.sidebar-footer { 
  margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-color); 
  display: flex; align-items: center; justify-content: space-between; 
}
.user-profile { display: flex; align-items: center; gap: 12px; }
.avatar-circle { 
  width: 40px; height: 40px; background: var(--glass-bg); border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; font-weight: 800; 
  color: var(--accent-color); position: relative; font-size: 13px;
}
.online-badge { 
  width: 10px; height: 10px; background: #22c55e; border: 2px solid var(--bg-sidebar); 
  border-radius: 50%; position: absolute; bottom: 0; right: 0; 
}
.user-name { font-size: 14px; font-weight: 700; color: var(--text-primary); display: block; line-height: 1.2; }
.user-rank { font-size: 11px; color: var(--text-secondary); }

.settings-btn { 
  background: none; border: none; font-size: 20px; cursor: pointer; 
  opacity: 0.6; transition: 0.3s; padding: 5px;
}
.settings-btn:hover { opacity: 1; transform: rotate(45deg); }

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
    /* Можна додати плавний виїзд, якщо потім захочеш зробити кнопку "бургер" */
    transition: transform 0.3s ease;
  }

  /* Якщо ти захочеш відкрити його на мобілці, 
     додамо клас, який повертатиме його на місце */
  .sidebar.is-mobile-open {
    transform: translateX(0);
  }
}
</style>