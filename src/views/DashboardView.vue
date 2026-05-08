<template>
  <div class="dashboard-page">
    <div class="page-inner">
      <header class="page-header">
        <div class="header-copy">
          <BaseText tag="h1" size="h1" weight="bold">{{ systemStore.t('dashboard.title') }}</BaseText>
          <BaseText size="sm" color="secondary">{{ systemStore.t('dashboard.subtitle') }}</BaseText>
        </div>

        <div class="status-line">
          <span class="status-dot"></span>
          <BaseText size="xs" weight="bold" color="secondary">{{ userStore.networkStatusLabel }}</BaseText>
        </div>
      </header>

      <BaseCard class="hero-card">
        <div class="hero-grid">
          <div class="hero-copy">
            <BaseText size="xs" weight="bold" color="accent" class="caps">
              {{ systemStore.t('dashboard.commandCenter') }}
            </BaseText>
            <BaseText tag="h2" size="xl" weight="bold">{{ currentWorldName }}</BaseText>
            <BaseText size="sm" color="secondary">{{ activeSectionName }}</BaseText>
            <BaseText size="sm">{{ theoHeadline }}</BaseText>

            <div class="action-row">
              <BaseButton variant="accent" @click="router.push('/missions')">
                {{ systemStore.t('dashboard.openMissions') }}
              </BaseButton>
              <BaseButton variant="outline" @click="router.push('/profile')">
                {{ systemStore.t('dashboard.openProfile') }}
              </BaseButton>
              <BaseButton variant="primary" @click="router.push('/achievements')">
                {{ systemStore.t('dashboard.openEvolution') }}
              </BaseButton>
            </div>
          </div>

          <div class="hero-side">
            <div class="hero-pill">
              <span>{{ systemStore.t('dashboard.nextMission') }}</span>
              <strong>{{ activeMission?.title || systemStore.t('dashboard.noMission') }}</strong>
            </div>
            <div class="hero-pill">
              <span>{{ systemStore.t('profile.levelLabel') }}</span>
              <strong>{{ userStore.rankLabel }}</strong>
            </div>
            <div class="hero-pill">
              <span>{{ systemStore.t('dashboard.totalProgress') }}</span>
              <strong>{{ knowledgeStore.totalProgress }}%</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      <div class="metrics-grid">
        <BaseCard v-for="item in metricCards" :key="item.label" class="metric-card">
          <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ item.label }}</BaseText>
          <BaseText size="xl" weight="bold">{{ item.value }}</BaseText>
          <BaseText size="sm" color="secondary">{{ item.detail }}</BaseText>
        </BaseCard>
      </div>

      <div class="content-grid">
        <BaseCard class="mission-card">
          <div class="card-head">
            <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('dashboard.missionQueue') }}</BaseText>
          </div>

          <div class="mission-list">
            <article v-for="mission in activeMissionsPreview" :key="mission.id" class="mission-item">
              <div>
                <BaseText size="md" weight="bold">{{ mission.title }}</BaseText>
                <BaseText size="sm" color="secondary">{{ mission.desc }}</BaseText>
              </div>
              <BaseButton variant="outline" size="sm" @click="router.push('/missions')">
                {{ systemStore.t('missions.start') }}
              </BaseButton>
            </article>
          </div>
        </BaseCard>

        <BaseCard class="intel-card">
          <div class="card-head">
            <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('dashboard.activeKnowledge') }}</BaseText>
          </div>

          <div class="intel-list">
            <article v-for="node in availableNodes" :key="node.id" class="intel-item">
              <BaseText size="md" weight="bold">{{ node.label }}</BaseText>
              <BaseText size="sm" color="secondary">+{{ node.xp }} XP</BaseText>
            </article>
          </div>
        </BaseCard>

        <BaseCard class="theo-card">
          <div class="card-head">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('dashboard.theoTitle') }}</BaseText>
              <BaseText size="xs" color="secondary">{{ systemStore.t('profile.theoCoreLabel') }}</BaseText>
            </div>
          </div>

          <div class="theo-list">
            <article v-for="note in userStore.theoNotes" :key="note" class="theo-note">
              <span class="theo-badge">T</span>
              <BaseText size="sm">{{ note }}</BaseText>
            </article>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseText from '@/components/ui/BaseText.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useSwsmStore } from '@/stores/swsmStore'
import { useSystemStore } from '@/stores/systemStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const systemStore = useSystemStore()
const userStore = useUserStore()
const swsmStore = useSwsmStore()
const knowledgeStore = useKnowledgeStore()

const currentWorldName = computed(() => swsmStore.currentWorld?.name || systemStore.t('world.title'))
const activeSectionName = computed(() => {
  return swsmStore.sections.find((section) => section.id === swsmStore.activeSectionId)?.name || systemStore.t('profile.noContext')
})
const activeMission = computed(() => swsmStore.activeMissions[0] || null)
const activeMissionsPreview = computed(() => swsmStore.activeMissions.slice(0, 4))
const availableNodes = computed(() => knowledgeStore.nodes.filter((node) => node.status === 'available').slice(0, 4))
const theoHeadline = computed(() => userStore.theoNotes[0] || systemStore.t('dashboard.fallbackTheo'))

const metricCards = computed(() => [
  {
    label: systemStore.t('dashboard.completedMissions'),
    value: userStore.completedMissions.length,
    detail: systemStore.t('dashboard.completedMissionsDetail'),
  },
  {
    label: systemStore.t('dashboard.worldsOnline'),
    value: swsmStore.worlds.length,
    detail: systemStore.t('dashboard.worldsOnlineDetail'),
  },
  {
    label: systemStore.t('dashboard.masteredNodes'),
    value: userStore.masteredNodes,
    detail: systemStore.t('dashboard.masteredNodesDetail'),
  },
  {
    label: systemStore.t('dashboard.liveOperations'),
    value: swsmStore.activeMissions.length,
    detail: systemStore.t('dashboard.liveOperationsDetail'),
  },
])
</script>

<style scoped>
.dashboard-page {
  height: 100%;
  overflow-y: auto;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 30%),
    var(--bg-main);
}

.page-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-header,
.status-line,
.hero-grid,
.action-row,
.content-grid,
.mission-item,
.theo-note {
  display: flex;
}

.page-header,
.hero-grid,
.mission-item {
  align-items: center;
  justify-content: space-between;
}

.header-copy,
.hero-copy,
.hero-side,
.mission-list,
.intel-list,
.theo-list {
  display: flex;
  flex-direction: column;
}

.header-copy,
.hero-copy,
.hero-side,
.mission-list,
.intel-list,
.theo-list {
  gap: 8px;
}

.status-line {
  gap: 8px;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.hero-card {
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    var(--glass-bg);
  border-color: rgba(255, 255, 255, 0.12);
}

.hero-grid {
  gap: 24px;
}

.hero-copy {
  max-width: 680px;
}

.action-row {
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.hero-side {
  min-width: 280px;
}

.hero-pill,
.mission-item,
.intel-item,
.theo-note,
.metric-card {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.hero-pill {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-pill span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.caps {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(280px, 0.8fr);
  gap: 16px;
}

.card-head {
  margin-bottom: 12px;
}

.mission-list,
.intel-list,
.theo-list {
  gap: 10px;
}

.mission-item,
.intel-item,
.theo-note {
  padding: 12px;
}

.mission-item {
  gap: 14px;
}

.intel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theo-note {
  gap: 10px;
  align-items: flex-start;
}

.theo-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--accent-color);
  background: var(--accent-soft);
  font-weight: 700;
}

@media (max-width: 1080px) {
  .metrics-grid,
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }

  .hero-grid {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  .page-inner {
    padding: 18px 12px 24px;
  }

  .page-header,
  .mission-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .metrics-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
