<template>
  <div class="active-world" :class="{ 'tree-active': activeView === 'tree' }">
    <!-- Header and missions content stay inside the constrained page-inner -->
    <div class="page-inner">
      <header class="header-row" :class="{ 'header-slim': activeView === 'tree' }">
        <div class="title-group">
          <BaseText tag="h1" size="h1" weight="bold" class="orbitron">
            {{ currentWorldName }}
          </BaseText>
          <div class="status-line">
            <span class="status-dot"></span>
            <BaseText size="xs" color="secondary" class="uppercase">
              {{ systemStore.t('missions.online') }}
            </BaseText>
          </div>
        </div>
        
        <BaseSelectGroup 
          v-model="activeView"
          :options="viewOptions"
          class="view-selector"
        />
      </header>

      <div v-if="activeView === 'missions'" class="missions-grid">
        <aside class="sidebar-sections">
          <BaseText size="xs" weight="bold" color="secondary" class="label uppercase mb-4">
            {{ systemStore.t('missions.stagesLabel') }}
          </BaseText>
          
          <div class="vertical-nav">
            <BaseSelectGroup 
              v-model="store.activeSectionId"
              :options="sectionOptions"
            />
          </div>
        </aside>

        <main class="missions-content">
          <BaseText size="xs" weight="bold" color="secondary" class="label uppercase mb-4">
            {{ systemStore.t('missions.missionsLabel') }}: {{ currentSectionName }}
          </BaseText>

          <div class="missions-list">
            <BaseCard 
              v-for="m in store.activeMissions" 
              :key="m.id" 
              interactive 
              class="mission-card"
            >
              <div class="mission-layout">
                <div class="text-block">
                  <BaseText tag="h3" weight="bold" size="lg" color="primary">{{ m.title }}</BaseText>
                  <BaseText tag="div" size="sm" color="secondary">{{ m.desc }}</BaseText>
                </div>
                <div class="action-wrap">
                  <BaseButton variant="accent" size="sm" @click="startMission(m.id)" class="action-btn">
                    {{ systemStore.t('missions.start') }}
                  </BaseButton>
                </div>
              </div>
            </BaseCard>

            <div v-if="store.activeMissions.length === 0" class="empty-state">
              <BaseCard padding="xl" style="border-style: dashed; opacity: 0.6; text-align: center;">
                <BaseText color="secondary">{{ systemStore.t('missions.empty') }}</BaseText>
              </BaseCard>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Graph sits outside page-inner so it can stretch full width -->
    <div v-if="activeView === 'tree'" class="graph-full">
      <div class="graph-area">
        <KnowledgeGraph :nodesData="knowledgeStore.nodes" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSwsmStore } from '@/stores/swsmStore'
import { useSystemStore } from '@/stores/systemStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useUserStore } from '@/stores/userStore'

import BaseText from '@/components/ui/BaseText.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph.vue'

const store = useSwsmStore()
const systemStore = useSystemStore()
const knowledgeStore = useKnowledgeStore()
const userStore = useUserStore()

const activeView = ref('missions')

const viewOptions = computed(() => [
  { label: systemStore.t('missions.viewMissions'), value: 'missions' },
  { label: systemStore.t('missions.viewTree'), value: 'tree' }
])

const resolveSectionLabel = (section) => {
  const key = `sections.${section.id}`
  const translated = systemStore.t(key)
  return translated === key ? section.name : translated
}

// Динамічна назва планети/світу
const currentWorldName = computed(() => {
  const world = store.worlds.find(w => w.id === store.activeWorldId)
  return world ? world.name : systemStore.t('world.title')
})

// Опції секцій з перекладом назв
const sectionOptions = computed(() => {
  return store.currentSections.map(s => ({
    label: resolveSectionLabel(s),
    value: s.id
  }))
})

// Назва поточної секції для заголовка
const currentSectionName = computed(() => {
  const section = store.sections.find(s => s.id === store.activeSectionId)
  return section ? resolveSectionLabel(section) : ''
})

watch(
  () => store.activeSectionId,
  (sectionId, previousSectionId) => {
    if (previousSectionId === undefined || sectionId === previousSectionId) return
    userStore.recordSectionVisited(sectionId)
  }
)

const startMission = (id) => {
  const mission = store.missions.find((item) => item.id === id)

  if (!mission) {
    console.error(`Mission not found: ${id}`)
    return
  }

  userStore.recordMissionStarted(mission)
  userStore.recordMissionCompleted(mission)
  console.log('Mission start:', id)
}
</script>

<style scoped>
/* Single-scroll page layout (no nested scroll containers) */
.active-world {
  padding: 0 0 max(8px, env(safe-area-inset-bottom));
  height: 100%;
  overflow-y: auto;
  background: var(--bg-main);
  -webkit-overflow-scrolling: touch;
}

.active-world.tree-active {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.active-world.tree-active .page-inner {
  flex: 0 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 12px;
  border-bottom: 1px solid var(--border-color);
  margin: 0 -20px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-main);
}
.header-slim { margin-bottom: 8px; padding-bottom: 8px; }
.title-group { display: flex; flex-direction: column; }
.status-line { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-color); box-shadow: 0 0 0 4px var(--accent-soft); }

.missions-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding-top: 8px;
}

.sidebar-sections,
.missions-content,
.missions-list {
  overflow: visible;
}

.sidebar-sections { padding: 8px; box-sizing: border-box; }
.missions-content { padding: 8px 0; box-sizing: border-box; }
.missions-list { display: flex; flex-direction: column; gap: 12px; padding: 0; box-sizing: border-box; }

.mission-card { width: 100%; align-self: stretch; display: block; box-sizing: border-box; }
.mission-layout { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.text-block { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.action-wrap { display: flex; align-items: center; flex-shrink: 0; }
.action-btn { min-width: 100px; }

.graph-full {
  width: 100%;
}

.active-world.tree-active .graph-full {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.graph-area {
  width: 100%;
  height: clamp(420px, 70vh, 820px);
  background: var(--surface-color);
}

.active-world.tree-active .graph-area {
  height: 100%;
  min-height: 0;
}

@media (max-width: 768px) {
  .page-inner { padding: 0 12px; }
  .header-row { padding: 8px 12px 10px; margin: 0 -12px 10px; flex-direction: column; align-items: stretch; gap: 10px; }
  .view-selector { align-self: stretch; }
  .missions-grid { grid-template-columns: 1fr; gap: 10px; padding-top: 4px; }
  .sidebar-sections { padding: 4px 0; }
  .missions-content { padding: 4px 0; }
  .missions-list { padding: 0 0 8px; }
  .mission-card { border-radius: 8px; }
  .mission-layout { flex-direction: column; gap: 10px; }
  .action-wrap { width: 100%; }
  .action-btn { min-width: 0; width: 100%; }
  .active-world.tree-active .page-inner { padding-bottom: 0; }
  .active-world.tree-active .header-row {
    margin-bottom: 0;
  }
  .active-world.tree-active .graph-full {
    padding-top: 10px;
  }
  .graph-area { height: 62vh; }
  .active-world.tree-active .graph-area { height: 100%; }
}

@media (max-width: 480px) {
  .page-inner { padding: 0 10px; gap: 6px; }
  .header-row { padding: 8px 10px 10px; margin: 0 -10px 10px; }
  .graph-area { height: 58vh; }
  .active-world.tree-active .graph-full {
    padding-top: 8px;
  }
}
</style>
