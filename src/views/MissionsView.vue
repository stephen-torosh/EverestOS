<template>
  <div class="active-world">
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

    <div v-if="activeView === 'tree'" class="graph-full">
      <div class="graph-area">
        <KnowledgeGraph :nodesData="knowledgeStore.nodes" />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSwsmStore } from '@/stores/swsmStore'
import { useSystemStore } from '@/stores/systemStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'

import BaseText from '@/components/ui/BaseText.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph.vue'

const store = useSwsmStore()
const systemStore = useSystemStore()
const knowledgeStore = useKnowledgeStore()

const activeView = ref('missions')

const viewOptions = computed(() => [
  { label: systemStore.t('missions.viewMissions'), value: 'missions' },
  { label: systemStore.t('missions.viewTree'), value: 'tree' }
])

// Динамічна назва планети/світу
const currentWorldName = computed(() => {
  const world = store.worlds.find(w => w.id === store.activeWorldId)
  return world ? world.name : systemStore.t('world.title')
})

// Опції секцій з перекладом назв
const sectionOptions = computed(() => {
  return store.currentSections.map(s => ({
    label: systemStore.t(`sections.${s.id}`) || s.name,
    value: s.id
  }))
})

// Назва поточної секції для заголовка
const currentSectionName = computed(() => {
  const section = store.sections.find(s => s.id === store.activeSectionId)
  return section ? (systemStore.t(`sections.${section.id}`) || section.name) : ''
})

const startMission = (id) => console.log('Mission start:', id)
</script>

<style scoped>
/* Compact layout with scrollable missions list and inner padding */
.active-world { padding: 8px 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-main); }
.header-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
.header-slim { margin-bottom: 8px; padding-bottom: 8px; }
.title-group { display: flex; flex-direction: column; }

.missions-grid { display: grid; grid-template-columns: 240px 1fr; gap: 24px; flex: 1; min-height: 0; padding-top: 8px; }

.sidebar-sections { overflow-y: auto; padding: 8px; box-sizing: border-box; }

.missions-content { overflow: hidden; min-height: 0; padding: 8px 0; box-sizing: border-box; }

.missions-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 0; box-sizing: border-box; flex: 1; min-height: 0; }

.mission-card { width: 100%; align-self: stretch; display: block; box-sizing: border-box; }

.graph-full { flex: 1; min-height: 0; }
.graph-area { height: 100%; width: 100%; border-radius: 12px; background: var(--surface-color); }
.action-btn { min-width: 100px; }

/* Inner centered container to provide gutters and constrain content width */
.page-inner { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0; }

/* Responsive: stack sidebar above content on narrow screens */
@media (max-width: 768px) {
  .page-inner { padding: 0 12px; }

  .header-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .view-selector { align-self: flex-end; }

  .missions-grid { grid-template-columns: 1fr; gap: 12px; padding-top: 6px; }

  .sidebar-sections { padding: 6px 0; }
  .missions-content { padding: 6px 0; }

  .missions-list { padding: 6px; }

  .mission-card { border-radius: 8px; }
  .action-btn { min-width: 80px; }
}
</style>
