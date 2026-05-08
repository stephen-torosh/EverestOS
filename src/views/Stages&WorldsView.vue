<template>
  <div class="stages-page">
    <div class="map-layout">
      <section class="map-pane">
        <header class="map-toolbar">
          <div class="toolbar-copy">
            <BaseText tag="h1" size="h1" weight="bold">{{ systemStore.t('stagesView.title') }}</BaseText>
            <BaseText size="sm" color="secondary">{{ systemStore.t('stagesView.subtitle') }}</BaseText>
          </div>

          <div class="toolbar-meta">
            <BaseText size="xs" color="secondary">
              {{ interactionHint }}
            </BaseText>
            <BaseButton variant="outline" size="sm" @click="resetCamera">
              Reset View
            </BaseButton>
          </div>
        </header>

        <div
          ref="mapViewportRef"
          class="map-viewport"
          :class="{ 'is-dragging': isDragging }"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @wheel.prevent="onWheel"
          @dblclick="onDoubleClick"
        >
          <svg class="solar-map" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-label="Stages and Worlds">
            <defs>
              <radialGradient id="planet-sun" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#fff6bf" />
                <stop offset="45%" stop-color="#ffcd57" />
                <stop offset="100%" stop-color="#ef8618" />
              </radialGradient>
              <radialGradient id="planet-mercury" cx="35%" cy="30%">
                <stop offset="0%" stop-color="#f3f5fb" />
                <stop offset="100%" stop-color="#8d96a4" />
              </radialGradient>
              <radialGradient id="planet-venus" cx="35%" cy="30%">
                <stop offset="0%" stop-color="#ffe2a1" />
                <stop offset="100%" stop-color="#cb8e3e" />
              </radialGradient>
              <radialGradient id="planet-earth" cx="35%" cy="30%">
                <stop offset="0%" stop-color="#99dbff" />
                <stop offset="100%" stop-color="#3169ce" />
              </radialGradient>
              <radialGradient id="planet-moon" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#f0f3f9" />
                <stop offset="100%" stop-color="#8f97a7" />
              </radialGradient>
              <radialGradient id="planet-mars" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#ffb190" />
                <stop offset="100%" stop-color="#b84935" />
              </radialGradient>
              <linearGradient id="planet-jupiter" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#ead7bb" />
                <stop offset="24%" stop-color="#cfad83" />
                <stop offset="48%" stop-color="#f0dfc5" />
                <stop offset="70%" stop-color="#bf976d" />
                <stop offset="100%" stop-color="#e1c7ab" />
              </linearGradient>
              <linearGradient id="planet-saturn" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#f4e2b4" />
                <stop offset="100%" stop-color="#bc9150" />
              </linearGradient>
              <radialGradient id="planet-uranus" cx="35%" cy="30%">
                <stop offset="0%" stop-color="#d9fbff" />
                <stop offset="100%" stop-color="#77b6ce" />
              </radialGradient>
              <radialGradient id="planet-neptune" cx="35%" cy="30%">
                <stop offset="0%" stop-color="#b7c9ff" />
                <stop offset="100%" stop-color="#5770c9" />
              </radialGradient>
            </defs>

            <rect class="space-backdrop" x="0" y="0" width="1600" height="900" rx="24" />

            <circle
              v-for="star in starField"
              :key="star.id"
              class="star-dot"
              :cx="star.x"
              :cy="star.y"
              :r="star.r"
              :opacity="star.opacity"
            />

            <g :transform="sceneTransform">
              <circle
                v-for="track in solarOrbitTracks"
                :key="track.id"
                class="solar-orbit-track"
                :cx="track.cx"
                :cy="track.cy"
                :r="track.r"
              />

              <circle class="asteroid-belt-track" :cx="solarCenter.x" :cy="solarCenter.y" :r="asteroidBeltRadius" />

              <circle
                v-for="track in worldOrbitTracks"
                :key="track.id"
                class="world-orbit-track"
                :cx="track.cx"
                :cy="track.cy"
                :r="track.r"
              />

              <g
                v-for="body in solarBodies"
                :key="body.id"
                class="body-group"
                :transform="`translate(${body.x} ${body.y})`"
              >
                <circle v-if="body.id === 'sun'" class="sun-aura" :r="body.displayRadius * 1.8" />
                <ellipse
                  v-if="body.id === 'saturn'"
                  class="saturn-ring"
                  :rx="body.displayRadius * 1.95"
                  :ry="body.displayRadius * 0.7"
                />
                <circle class="body-core" :r="body.displayRadius" :fill="body.fill" />

                <template v-if="body.id === 'earth'">
                  <path
                    class="earth-land"
                    d="M -4 -7 C 3 -10 8 -7 7 -1 C 5 4 -1 5 -4 1 C -8 0 -7 -4 -4 -7 Z"
                  />
                  <path
                    class="earth-land"
                    d="M -10 4 C -7 1 -3 2 -2 7 C -4 10 -8 11 -11 8 C -12 6 -12 5 -10 4 Z"
                  />
                </template>

                <template v-if="body.id === 'jupiter'">
                  <line
                    v-for="band in jupiterBands"
                    :key="band.id"
                    class="jupiter-band"
                    :x1="-body.displayRadius * 0.9"
                    :x2="body.displayRadius * 0.9"
                    :y1="band.y * body.displayRadius"
                    :y2="band.y * body.displayRadius"
                  />
                </template>

                <circle
                  v-if="body.id === 'moon'"
                  class="moon-crater"
                  :cx="body.displayRadius * 0.18"
                  :cy="-body.displayRadius * 0.18"
                  :r="body.displayRadius * 0.22"
                />

                <text class="body-label" text-anchor="middle" :x="0" :y="body.labelOffset">
                  {{ body.label }}
                </text>
              </g>

              <g v-if="showStageClusters" class="cluster-layer">
                <g
                  v-for="cluster in stageClusters"
                  :key="cluster.id"
                  class="stage-cluster"
                  :class="{ 'is-active': selectedStage?.id === cluster.id }"
                  :transform="`translate(${cluster.x} ${cluster.y})`"
                  @click.stop="selectStage(cluster.id)"
                >
                  <circle class="stage-cluster-ring" r="34" />
                  <circle class="stage-cluster-core" r="24" />
                  <text class="stage-cluster-index" text-anchor="middle" y="-2">{{ cluster.order }}</text>
                  <text class="stage-cluster-count" text-anchor="middle" y="17">{{ cluster.worlds.length }}</text>
                </g>
              </g>

              <g v-if="showWorldMarkers" class="world-layer">
                <g
                  v-for="world in worldMapNodes"
                  :key="world.id"
                  class="world-node"
                  :class="{
                    'is-active': selectedWorld?.id === world.id,
                    'is-muted': selectedStage && selectedStage.id !== world.chapterId,
                  }"
                  :transform="`translate(${world.x} ${world.y})`"
                  @click.stop="selectWorld(world.id)"
                >
                  <circle class="world-node-ring" :r="world.nodeRadius + 5" />
                  <circle class="world-node-core" :r="world.nodeRadius" />
                  <text class="world-node-tag" text-anchor="middle" dominant-baseline="central">
                    {{ world.mapTag || buildMapTag(world.name) }}
                  </text>
                  <text
                    v-if="showWorldLabels || selectedWorld?.id === world.id"
                    class="world-node-label"
                    :x="world.labelX"
                    :y="world.labelY"
                    :text-anchor="world.labelAnchor"
                  >
                    {{ world.name }}
                  </text>
                </g>
              </g>
            </g>
          </svg>

          <div class="map-hint">
            <BaseText size="xs" color="secondary">{{ interactionHint }}</BaseText>
          </div>
        </div>
      </section>

      <aside v-if="isPanelOpen" class="detail-panel">
        <div class="detail-panel-inner">
          <div class="panel-head">
            <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('stagesView.controlTitle') }}</BaseText>
            <button class="panel-close" :aria-label="systemStore.t('stagesView.closePanel')" @click="closePanel">
              ✕
            </button>
          </div>

          <template v-if="selectedEntity?.type === 'stage' && selectedStage">
            <div class="panel-stack">
              <div class="panel-block">
                <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ systemStore.t('stagesView.activeStage') }}</BaseText>
                <BaseText size="lg" weight="bold">{{ selectedStage.title }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedStage.locationLabel }}</BaseText>
              </div>

              <div class="panel-grid">
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.worldsCount') }}</span>
                  <strong>{{ selectedStageWorlds.length }}</strong>
                </div>
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedSections') }}</span>
                  <strong>{{ selectedStageSectionsCount }}</strong>
                </div>
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedMissions') }}</span>
                  <strong>{{ selectedStageMissionsCount }}</strong>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.relatedWorlds') }}</BaseText>
                <div class="panel-list">
                  <button
                    v-for="world in selectedStageWorlds"
                    :key="world.id"
                    class="list-item"
                    @click="selectWorld(world.id)"
                  >
                    <span>{{ world.name }}</span>
                    <small>{{ world.locationLabel || world.planet }}</small>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selectedEntity?.type === 'world' && selectedWorld">
            <div class="panel-stack">
              <div class="panel-block">
                <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ systemStore.t('stagesView.activeWorld') }}</BaseText>
                <BaseText size="lg" weight="bold">{{ selectedWorld.name }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedWorld.planet }} · {{ selectedWorld.locationLabel }}</BaseText>
              </div>

              <div class="panel-grid">
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.activeStage') }}</span>
                  <strong>{{ selectedWorldStage?.title || systemStore.t('profile.noContext') }}</strong>
                </div>
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedSections') }}</span>
                  <strong>{{ selectedWorldSections.length }}</strong>
                </div>
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedMissions') }}</span>
                  <strong>{{ selectedWorldMissions.length }}</strong>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.relatedSections') }}</BaseText>
                <div class="chip-list">
                  <span v-for="section in selectedWorldSections" :key="section.id" class="chip">
                    {{ section.name }}
                  </span>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.relatedMissions') }}</BaseText>
                <div class="panel-list">
                  <article v-for="mission in selectedWorldMissions.slice(0, 8)" :key="mission.id" class="mission-item">
                    <strong>{{ mission.title }}</strong>
                    <small>{{ mission.desc }}</small>
                  </article>
                </div>
              </div>

              <BaseButton variant="accent" size="sm" @click="openWorldMissions(selectedWorld.id)">
                {{ systemStore.t('stagesView.openSector') }}
              </BaseButton>
            </div>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'
import { useSwsmStore } from '@/stores/swsmStore'
import { useSystemStore } from '@/stores/systemStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const store = useSwsmStore()
const systemStore = useSystemStore()
const userStore = useUserStore()

const VIEWBOX_WIDTH = 1600
const VIEWBOX_HEIGHT = 900
const VIEWBOX_CENTER = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 }
const VIEWBOX_ASPECT = VIEWBOX_WIDTH / VIEWBOX_HEIGHT
const MIN_ZOOM = 55
const MAX_ZOOM = 420
const CLUSTER_TO_WORLD_ZOOM = 130

const mapViewportRef = ref(null)
const mapZoom = ref(60)
const cameraX = ref(VIEWBOX_CENTER.x)
const cameraY = ref(VIEWBOX_CENTER.y)
const isDragging = ref(false)
const selectedEntity = ref(null)
const isPanelOpen = ref(false)
const suppressClickUntil = ref(0)

const solarCenter = { x: VIEWBOX_CENTER.x, y: VIEWBOX_CENTER.y }
const asteroidBeltRadius = 290
const mapScale = computed(() => mapZoom.value / 100)

const sceneTransform = computed(() => {
  const scale = mapScale.value
  const translateX = VIEWBOX_CENTER.x - cameraX.value * scale
  const translateY = VIEWBOX_CENTER.y - cameraY.value * scale
  return `translate(${translateX} ${translateY}) scale(${scale})`
})

const interactionHint = computed(() => `Drag to move • Scroll to zoom • Double click to focus • ${Math.round(mapZoom.value)}%`)
const showStageClusters = computed(() => mapZoom.value < CLUSTER_TO_WORLD_ZOOM)
const showWorldMarkers = computed(() => mapZoom.value >= CLUSTER_TO_WORLD_ZOOM)
const showWorldLabels = computed(() => mapZoom.value >= 185)

const dragState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startCameraX: 0,
  startCameraY: 0,
  moved: false,
}

const starField = [
  { id: 's1', x: 94, y: 76, r: 1.2, opacity: 0.56 },
  { id: 's2', x: 220, y: 166, r: 1.5, opacity: 0.38 },
  { id: 's3', x: 328, y: 118, r: 1.1, opacity: 0.44 },
  { id: 's4', x: 464, y: 208, r: 1.4, opacity: 0.3 },
  { id: 's5', x: 576, y: 96, r: 1.2, opacity: 0.48 },
  { id: 's6', x: 698, y: 146, r: 1.3, opacity: 0.34 },
  { id: 's7', x: 834, y: 102, r: 1.5, opacity: 0.44 },
  { id: 's8', x: 968, y: 174, r: 1.2, opacity: 0.36 },
  { id: 's9', x: 1086, y: 108, r: 1.3, opacity: 0.42 },
  { id: 's10', x: 1222, y: 198, r: 1.4, opacity: 0.32 },
  { id: 's11', x: 1368, y: 110, r: 1.2, opacity: 0.46 },
  { id: 's12', x: 1490, y: 170, r: 1.4, opacity: 0.38 },
  { id: 's13', x: 140, y: 302, r: 1.1, opacity: 0.32 },
  { id: 's14', x: 264, y: 344, r: 1.5, opacity: 0.46 },
  { id: 's15', x: 390, y: 274, r: 1.2, opacity: 0.34 },
  { id: 's16', x: 520, y: 360, r: 1.3, opacity: 0.3 },
  { id: 's17', x: 682, y: 292, r: 1.2, opacity: 0.4 },
  { id: 's18', x: 818, y: 332, r: 1.4, opacity: 0.28 },
  { id: 's19', x: 960, y: 278, r: 1.5, opacity: 0.38 },
  { id: 's20', x: 1114, y: 360, r: 1.2, opacity: 0.32 },
  { id: 's21', x: 1244, y: 298, r: 1.3, opacity: 0.42 },
  { id: 's22', x: 1382, y: 340, r: 1.2, opacity: 0.36 },
  { id: 's23', x: 1518, y: 282, r: 1.4, opacity: 0.34 },
  { id: 's24', x: 106, y: 540, r: 1.2, opacity: 0.42 },
  { id: 's25', x: 234, y: 488, r: 1.3, opacity: 0.3 },
  { id: 's26', x: 378, y: 602, r: 1.4, opacity: 0.36 },
  { id: 's27', x: 542, y: 520, r: 1.2, opacity: 0.28 },
  { id: 's28', x: 706, y: 628, r: 1.5, opacity: 0.4 },
  { id: 's29', x: 862, y: 548, r: 1.2, opacity: 0.32 },
  { id: 's30', x: 1014, y: 662, r: 1.4, opacity: 0.38 },
  { id: 's31', x: 1160, y: 558, r: 1.1, opacity: 0.26 },
  { id: 's32', x: 1322, y: 644, r: 1.4, opacity: 0.34 },
  { id: 's33', x: 1468, y: 530, r: 1.2, opacity: 0.3 },
  { id: 's34', x: 168, y: 792, r: 1.3, opacity: 0.4 },
  { id: 's35', x: 310, y: 734, r: 1.1, opacity: 0.28 },
  { id: 's36', x: 488, y: 816, r: 1.5, opacity: 0.36 },
  { id: 's37', x: 640, y: 752, r: 1.2, opacity: 0.32 },
  { id: 's38', x: 806, y: 820, r: 1.4, opacity: 0.34 },
  { id: 's39', x: 984, y: 760, r: 1.2, opacity: 0.28 },
  { id: 's40', x: 1140, y: 836, r: 1.5, opacity: 0.36 },
  { id: 's41', x: 1282, y: 772, r: 1.2, opacity: 0.3 },
  { id: 's42', x: 1440, y: 826, r: 1.4, opacity: 0.34 },
]

const jupiterBands = [
  { id: 'j1', y: -0.48 },
  { id: 'j2', y: -0.2 },
  { id: 'j3', y: 0.08 },
  { id: 'j4', y: 0.34 },
]

const planetLayout = [
  { id: 'mercury', label: 'MERCURY', orbitRadius: 82, angle: 228, displayRadius: 8, fill: 'url(#planet-mercury)' },
  { id: 'venus', label: 'VENUS', orbitRadius: 120, angle: 132, displayRadius: 12, fill: 'url(#planet-venus)' },
  { id: 'earth', label: 'EARTH', orbitRadius: 165, angle: 305, displayRadius: 13, fill: 'url(#planet-earth)' },
  { id: 'mars', label: 'MARS', orbitRadius: 222, angle: 116, displayRadius: 10, fill: 'url(#planet-mars)' },
  { id: 'jupiter', label: 'JUPITER', orbitRadius: 310, angle: 338, displayRadius: 29, fill: 'url(#planet-jupiter)' },
  { id: 'saturn', label: 'SATURN', orbitRadius: 402, angle: 24, displayRadius: 25, fill: 'url(#planet-saturn)' },
  { id: 'uranus', label: 'URANUS', orbitRadius: 492, angle: 228, displayRadius: 18, fill: 'url(#planet-uranus)' },
  { id: 'neptune', label: 'NEPTUNE', orbitRadius: 570, angle: 264, displayRadius: 18, fill: 'url(#planet-neptune)' },
]

const solarBodies = computed(() => {
  const bodies = [
    {
      id: 'sun',
      label: 'SUN',
      x: solarCenter.x,
      y: solarCenter.y,
      displayRadius: 40,
      fill: 'url(#planet-sun)',
      labelOffset: 72,
    },
  ]

  planetLayout.forEach((planet) => {
    const point = pointOnCircle(solarCenter.x, solarCenter.y, planet.orbitRadius, planet.angle)

    bodies.push({
      ...planet,
      x: point.x,
      y: point.y,
      labelOffset: planet.displayRadius + 28,
    })
  })

  const earth = bodies.find((body) => body.id === 'earth')
  if (earth) {
    const moonPoint = pointOnCircle(earth.x, earth.y, 24, 216)

    bodies.push({
      id: 'moon',
      label: 'MOON',
      x: moonPoint.x,
      y: moonPoint.y,
      displayRadius: 7,
      fill: 'url(#planet-moon)',
      labelOffset: 22,
    })
  }

  return bodies
})

const bodyById = computed(() => Object.fromEntries(solarBodies.value.map((body) => [body.id, body])))

const solarOrbitTracks = computed(() => {
  return planetLayout.map((planet) => ({
    id: `orbit-${planet.id}`,
    cx: solarCenter.x,
    cy: solarCenter.y,
    r: planet.orbitRadius,
  }))
})

const chapterCards = computed(() => {
  return [...store.chapters]
    .sort((left, right) => left.order - right.order)
    .map((chapter) => ({
      ...chapter,
      worlds: store.worlds.filter((world) => world.chapterId === chapter.id),
    }))
})

const worldMapNodes = computed(() => {
  const groups = new Map()

  store.worlds.forEach((world) => {
    const bodyId = resolveBodyId(world)
    const anchorType = resolveAnchorType(world, bodyId)
    const key = `${bodyId}:${anchorType}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(world.id)
  })

  return store.worlds.map((world) => {
    const bodyId = resolveBodyId(world)
    const body = bodyById.value[bodyId] || bodyById.value.earth
    const anchorType = resolveAnchorType(world, bodyId)
    const siblings = groups.get(`${bodyId}:${anchorType}`) || [world.id]
    const index = Math.max(siblings.indexOf(world.id), 0)
    const angle = world.orbitalAngle ?? (index * (360 / Math.max(siblings.length, 1)))
    const nodePosition = getWorldNodePosition(world, body, anchorType, angle)
    const label = getWorldLabelAnchor(nodePosition.x, nodePosition.y)

    return {
      ...world,
      bodyId,
      anchorType,
      x: nodePosition.x,
      y: nodePosition.y,
      nodeRadius: 10,
      labelX: label.x,
      labelY: label.y,
      labelAnchor: label.anchor,
    }
  })
})

const worldOrbitTracks = computed(() => {
  const tracks = []
  const seen = new Set()

  worldMapNodes.value
    .filter((world) => world.anchorType === 'orbit' || world.anchorType === 'satellite')
    .forEach((world) => {
      const body = bodyById.value[world.bodyId]
      if (!body) return

      const radius = getWorldOrbitRadius(world, body, world.anchorType)
      const key = `${world.bodyId}-${Math.round(radius)}`
      if (seen.has(key)) return
      seen.add(key)

      tracks.push({
        id: key,
        cx: body.x,
        cy: body.y,
        r: radius,
      })
    })

  const earth = bodyById.value.earth
  if (earth) {
    tracks.push({
      id: 'earth-moon-orbit',
      cx: earth.x,
      cy: earth.y,
      r: 24,
    })
  }

  return tracks
})

const stageClusters = computed(() => {
  return chapterCards.value.map((chapter) => {
    const nodes = worldMapNodes.value.filter((world) => world.chapterId === chapter.id)
    const x = nodes.length
      ? nodes.reduce((sum, world) => sum + world.x, 0) / nodes.length
      : solarCenter.x
    const y = nodes.length
      ? nodes.reduce((sum, world) => sum + world.y, 0) / nodes.length
      : solarCenter.y

    return {
      ...chapter,
      x,
      y,
    }
  })
})

const selectedStage = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'stage') return null
  return stageClusters.value.find((cluster) => cluster.id === selectedEntity.value.id) || null
})

const selectedWorld = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'world') return null
  return store.worlds.find((world) => world.id === selectedEntity.value.id) || null
})

const selectedWorldStage = computed(() => {
  if (!selectedWorld.value) return null
  return chapterCards.value.find((chapter) => chapter.id === selectedWorld.value.chapterId) || null
})

const selectedStageWorlds = computed(() => selectedStage.value?.worlds || [])

const selectedStageSectionsCount = computed(() => {
  if (!selectedStage.value) return 0
  const worldIds = new Set(selectedStage.value.worlds.map((world) => world.id))
  return store.sections.filter((section) => worldIds.has(section.worldId)).length
})

const selectedStageMissionsCount = computed(() => {
  if (!selectedStage.value) return 0
  const worldIds = new Set(selectedStage.value.worlds.map((world) => world.id))
  const sectionIds = new Set(
    store.sections
      .filter((section) => worldIds.has(section.worldId))
      .map((section) => section.id)
  )
  return store.missions.filter((mission) => sectionIds.has(mission.sectionId)).length
})

const selectedWorldSections = computed(() => {
  if (!selectedWorld.value) return []
  return store.sections.filter((section) => section.worldId === selectedWorld.value.id)
})

const selectedWorldMissions = computed(() => {
  const sectionIds = new Set(selectedWorldSections.value.map((section) => section.id))
  return store.missions.filter((mission) => sectionIds.has(mission.sectionId))
})

function pointOnCircle(cx, cy, radius, angle) {
  const radians = angle * (Math.PI / 180)
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  }
}

function resolveBodyId(world) {
  if (world.mapBody) return world.mapBody

  const planet = (world.planet || '').toLowerCase()
  if (planet.includes('earth')) return 'earth'
  if (planet.includes('moon')) return 'moon'
  if (planet.includes('mars')) return 'mars'
  if (planet.includes('jupiter')) return 'jupiter'
  if (planet.includes('saturn')) return 'saturn'
  return 'earth'
}

function resolveAnchorType(world, bodyId) {
  if (bodyId === 'moon' && world.locationType === 'satellite') return 'surface'
  return world.locationType || 'surface'
}

function getWorldOrbitRadius(world, body, anchorType) {
  if (anchorType === 'satellite') return body.displayRadius + 18 + ((world.orbitalBand || 1) * 2)
  return body.displayRadius + 28 + ((world.orbitalBand || 1) * 2.4)
}

function getWorldNodePosition(world, body, anchorType, angle) {
  if (anchorType === 'surface') {
    return pointOnCircle(body.x, body.y, body.displayRadius - 1, angle)
  }

  return pointOnCircle(body.x, body.y, getWorldOrbitRadius(world, body, anchorType), angle)
}

function getWorldLabelAnchor(x, y) {
  const isRight = x >= solarCenter.x
  const isBottom = y >= solarCenter.y

  return {
    x: isRight ? 18 : -18,
    y: isBottom ? 8 : -10,
    anchor: isRight ? 'start' : 'end',
  }
}

function buildMapTag(name) {
  if (!name) return 'W'

  const words = name
    .replace(/[^A-Za-zА-Яа-яЇїІіЄєҐґ0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function clientToViewBox(clientX, clientY) {
  const element = mapViewportRef.value
  if (!element) return { x: VIEWBOX_CENTER.x, y: VIEWBOX_CENTER.y }

  const rect = element.getBoundingClientRect()
  const rectAspect = rect.width / rect.height

  let renderWidth = rect.width
  let renderHeight = rect.height
  let offsetX = 0
  let offsetY = 0

  if (rectAspect > VIEWBOX_ASPECT) {
    renderWidth = rect.height * VIEWBOX_ASPECT
    offsetX = (rect.width - renderWidth) / 2
  } else {
    renderHeight = rect.width / VIEWBOX_ASPECT
    offsetY = (rect.height - renderHeight) / 2
  }

  return {
    x: ((clientX - rect.left - offsetX) / renderWidth) * VIEWBOX_WIDTH,
    y: ((clientY - rect.top - offsetY) / renderHeight) * VIEWBOX_HEIGHT,
  }
}

function viewToWorld(viewPoint, scale = mapScale.value) {
  return {
    x: cameraX.value + (viewPoint.x - VIEWBOX_CENTER.x) / scale,
    y: cameraY.value + (viewPoint.y - VIEWBOX_CENTER.y) / scale,
  }
}

function focusCamera(targetX, targetY, targetZoom = mapZoom.value) {
  mapZoom.value = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM)
  cameraX.value = targetX
  cameraY.value = targetY
}

function resetCamera() {
  selectedEntity.value = null
  isPanelOpen.value = false
  focusCamera(solarCenter.x, solarCenter.y, 60)
}

function onWheel(event) {
  const viewPoint = clientToViewBox(event.clientX, event.clientY)
  const pointerWorld = viewToWorld(viewPoint)
  const zoomFactor = event.deltaY < 0 ? 1.16 : 0.84
  const nextZoom = clamp(mapZoom.value * zoomFactor, MIN_ZOOM, MAX_ZOOM)
  const nextScale = nextZoom / 100

  mapZoom.value = nextZoom
  cameraX.value = pointerWorld.x - (viewPoint.x - VIEWBOX_CENTER.x) / nextScale
  cameraY.value = pointerWorld.y - (viewPoint.y - VIEWBOX_CENTER.y) / nextScale
}

function onDoubleClick(event) {
  const viewPoint = clientToViewBox(event.clientX, event.clientY)
  const worldPoint = viewToWorld(viewPoint)
  focusCamera(worldPoint.x, worldPoint.y, Math.min(MAX_ZOOM, mapZoom.value + 54))
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return

  const point = clientToViewBox(event.clientX, event.clientY)
  dragState.active = true
  dragState.pointerId = event.pointerId
  dragState.startX = point.x
  dragState.startY = point.y
  dragState.startCameraX = cameraX.value
  dragState.startCameraY = cameraY.value
  dragState.moved = false
  mapViewportRef.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (!dragState.active || dragState.pointerId !== event.pointerId) return

  const point = clientToViewBox(event.clientX, event.clientY)
  const deltaX = point.x - dragState.startX
  const deltaY = point.y - dragState.startY

  if (!dragState.moved && Math.hypot(deltaX, deltaY) > 4) {
    dragState.moved = true
    isDragging.value = true
  }

  cameraX.value = dragState.startCameraX - (deltaX / mapScale.value)
  cameraY.value = dragState.startCameraY - (deltaY / mapScale.value)
}

function onPointerUp(event) {
  if (!dragState.active || dragState.pointerId !== event.pointerId) return

  mapViewportRef.value?.releasePointerCapture?.(event.pointerId)

  if (dragState.moved) {
    suppressClickUntil.value = Date.now() + 140
  }

  dragState.active = false
  dragState.pointerId = null
  dragState.moved = false
  isDragging.value = false
}

function selectStage(stageId) {
  if (Date.now() < suppressClickUntil.value) return

  const stage = stageClusters.value.find((cluster) => cluster.id === stageId)
  if (!stage) return

  selectedEntity.value = { type: 'stage', id: stageId }
  isPanelOpen.value = true
  focusCamera(stage.x, stage.y, 185)
}

function selectWorld(worldId) {
  if (Date.now() < suppressClickUntil.value) return

  const worldNode = worldMapNodes.value.find((world) => world.id === worldId)
  if (!worldNode) return

  activateWorld(worldId)
  selectedEntity.value = { type: 'world', id: worldId }
  isPanelOpen.value = true
  const focusZoom = worldNode.anchorType === 'surface' ? 320 : 280
  focusCamera(worldNode.x, worldNode.y, Math.max(mapZoom.value, focusZoom))
}

function closePanel() {
  isPanelOpen.value = false
}

function activateWorld(worldId) {
  store.activeWorldId = worldId
  const firstSection = store.sections.find((section) => section.worldId === worldId)

  if (firstSection) {
    store.activeSectionId = firstSection.id
    userStore.recordSectionVisited(firstSection.id)
  }
}

function openWorldMissions(worldId) {
  activateWorld(worldId)
  router.push('/missions')
}
</script>

<style scoped>
.stages-page {
  height: 100%;
  overflow: hidden;
  background: #050811;
}

.map-layout {
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.map-pane {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: rgba(7, 11, 18, 0.9);
}

.toolbar-copy,
.toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-meta {
  align-items: flex-end;
  text-align: right;
}

.map-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(90, 130, 255, 0.05), transparent 48%),
    linear-gradient(180deg, rgba(9, 13, 22, 0.98), rgba(5, 8, 15, 1));
  cursor: grab;
  touch-action: none;
}

.map-viewport.is-dragging {
  cursor: grabbing;
}

.solar-map {
  width: 100%;
  height: 100%;
  display: block;
}

.space-backdrop {
  fill: #050811;
}

.star-dot {
  fill: rgba(255, 255, 255, 0.94);
}

.solar-orbit-track,
.world-orbit-track,
.asteroid-belt-track {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.solar-orbit-track {
  stroke: rgba(174, 193, 255, 0.22);
  stroke-width: 1.5;
  stroke-dasharray: 8 12;
}

.asteroid-belt-track {
  stroke: rgba(160, 174, 220, 0.2);
  stroke-width: 9;
  stroke-linecap: round;
  stroke-dasharray: 1 13;
}

.world-orbit-track {
  stroke: rgba(113, 214, 255, 0.24);
  stroke-width: 1.35;
  stroke-dasharray: 5 9;
}

.sun-aura {
  fill: rgba(255, 183, 77, 0.16);
}

.saturn-ring {
  fill: none;
  stroke: rgba(231, 208, 145, 0.82);
  stroke-width: 5;
}

.body-core {
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 1.2;
}

.earth-land {
  fill: rgba(76, 184, 95, 0.8);
}

.jupiter-band {
  stroke: rgba(146, 104, 74, 0.48);
  stroke-width: 2.4;
  stroke-linecap: round;
}

.moon-crater {
  fill: rgba(118, 128, 144, 0.45);
}

.body-label {
  fill: #eef5ff;
  font-size: 18px;
  letter-spacing: 0.18em;
  font-weight: 600;
  user-select: none;
}

.stage-cluster,
.world-node {
  cursor: pointer;
}

.stage-cluster-ring {
  fill: rgba(0, 0, 0, 0.16);
  stroke: rgba(185, 198, 255, 0.52);
  stroke-width: 1.5;
}

.stage-cluster-core {
  fill: rgba(12, 18, 30, 0.94);
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1;
}

.stage-cluster-index {
  fill: #f3f7ff;
  font-size: 17px;
  font-weight: 700;
}

.stage-cluster-count {
  fill: #9ca9c9;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.stage-cluster.is-active .stage-cluster-ring,
.stage-cluster.is-active .stage-cluster-core {
  stroke: var(--accent-color);
}

.world-node-ring {
  fill: rgba(88, 140, 255, 0.08);
  stroke: rgba(135, 229, 255, 0.38);
  stroke-width: 1.2;
}

.world-node-core {
  fill: rgba(8, 13, 24, 0.96);
  stroke: rgba(255, 255, 255, 0.56);
  stroke-width: 1.1;
}

.world-node-tag {
  fill: #f3f7ff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.world-node-label {
  fill: rgba(236, 243, 255, 0.92);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}

.world-node.is-active .world-node-ring,
.world-node.is-active .world-node-core {
  stroke: var(--accent-color);
}

.world-node.is-active .world-node-tag,
.world-node.is-active .world-node-label {
  fill: var(--accent-color);
}

.world-node.is-muted {
  opacity: 0.42;
}

.map-hint {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(8, 11, 18, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.detail-panel {
  width: 360px;
  flex: 0 0 360px;
  min-width: 0;
}

.detail-panel-inner {
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: rgba(9, 13, 21, 0.94);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  overflow-y: auto;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}

.panel-stack,
.panel-block,
.panel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-grid {
  display: grid;
  gap: 8px;
}

.panel-metric,
.list-item,
.mission-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
}

.panel-metric {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.panel-metric span,
.caps {
  font-size: 0.66rem;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.list-item {
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.list-item small,
.mission-item small {
  color: var(--text-secondary);
}

.mission-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  border-radius: 999px;
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  font-size: 0.67rem;
}

@media (max-width: 1120px) {
  .detail-panel {
    width: 320px;
    flex-basis: 320px;
  }
}

@media (max-width: 980px) {
  .detail-panel {
    position: absolute;
    right: 8px;
    top: 8px;
    bottom: 8px;
    width: min(340px, 88vw);
    flex: none;
    z-index: 30;
  }
}

@media (max-width: 720px) {
  .map-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-meta {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
