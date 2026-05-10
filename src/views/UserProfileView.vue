<template>
  <div class="profile-page">
    <div class="page-inner">
      <header class="page-header">
        <div>
          <BaseText tag="h1" size="h1" weight="bold">{{ systemStore.t('profile.title') }}</BaseText>
          <BaseText size="sm" color="secondary">{{ systemStore.t('profile.subtitle') }}</BaseText>
        </div>
      </header>

      <BaseCard class="id-card">
        <div class="id-card-grid">
          <div class="identity-block">
            <div class="avatar-shell">
              <div class="avatar-core">{{ userStore.profile.initials }}</div>
            </div>

            <div class="identity-copy">
              <BaseText tag="div" size="xl" weight="bold">{{ userStore.displayName }}</BaseText>
              <BaseText size="sm" color="secondary">{{ userStore.networkStatusLabel }}</BaseText>
              <BaseText size="sm" weight="bold" color="accent">
                {{ systemStore.t('profile.agentLabel') }}: {{ userStore.profile.agentId }}
              </BaseText>
            </div>
          </div>

          <div class="rank-block">
            <div class="rank-row">
              <span class="rank-icon">{{ userStore.rankProgressIcon }}</span>
              <BaseText size="lg" weight="bold">{{ userStore.rankLabel }}</BaseText>
            </div>
            <div class="rank-track">
              <div class="rank-fill" :style="{ width: `${userStore.levelProgress}%` }"></div>
            </div>
            <BaseText size="xs" color="secondary">
              {{ systemStore.t('profile.progressLabel') }}: {{ userStore.levelProgress }}%
            </BaseText>
          </div>
        </div>

        <div class="id-metrics">
          <div class="metric-pill">
            <span>{{ systemStore.t('profile.totalXp') }}</span>
            <strong>{{ userStore.totalXp }} XP</strong>
          </div>
          <div class="metric-pill">
            <span>{{ systemStore.t('profile.nextLevel') }}</span>
            <strong>{{ userStore.xpToNextLevel }} XP</strong>
          </div>
          <div class="metric-pill">
            <span>{{ systemStore.t('profile.activityCount') }}</span>
            <strong>{{ userStore.activityCount }}</strong>
          </div>
        </div>
      </BaseCard>

      <div class="middle-grid">
        <BaseCard class="specialization-card">
          <div class="card-head">
            <BaseText tag="h2" size="lg" weight="bold">
              {{ systemStore.t('profile.specializationTitle') }}
            </BaseText>
          </div>

          <div class="specialization-grid">
            <div class="radar-wrap">
              <BaseText size="sm" weight="bold">{{ systemStore.t('profile.radarTitle') }}</BaseText>
              <svg viewBox="0 0 240 240" class="radar-chart" aria-hidden="true">
                <polygon
                  v-for="level in radarLevels"
                  :key="level"
                  :points="buildRadarPoints(level)"
                  class="radar-grid"
                />
                <line
                  v-for="axis in radarAxisLines"
                  :key="axis.id"
                  :x1="radarCenter"
                  :y1="radarCenter"
                  :x2="axis.x"
                  :y2="axis.y"
                  class="radar-axis"
                />
                <polygon :points="radarProfilePoints" class="radar-profile" />
                <circle
                  v-for="point in radarDataPoints"
                  :key="point.id"
                  :cx="point.x"
                  :cy="point.y"
                  r="4"
                  class="radar-dot"
                />
                <text
                  v-for="label in radarLabels"
                  :key="label.id"
                  :x="label.x"
                  :y="label.y"
                  class="radar-label"
                  text-anchor="middle"
                >
                  {{ label.label }}
                </text>
              </svg>
            </div>

            <div class="titles-wrap">
              <BaseText size="sm" weight="bold">{{ systemStore.t('profile.specializationTitles') }}</BaseText>
              <div v-if="userStore.unlockedTitles.length" class="titles-list">
                <div
                  v-for="title in userStore.unlockedTitles"
                  :key="title.id"
                  class="title-chip"
                >
                  {{ title.label }}
                </div>
              </div>
              <BaseText v-else size="sm" color="secondary">
                {{ systemStore.t('profile.noTitles') }}
              </BaseText>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="achievements-card">
          <div class="card-head">
            <BaseText tag="h2" size="lg" weight="bold">
              {{ systemStore.t('profile.achievementsTitle') }}
            </BaseText>
          </div>

          <div class="achievement-shelf">
            <article
              v-for="achievement in userStore.highlightAchievements"
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <BaseText size="sm" weight="bold">{{ achievement.title }}</BaseText>
              <BaseText size="xs" color="secondary">+{{ achievement.xp }} XP</BaseText>
            </article>
          </div>
        </BaseCard>
      </div>

      <div class="journal-grid">
        <BaseCard class="journal-card">
          <div class="card-head with-action">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">
                {{ systemStore.t('profile.activityTitle') }}
              </BaseText>
              <BaseText size="sm" color="secondary">
                {{ systemStore.t('profile.activitySubtitle') }}
              </BaseText>
            </div>

            <BaseButton variant="outline" size="sm" @click="router.push('/missions')">
              {{ systemStore.t('profile.openMissions') }}
            </BaseButton>
          </div>

          <div class="journal-content">
            <section class="mission-log">
              <BaseText size="sm" weight="bold">{{ systemStore.t('profile.lastCompletedMissions') }}</BaseText>

              <div v-if="userStore.completedMissionPreview.length" class="mission-list">
                <article
                  v-for="mission in userStore.completedMissionPreview"
                  :key="mission.id"
                  class="mission-item"
                >
                  <BaseText size="md" weight="bold">{{ mission.title }}</BaseText>
                  <BaseText size="sm" color="secondary">
                    {{ formatMissionContext(mission) }}
                  </BaseText>
                  <BaseText size="xs" color="secondary">{{ formatTimestamp(mission.completedAt) }}</BaseText>
                </article>
              </div>

              <BaseText v-else size="sm" color="secondary">
                {{ systemStore.t('profile.noCompletedMissions') }}
              </BaseText>
            </section>

            <section class="timeline-log">
              <BaseText size="sm" weight="bold">{{ systemStore.t('profile.activityTimeline') }}</BaseText>

              <div v-if="recentEvents.length" class="timeline-list">
                <article v-for="event in recentEvents" :key="event.id" class="timeline-item">
                  <div class="timeline-type">
                    {{ systemStore.t(activityTypeMap[event.type] || 'profile.activityTypes.unknown') }}
                  </div>
                  <div class="timeline-copy">
                    <BaseText size="sm" weight="bold">{{ event.title }}</BaseText>
                    <BaseText v-if="event.detail" size="xs" color="secondary">{{ event.detail }}</BaseText>
                    <BaseText size="xs" color="secondary">{{ formatTimestamp(event.createdAt) }}</BaseText>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </BaseCard>

        <BaseCard class="theo-card">
          <div class="card-head">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">
                {{ systemStore.t('profile.theoNotesTitle') }}
              </BaseText>
              <BaseText size="xs" color="secondary">
                {{ systemStore.t('profile.theoCoreLabel') }}
              </BaseText>
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

      <BaseCard class="technical-card">
        <div class="card-head">
          <BaseText tag="h2" size="lg" weight="bold">
            {{ systemStore.t('profile.technicalDataTitle') }}
          </BaseText>
        </div>

        <div class="technical-grid">
          <div v-for="item in technicalItems" :key="item.label" class="technical-item">
            <BaseText size="xs" color="secondary" weight="bold" class="caps">{{ item.label }}</BaseText>
            <BaseText size="md">{{ item.value }}</BaseText>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useSystemStore } from '@/stores/systemStore'
import { useUserStore } from '@/stores/userStore'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseText from '@/components/ui/BaseText.vue'

const systemStore = useSystemStore()
const userStore = useUserStore()
const router = useRouter()

const radarCenter = 120
const radarRadius = 82
const radarLevels = [25, 50, 75, 100]

const localeMap = {
  ua: 'uk-UA',
  en: 'en-US',
  pl: 'pl-PL',
  de: 'de-DE',
}

const activityTypeMap = {
  'mission-started': 'profile.activityTypes.missionStarted',
  'mission-completed': 'profile.activityTypes.missionCompleted',
  'section-visited': 'profile.activityTypes.sectionVisited',
  'knowledge-mastered': 'profile.activityTypes.knowledgeMastered',
  'knowledge-unlocked': 'profile.activityTypes.knowledgeUnlocked',
}

const recentEvents = computed(() => userStore.recentActivity.slice(0, 6))

const radarAxes = computed(() =>
  userStore.specializationRadar.map((axis) => ({
    ...axis,
    label: systemStore.t(axis.labelPath),
  }))
)

const radarDataPoints = computed(() =>
  radarAxes.value.map((axis, index) => pointOnRadar(index, radarAxes.value.length, axis.value))
)

const radarProfilePoints = computed(() =>
  radarDataPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
)

const radarAxisLines = computed(() =>
  radarAxes.value.map((axis, index) => ({
    id: axis.key,
    ...pointOnRadar(index, radarAxes.value.length, 100),
  }))
)

const radarLabels = computed(() =>
  radarAxes.value.map((axis, index) => ({
    id: axis.key,
    label: axis.label,
    ...pointOnRadar(index, radarAxes.value.length, 115),
  }))
)

const technicalItems = computed(() => [
  {
    label: systemStore.t('profile.joinedOn'),
    value: formatTimestamp(userStore.profile.joinedAt),
  },
  {
    label: systemStore.t('profile.totalPlaytime'),
    value: userStore.totalPlaytimeLabel,
  },
  {
    label: systemStore.t('profile.sessionId'),
    value: userStore.sessionId,
  },
  {
    label: systemStore.t('profile.encryptionKey'),
    value: userStore.encryptionKey,
  },
])

function pointOnRadar(index, total, value) {
  const angle = (-Math.PI / 2) + (index / total) * (Math.PI * 2)
  const ratio = value / 100

  return {
    id: `${index}-${value}`,
    x: radarCenter + Math.cos(angle) * radarRadius * ratio,
    y: radarCenter + Math.sin(angle) * radarRadius * ratio,
  }
}

function buildRadarPoints(level) {
  return radarAxes.value
    .map((_, index) => {
      const point = pointOnRadar(index, radarAxes.value.length, level)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat(localeMap[systemStore.currentLanguage] || 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMissionContext(mission) {
  const details = [mission.worldName, mission.sectionName].filter(Boolean)
  return details.length ? details.join(' / ') : systemStore.t('profile.noContext')
}
</script>

<style scoped>
.profile-page {
  height: 100%;
  overflow-y: auto;
  background: transparent;
}

.page-inner {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.id-card {
  border-color: rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01)),
    var(--glass-bg);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 22px color-mix(in srgb, var(--accent-color) 25%, transparent);
}

.id-card-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 20px;
}

.identity-block {
  display: flex;
  gap: 18px;
  align-items: center;
}

.avatar-shell {
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--accent-color) 25%, transparent);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--accent-color) 58%, transparent),
    0 0 24px color-mix(in srgb, var(--accent-color) 45%, transparent);
  clip-path: polygon(25% 7%, 75% 7%, 93% 50%, 75% 93%, 25% 93%, 7% 50%);
}

.avatar-core {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent-color);
  background: var(--bg-sidebar);
}

.identity-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.rank-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.rank-icon {
  min-width: 44px;
  text-align: center;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--accent-color);
  background: var(--accent-soft);
}

.rank-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.rank-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #ffffff);
}

.id-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.metric-pill {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
}

.metric-pill span {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.metric-pill strong {
  font-size: 1rem;
}

.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 18px;
}

.specialization-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.radar-wrap,
.titles-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radar-chart {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.radar-grid {
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1;
}

.radar-axis {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 1;
}

.radar-profile {
  fill: color-mix(in srgb, var(--accent-color) 32%, transparent);
  stroke: color-mix(in srgb, var(--accent-color) 85%, #ffffff);
  stroke-width: 2;
}

.radar-dot {
  fill: var(--accent-color);
}

.radar-label {
  fill: var(--text-secondary);
  font-size: 10px;
}

.titles-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-chip {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
}

.achievement-shelf {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.achievement-item {
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.achievement-item:hover {
  transform: translateY(-2px);
  border-color: var(--accent-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent-color) 35%, transparent);
}

.achievement-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.3rem;
  color: var(--accent-color);
  border: 1px solid color-mix(in srgb, var(--accent-color) 45%, transparent);
  background: color-mix(in srgb, var(--accent-color) 20%, transparent);
}

.journal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 18px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.with-action {
  gap: 12px;
  align-items: flex-start;
}

.journal-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.mission-log,
.timeline-log {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mission-list,
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mission-item,
.timeline-item,
.theo-note {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
}

.timeline-item {
  display: flex;
  gap: 10px;
}

.timeline-type {
  flex-shrink: 0;
  min-width: 110px;
  border-radius: 999px;
  align-self: flex-start;
  font-size: 0.67rem;
  padding: 4px 8px;
  color: var(--accent-color);
  background: var(--accent-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.timeline-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.theo-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.theo-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--accent-color);
  background: var(--accent-soft);
  flex-shrink: 0;
}

.technical-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.technical-item {
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.caps {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 1100px) {
  .middle-grid,
  .journal-grid,
  .specialization-grid,
  .journal-content,
  .technical-grid {
    grid-template-columns: 1fr;
  }

  .id-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .page-inner {
    padding: 18px 12px 24px;
  }

  .id-metrics {
    grid-template-columns: 1fr;
  }

  .achievement-shelf {
    grid-template-columns: 1fr;
  }
}
</style>
