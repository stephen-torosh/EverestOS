import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useSwsmStore } from '@/stores/swsmStore'
import { useSystemStore } from '@/stores/systemStore'

const XP_PER_LEVEL = 300
const MAX_ACTIVITY_ITEMS = 18
const MAX_MISSION_HISTORY_ITEMS = 24

const STORAGE_KEYS = {
  activity: 'everest.user.activity',
  missions: 'everest.user.completedMissions',
  playtime: 'everest.user.playtimeSeconds',
  sessionId: 'everest.user.sessionId',
  encryptionKey: 'everest.user.encryptionKey',
}

let playtimeIntervalId = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJsonStorage(key, fallback) {
  if (!canUseStorage()) return fallback
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : fallback
}

function writeJsonStorage(key, value) {
  if (!canUseStorage()) return
  localStorage.setItem(key, JSON.stringify(value))
}

function readStringStorage(key, fallback) {
  if (!canUseStorage()) return fallback
  return localStorage.getItem(key) || fallback
}

function writeStringStorage(key, value) {
  if (!canUseStorage()) return
  localStorage.setItem(key, value)
}

function formatPlaytime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)

  return `${hours}h ${minutes}m`
}

function createToken(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().split('-')[0].toUpperCase()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export const useUserStore = defineStore('user', () => {
  const knowledgeStore = useKnowledgeStore()
  const swsmStore = useSwsmStore()
  const systemStore = useSystemStore()

  const profile = ref({
    agentId: 'EVR-001',
    initials: 'UA',
    callSign: 'UA-01',
    joinedAt: '2049-11-02T08:00:00.000Z',
  })

  const recentActivity = ref(readJsonStorage(STORAGE_KEYS.activity, []))
  const completedMissions = ref(readJsonStorage(STORAGE_KEYS.missions, []))
  const playtimeSeconds = ref(Number(readStringStorage(STORAGE_KEYS.playtime, '0')) || 0)
  const sessionId = ref(readStringStorage(STORAGE_KEYS.sessionId, createToken('SESSION')))
  const encryptionKey = ref(readStringStorage(STORAGE_KEYS.encryptionKey, createToken('EVRKEY')))

  writeStringStorage(STORAGE_KEYS.sessionId, sessionId.value)
  writeStringStorage(STORAGE_KEYS.encryptionKey, encryptionKey.value)

  if (!playtimeIntervalId) {
    let previousTick = Date.now()

    playtimeIntervalId = setInterval(() => {
      const now = Date.now()
      const secondsPassed = Math.max(1, Math.floor((now - previousTick) / 1000))

      playtimeSeconds.value += secondsPassed
      previousTick = now

      writeStringStorage(STORAGE_KEYS.playtime, String(playtimeSeconds.value))
    }, 1000)
  }

  const displayName = computed(() => systemStore.t('user.name'))
  const totalXp = computed(() => {
    return knowledgeStore.nodes
      .filter((node) => node.status === 'mastered')
      .reduce((sum, node) => sum + node.xp, 0)
  })
  const level = computed(() => Math.max(1, Math.floor(totalXp.value / XP_PER_LEVEL) + 1))
  const currentLevelXpFloor = computed(() => (level.value - 1) * XP_PER_LEVEL)
  const nextLevelXp = computed(() => level.value * XP_PER_LEVEL)
  const xpToNextLevel = computed(() => Math.max(0, nextLevelXp.value - totalXp.value))
  const levelProgress = computed(() => {
    const progressIntoLevel = totalXp.value - currentLevelXpFloor.value
    return Math.min(100, Math.round((progressIntoLevel / XP_PER_LEVEL) * 100))
  })

  const masteredNodes = computed(() => {
    return knowledgeStore.nodes.filter((node) => node.status === 'mastered').length
  })
  const availableNodes = computed(() => {
    return knowledgeStore.nodes.filter((node) => node.status === 'available').length
  })
  const lockedNodes = computed(() => {
    return knowledgeStore.nodes.filter((node) => node.status === 'locked').length
  })
  const activityCount = computed(() => recentActivity.value.length)

  const rankTitlePath = computed(() => {
    if (level.value >= 4) return 'profile.rankTitles.commander'
    if (level.value >= 2) return 'profile.rankTitles.operator'
    return 'profile.rankTitles.trainee'
  })

  const rankLabel = computed(() => {
    return `${systemStore.t('profile.levelLabel')} ${level.value}: ${systemStore.t(rankTitlePath.value)}`
  })

  const rankProgressIcon = computed(() => {
    if (levelProgress.value >= 80) return '▲▲'
    if (levelProgress.value >= 45) return '▲'
    return '△'
  })

  const currentWorld = computed(() => {
    return swsmStore.worlds.find((world) => world.id === swsmStore.activeWorldId) || null
  })
  const currentSection = computed(() => {
    return swsmStore.sections.find((section) => section.id === swsmStore.activeSectionId) || null
  })

  const currentWorldName = computed(() => {
    return currentWorld.value?.name || systemStore.t('profile.noContext')
  })
  const networkStatusLabel = computed(() => {
    return `${systemStore.t('profile.networkStatusPrefix')}: ${currentWorldName.value}`
  })

  const missionsInCurrentSection = computed(() => swsmStore.activeMissions.length)
  const skillProfileEntries = computed(() => {
    return Object.entries(knowledgeStore.skillProfile)
      .map(([type, xp]) => ({ type, xp }))
      .sort((left, right) => right.xp - left.xp)
  })

  function scoreFromNodes(nodeIds) {
    const targetNodes = knowledgeStore.nodes.filter((node) => nodeIds.includes(node.id))
    if (!targetNodes.length) return 0

    const totalBucketXp = targetNodes.reduce((sum, node) => sum + node.xp, 0)
    const weightedXp = targetNodes.reduce((sum, node) => {
      if (node.status === 'mastered') return sum + node.xp
      if (node.status === 'available') return sum + node.xp * 0.6
      return sum + node.xp * 0.25
    }, 0)

    return Math.round((weightedXp / totalBucketXp) * 100)
  }

  const specializationRadar = computed(() => [
    {
      key: 'css',
      labelPath: 'profile.radarAxes.css',
      value: scoreFromNodes(['css', 'flex', 'animations']),
    },
    {
      key: 'js',
      labelPath: 'profile.radarAxes.js',
      value: scoreFromNodes(['js-base', 'dom', 'async']),
    },
    {
      key: 'architecture',
      labelPath: 'profile.radarAxes.architecture',
      value: scoreFromNodes(['vue-core', 'pinia', 'vite', 'deploy']),
    },
    {
      key: 'logic',
      labelPath: 'profile.radarAxes.logic',
      value: scoreFromNodes(['html', 'git']),
    },
  ])

  const unlockedTitles = computed(() => {
    const mastered = new Set(
      knowledgeStore.nodes.filter((node) => node.status === 'mastered').map((node) => node.id)
    )

    const rules = [
      {
        id: 'flex-master',
        titlePath: 'profile.titleCatalog.flexMaster',
        unlocked: mastered.has('flex'),
      },
      {
        id: 'semantic-architect',
        titlePath: 'profile.titleCatalog.semanticArchitect',
        unlocked: mastered.has('html') && mastered.has('css'),
      },
      {
        id: 'system-operator',
        titlePath: 'profile.titleCatalog.systemOperator',
        unlocked: mastered.has('js-base') || mastered.has('dom') || mastered.has('async'),
      },
      {
        id: 'framework-commander',
        titlePath: 'profile.titleCatalog.frameworkCommander',
        unlocked: mastered.has('vue-core') || mastered.has('pinia'),
      },
    ]

    return rules.filter((rule) => rule.unlocked).map((rule) => ({
      ...rule,
      label: systemStore.t(rule.titlePath),
    }))
  })

  const highlightAchievements = computed(() => {
    const iconByType = {
      core: '◎',
      tool: '◈',
      design: '✦',
      framework: '▦',
    }

    return knowledgeStore.nodes
      .filter((node) => node.status === 'mastered')
      .sort((left, right) => right.xp - left.xp)
      .slice(0, 5)
      .map((node) => ({
        id: node.id,
        icon: iconByType[node.type] || '◆',
        title: node.label,
        xp: node.xp,
      }))
  })

  const completedMissionPreview = computed(() => completedMissions.value.slice(0, 3))
  const totalPlaytimeLabel = computed(() => formatPlaytime(playtimeSeconds.value))

  const theoNotes = computed(() => {
    const efficiencyGain = Math.min(38, 10 + activityCount.value * 2 + Math.round(levelProgress.value / 10))

    return [
      `${systemStore.t('profile.theoNotes.efficiencyPrefix')} ${efficiencyGain}% ${systemStore.t('profile.theoNotes.efficiencySuffix')}`,
      `${systemStore.t('profile.theoNotes.currentLevelPrefix')} ${systemStore.t(rankTitlePath.value)}.`,
      systemStore.t('profile.theoNotes.activityCadence'),
    ]
  })

  function persistActivity() {
    writeJsonStorage(STORAGE_KEYS.activity, recentActivity.value)
  }

  function persistCompletedMissions() {
    writeJsonStorage(STORAGE_KEYS.missions, completedMissions.value)
  }

  function appendActivity(entry) {
    recentActivity.value = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...recentActivity.value,
    ].slice(0, MAX_ACTIVITY_ITEMS)

    persistActivity()
  }

  function recordMissionStarted(mission) {
    const section = swsmStore.sections.find((item) => item.id === mission.sectionId) || currentSection.value
    const world = swsmStore.worlds.find((item) => item.id === section?.worldId) || currentWorld.value

    appendActivity({
      type: 'mission-started',
      title: mission.title,
      detail: [world?.name, section?.name].filter(Boolean).join(' / '),
    })
  }

  function recordMissionCompleted(mission) {
    const section = swsmStore.sections.find((item) => item.id === mission.sectionId) || currentSection.value
    const world = swsmStore.worlds.find((item) => item.id === section?.worldId) || currentWorld.value
    const completedAt = new Date().toISOString()

    completedMissions.value = [
      {
        id: `${mission.id}-${completedAt}`,
        missionId: mission.id,
        title: mission.title,
        completedAt,
        worldName: world?.name || '',
        sectionName: section?.name || '',
      },
      ...completedMissions.value,
    ].slice(0, MAX_MISSION_HISTORY_ITEMS)

    persistCompletedMissions()

    appendActivity({
      type: 'mission-completed',
      title: mission.title,
      detail: [world?.name, section?.name].filter(Boolean).join(' / '),
    })
  }

  function recordSectionVisited(sectionId) {
    const section = swsmStore.sections.find((item) => item.id === sectionId)

    if (!section) {
      console.error(`Section not found: ${sectionId}`)
      return
    }

    const world = swsmStore.worlds.find((item) => item.id === section.worldId) || currentWorld.value

    appendActivity({
      type: 'section-visited',
      title: section.name,
      detail: world?.name || '',
    })
  }

  function recordKnowledgeMastered(node) {
    appendActivity({
      type: 'knowledge-mastered',
      title: node.label,
      detail: `+${node.xp} XP`,
    })
  }

  function recordKnowledgeUnlocked(node) {
    appendActivity({
      type: 'knowledge-unlocked',
      title: node.label,
      detail: node.type,
    })
  }

  return {
    profile,
    recentActivity,
    completedMissions,
    displayName,
    totalXp,
    level,
    xpToNextLevel,
    levelProgress,
    rankLabel,
    rankProgressIcon,
    masteredNodes,
    availableNodes,
    lockedNodes,
    activityCount,
    currentWorld,
    currentSection,
    currentWorldName,
    networkStatusLabel,
    missionsInCurrentSection,
    skillProfileEntries,
    specializationRadar,
    unlockedTitles,
    highlightAchievements,
    completedMissionPreview,
    totalPlaytimeLabel,
    sessionId,
    encryptionKey,
    theoNotes,
    recordMissionStarted,
    recordMissionCompleted,
    recordSectionVisited,
    recordKnowledgeMastered,
    recordKnowledgeUnlocked,
  }
})
