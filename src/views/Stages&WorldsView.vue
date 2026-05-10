<template>
  <div class="stages-page">
    <div class="map-layout">
      <button
        v-if="mobileOverlayVisible"
        class="mobile-overlay"
        type="button"
        :aria-label="systemStore.t('stagesView.closePanel')"
        @click="closeMobilePanels"
      ></button>

      <aside class="explorer-panel" :class="{ 'is-open': explorerOpen, 'is-mobile': isMobileView }">
        <div class="explorer-inner">
          <div class="explorer-head">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('stagesView.explorerTitle') }}</BaseText>
              <BaseText size="xs" color="secondary">{{ systemStore.t('stagesView.explorerSubtitle') }}</BaseText>
            </div>
            <button class="panel-close" :aria-label="systemStore.t('stagesView.closeExplorer')" @click="toggleExplorer">
              ✕
            </button>
          </div>

          <div class="explorer-scroll">
            <article class="overview-card">
              <BaseText size="xs" weight="bold" color="secondary" class="caps">
                {{ systemStore.t('stagesView.overviewTitle') }}
              </BaseText>
              <BaseText size="md" weight="bold">{{ store.overview.title }}</BaseText>
              <BaseText size="sm">{{ store.overview.summary }}</BaseText>
              <BaseText size="sm" color="secondary">{{ store.overview.detail }}</BaseText>
            </article>

            <article v-for="chapter in chapterCards" :key="chapter.id" class="explorer-card chapter-card">
              <button class="explorer-card-button" @click="selectStage(chapter.id, { force: true })">
                <div class="explorer-card-top">
                  <BaseText size="xs" weight="bold" color="secondary" class="caps">
                    {{ systemStore.t('stagesView.chapterLabel') }}
                  </BaseText>
                  <span class="card-badge">{{ chapter.worlds.length }}</span>
                </div>
                <BaseText size="md" weight="bold">{{ chapter.title }}</BaseText>
                <BaseText size="sm" color="secondary">{{ chapter.locationLabel }}</BaseText>
                <BaseText size="sm">{{ chapter.summary }}</BaseText>
              </button>

              <div class="explorer-world-list">
                <button
                  v-for="world in chapter.worlds"
                  :key="world.id"
                  class="explorer-world-card"
                  @click="selectWorld(world.id, { force: true })"
                >
                  <div class="explorer-world-head">
                    <strong>{{ world.name }}</strong>
                    <span class="world-tag">{{ world.mapTag }}</span>
                  </div>
                  <small>{{ world.locationLabel }}</small>
                  <span>{{ world.summary }}</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </aside>

      <section class="map-pane">
        <div
          ref="mapViewportRef"
          class="map-viewport"
          :class="{ 'is-dragging': isDragging, 'is-low-detail': lowDetailMode, 'is-performance-cut': performanceCutMode }"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerLeave"
          @wheel.prevent="onWheel"
          @dblclick="onDoubleClick"
        >
          <canvas ref="mapCanvasRef" class="solar-canvas" aria-label="Stages and Worlds"></canvas>
          <div class="map-inline-title">Етапи та світи</div>

          <div class="map-controls">
            <button class="map-control-button" type="button" :aria-label="systemStore.t('stagesView.resetView')" @click="resetCamera">
              {{ systemStore.t('stagesView.resetView') }}
            </button>
            <button class="map-control-button map-control-button--icon" type="button" aria-label="Zoom out" @click="stepZoom(-1)">
              -
            </button>
            <div class="map-zoom-pill">{{ zoomLabel }}</div>
            <button class="map-control-button map-control-button--icon" type="button" aria-label="Zoom in" @click="stepZoom(1)">
              +
            </button>
          </div>

          <div class="map-hint">
            <BaseText size="xs" color="secondary">{{ interactionHint }}</BaseText>
          </div>

          <button
            v-if="!explorerOpen"
            class="explorer-rail"
            type="button"
            @click="toggleExplorer"
          >
            {{ systemStore.t('stagesView.openExplorer') }}
          </button>
        </div>
      </section>

      <aside class="detail-panel" :class="{ 'is-open': isPanelOpen, 'is-mobile': isMobileView }">
        <div class="detail-panel-inner">
          <div class="panel-head">
            <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('stagesView.controlTitle') }}</BaseText>
            <button class="panel-close" :aria-label="systemStore.t('stagesView.closePanel')" @click="closePanel">
              ✕
            </button>
          </div>

          <template v-if="selectedEntity?.type === 'body' && selectedBody">
            <div class="panel-stack">
              <div class="panel-block">
                <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ systemStore.t('stagesView.dossierTitle') }}</BaseText>
                <BaseText size="lg" weight="bold">{{ selectedBody.label }}</BaseText>
                <BaseText size="sm" color="secondary">{{ systemStore.t('stagesView.activePlanet') }}</BaseText>
              </div>

              <div class="panel-grid">
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedWorlds') }}</span>
                  <strong>{{ selectedBodyWorldsCount }}</strong>
                </div>
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.relatedStages') }}</span>
                  <strong>{{ selectedBodyStages.length }}</strong>
                </div>
              </div>

              <div class="panel-block" v-if="selectedBodyStages.length">
                <BaseButton
                  variant="accent"
                  size="sm"
                  @click="openStageWorlds(selectedBodyStages[0].id, { force: true })"
                >
                  {{ systemStore.t('stagesView.openBodyStages') }}
                </BaseButton>
                <div class="panel-list">
                  <button
                    v-for="stage in selectedBodyStages"
                    :key="stage.id"
                    class="list-item"
                    @click="selectStage(stage.id, { force: true })"
                  >
                    <span>{{ stage.title }}</span>
                    <small>{{ stage.worlds.length }} {{ systemStore.t('stagesView.worldsCount') }}</small>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selectedEntity?.type === 'stage' && selectedStage">
            <div class="panel-stack">
              <div class="panel-block">
                <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ systemStore.t('stagesView.activeStage') }}</BaseText>
                <BaseText size="lg" weight="bold">{{ selectedStage.title }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedStage.locationLabel }}</BaseText>
                <BaseText size="sm">{{ selectedStage.summary }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedStage.objective }}</BaseText>
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
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.worldStatus') }}</span>
                  <strong>{{ selectedStage.status }}</strong>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.relatedWorlds') }}</BaseText>
                <BaseButton
                  variant="accent"
                  size="sm"
                  @click="openStageWorlds(selectedStage.id, { force: true })"
                >
                  {{ systemStore.t('stagesView.openStageWorlds') }}
                </BaseButton>
                <div v-if="isStageFocusMode && focusedStageId === selectedStage.id" class="panel-list">
                  <button
                    v-for="world in selectedStageWorlds"
                    :key="world.id"
                    class="list-item"
                    @click="selectWorld(world.id, { force: true })"
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
                <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ systemStore.t('stagesView.dossierTitle') }}</BaseText>
                <BaseText size="lg" weight="bold">{{ selectedWorld.name }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedWorld.planet }} · {{ selectedWorld.locationLabel }}</BaseText>
                <BaseText size="sm">{{ selectedWorld.summary }}</BaseText>
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
                <div class="panel-metric">
                  <span>{{ systemStore.t('stagesView.worldStatus') }}</span>
                  <strong>{{ selectedWorld.status }}</strong>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.synopsisLabel') }}</BaseText>
                <BaseText size="sm">{{ selectedWorld.dossier }}</BaseText>
                <BaseText size="sm" color="secondary">{{ selectedWorld.objective }}</BaseText>
              </div>

              <div class="panel-grid">
                <div class="panel-metric">
                  <span>Type</span>
                  <strong>{{ selectedWorld.locationType }}</strong>
                </div>
                <div class="panel-metric">
                  <span>Orbital band</span>
                  <strong>{{ selectedWorld.orbitalBand }}</strong>
                </div>
                <div class="panel-metric">
                  <span>Orbital angle</span>
                  <strong>{{ selectedWorld.orbitalAngle }}°</strong>
                </div>
                <div class="panel-metric">
                  <span>Cluster</span>
                  <strong>{{ selectedWorldStage?.title || systemStore.t('profile.noContext') }}</strong>
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

              <div class="panel-block" v-if="selectedWorldPeers.length">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.relatedWorlds') }}</BaseText>
                <div class="panel-list">
                  <button
                    v-for="world in selectedWorldPeers"
                    :key="world.id"
                    class="list-item"
                    @click="selectWorld(world.id, { force: true })"
                  >
                    <span>{{ world.name }}</span>
                    <small>{{ world.locationLabel }}</small>
                  </button>
                </div>
              </div>

              <div class="panel-block">
                <BaseText size="sm" weight="bold">{{ systemStore.t('stagesView.operationFeed') }}</BaseText>
                <div class="panel-list">
                  <article v-for="section in selectedWorldOperationGroups" :key="section.id" class="mission-section">
                    <div class="mission-section-head">
                      <strong>{{ section.name }}</strong>
                      <small>{{ section.missions.length }} {{ systemStore.t('stagesView.missionsLabel') }}</small>
                    </div>
                    <div class="mission-section-list">
                      <article v-for="mission in section.missions" :key="mission.id" class="mission-item">
                        <strong>{{ mission.title }}</strong>
                        <small>{{ mission.desc }}</small>
                      </article>
                    </div>
                  </article>
                </div>
              </div>

              <BaseButton variant="accent" size="sm" @click="openWorldMissions(selectedWorld.id)">
                {{ systemStore.t('stagesView.openSector') }}
              </BaseButton>
            </div>
          </template>

          <template v-else>
            <div class="panel-empty">
              <BaseText size="sm" color="secondary">{{ systemStore.t('stagesView.panelHint') }}</BaseText>
            </div>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
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
const DEFAULT_ZOOM = 14
const MIN_ZOOM = 8
const MAX_ZOOM_FULL = 1180
const MAX_ZOOM_LOW_DETAIL = 420
const MOBILE_BREAKPOINT = 980
const CAMERA_EASE = 0.24
const WHEEL_ZOOM_SENSITIVITY = 0.0042
const WHEEL_PAN_SENSITIVITY = 1
const CANVAS_DPR_MAX = 1
const SCENE_BOUND_MARGIN = 300
const SCENE_BOUND_RADIUS = 2050 + SCENE_BOUND_MARGIN
const SCENE_MIN_X = VIEWBOX_CENTER.x - SCENE_BOUND_RADIUS
const SCENE_MAX_X = VIEWBOX_CENTER.x + SCENE_BOUND_RADIUS
const SCENE_MIN_Y = VIEWBOX_CENTER.y - SCENE_BOUND_RADIUS
const SCENE_MAX_Y = VIEWBOX_CENTER.y + SCENE_BOUND_RADIUS
const STAGE_FOCUS_EXIT_ZOOM = 118

const mapViewportRef = ref(null)
const mapCanvasRef = ref(null)
const mapZoom = ref(DEFAULT_ZOOM)
const targetZoom = ref(DEFAULT_ZOOM)
const cameraX = ref(VIEWBOX_CENTER.x)
const cameraY = ref(VIEWBOX_CENTER.y)
const targetCameraX = ref(VIEWBOX_CENTER.x)
const targetCameraY = ref(VIEWBOX_CENTER.y)
const isDragging = ref(false)
const isMobileView = ref(false)
const explorerOpen = ref(false)
const hoveredWorldId = ref(null)
const hoveredStageId = ref(null)
const selectedEntity = ref(null)
const focusedStageId = ref(null)
const isPanelOpen = ref(false)
const suppressClickUntil = ref(0)
const prefersReducedMotion = ref(false)
const lowPowerDevice = ref(false)
const isWheelInteracting = ref(false)
let cameraFrame = null
let dragFrame = null
let wheelFrame = null
let resizeHandler = null
let reducedMotionQuery = null
let reducedMotionHandler = null
let mapRenderFrame = null
let wheelInteractionTimeout = null
const wheelState = {
  clientX: 0,
  clientY: 0,
  deltaX: 0,
  deltaY: 0,
  pinchLike: false,
}

const viewportMetrics = {
  left: 0,
  top: 0,
  renderWidth: VIEWBOX_WIDTH,
  renderHeight: VIEWBOX_HEIGHT,
  offsetX: 0,
  offsetY: 0,
  ready: false,
}
const mapPalette = {
  accent: '#00ffd9',
  textPrimary: '#ffffff',
  textSecondary: '#a7adb7',
}
const forcePerformanceMapMode = true
const STAGE_PRIMARY_BODY_PRIORITY = ['earth', 'mars', 'jupiter', 'saturn', 'venus', 'mercury', 'uranus', 'neptune', 'moon']

const solarCenter = { x: VIEWBOX_CENTER.x, y: VIEWBOX_CENTER.y }
const asteroidBeltRadius = 670
const mapScale = computed(() => mapZoom.value / 100)
const inverseSceneScale = computed(() => 1 / mapScale.value)
const motionEnabled = computed(() => systemStore.animationsEnabled && !prefersReducedMotion.value)
const lowDetailMode = computed(() => forcePerformanceMapMode || isMobileView.value || lowPowerDevice.value || !motionEnabled.value)
const performanceCutMode = computed(() => isDragging.value || dragState.active || isWheelInteracting.value)
const effectiveMaxZoom = computed(() => (lowDetailMode.value ? MAX_ZOOM_LOW_DETAIL : MAX_ZOOM_FULL))
const hoverEffectsEnabled = computed(() => motionEnabled.value && !forcePerformanceMapMode && !performanceCutMode.value)
const mobileOverlayVisible = computed(() => isMobileView.value && (explorerOpen.value || isPanelOpen.value))
const isStageFocusMode = computed(() => Boolean(focusedStageId.value))

const zoomLabel = computed(() => `${Math.round(mapZoom.value)}%`)
const interactionHint = computed(() =>
  isMobileView.value
    ? `Drag to move • Use +/- to zoom • ${zoomLabel.value}`
    : `Drag to move • Click planet to open stage • Pinch/ctrl+wheel to zoom • ${zoomLabel.value}`
)
const showStageClusters = computed(() => !isStageFocusMode.value)
const showWorldMarkers = computed(() => isStageFocusMode.value)
const showWorldLabels = computed(() => !performanceCutMode.value && mapZoom.value >= (lowDetailMode.value ? 280 : 180))

const dragState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startCameraX: 0,
  startCameraY: 0,
  moved: false,
  lastClientX: 0,
  lastClientY: 0,
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

const renderedStarField = computed(() => {
  if (lowDetailMode.value) return starField.filter((_, index) => index % 5 === 0)
  return starField.filter((_, index) => index % 3 === 0)
})

const planetLayout = [
  { id: 'mercury', label: 'MERCURY', orbitRadius: 170, angle: 228, displayRadius: 7, fill: 'url(#planet-mercury)' },
  { id: 'venus', label: 'VENUS', orbitRadius: 262, angle: 132, displayRadius: 12, fill: 'url(#planet-venus)' },
  { id: 'earth', label: 'EARTH', orbitRadius: 372, angle: 305, displayRadius: 13, fill: 'url(#planet-earth)' },
  { id: 'mars', label: 'MARS', orbitRadius: 520, angle: 116, displayRadius: 9, fill: 'url(#planet-mars)' },
  { id: 'jupiter', label: 'JUPITER', orbitRadius: 860, angle: 338, displayRadius: 36, fill: 'url(#planet-jupiter)' },
  { id: 'saturn', label: 'SATURN', orbitRadius: 1220, angle: 24, displayRadius: 31, fill: 'url(#planet-saturn)' },
  { id: 'uranus', label: 'URANUS', orbitRadius: 1650, angle: 228, displayRadius: 20, fill: 'url(#planet-uranus)' },
  { id: 'neptune', label: 'NEPTUNE', orbitRadius: 2050, angle: 264, displayRadius: 20, fill: 'url(#planet-neptune)' },
]

const solarBodies = computed(() => {
  const bodies = [
    {
      id: 'sun',
      label: 'SUN',
      x: solarCenter.x,
      y: solarCenter.y,
      displayRadius: 64,
      fill: 'url(#planet-sun)',
    },
  ]

  planetLayout.forEach((planet) => {
    const point = pointOnCircle(solarCenter.x, solarCenter.y, planet.orbitRadius, planet.angle)

      bodies.push({
        ...planet,
        x: point.x,
        y: point.y,
      })
    })

  const earth = bodies.find((body) => body.id === 'earth')
  if (earth) {
    const moonPoint = pointOnCircle(earth.x, earth.y, 40, 216)

    bodies.push({
      id: 'moon',
      label: 'MOON',
      x: moonPoint.x,
      y: moonPoint.y,
      displayRadius: 8,
      fill: 'url(#planet-moon)',
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

const renderedSolarOrbitTracks = computed(() => {
  return solarOrbitTracks.value.filter(
    (track) =>
      track.id.endsWith('mercury')
      || track.id.endsWith('venus')
      || track.id.endsWith('earth')
      || track.id.endsWith('mars')
      || (!lowDetailMode.value && track.id.endsWith('jupiter'))
  )
})

const chapterCards = computed(() => {
  return [...store.chapters]
    .sort((left, right) => left.order - right.order)
    .map((chapter) => ({
      ...chapter,
      worlds: store.worlds.filter((world) => world.chapterId === chapter.id),
    }))
})

const stagePlanets = computed(() => {
  return chapterCards.value.map((chapter) => {
    const bodyCounts = new Map()
    chapter.worlds.forEach((world) => {
      const bodyId = resolveBodyId(world)
      bodyCounts.set(bodyId, (bodyCounts.get(bodyId) || 0) + 1)
    })

    const bodyId = [...bodyCounts.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1]
        return STAGE_PRIMARY_BODY_PRIORITY.indexOf(left[0]) - STAGE_PRIMARY_BODY_PRIORITY.indexOf(right[0])
      })[0]?.[0] || 'earth'

    const body = bodyById.value[bodyId] || bodyById.value.earth
    return {
      ...chapter,
      bodyId,
      x: body.x,
      y: body.y,
      radius: Math.max(220, body.displayRadius * 22),
    }
  })
})

const stagePlanetById = computed(() =>
  Object.fromEntries(stagePlanets.value.map((stage) => [stage.id, stage]))
)

const stageBodiesByChapterId = computed(() => {
  const links = new Map()
  chapterCards.value.forEach((chapter) => {
    links.set(chapter.id, new Set(chapter.worlds.map((world) => resolveBodyId(world))))
  })
  return links
})

const stageIdsByBodyId = computed(() => {
  const links = new Map()
  stageBodiesByChapterId.value.forEach((bodyIds, stageId) => {
    for (const bodyId of bodyIds) {
      if (!links.has(bodyId)) links.set(bodyId, [])
      links.get(bodyId).push(stageId)
    }
  })
  return links
})

const selectedBody = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'body') return null
  return bodyById.value[selectedEntity.value.id] || null
})

const selectedBodyStages = computed(() => {
  if (!selectedBody.value) return []
  const stageIds = stageIdsByBodyId.value.get(selectedBody.value.id) || []
  return stageIds
    .map((stageId) => stagePlanetById.value[stageId])
    .filter(Boolean)
    .sort((left, right) => left.order - right.order)
})

const selectedBodyWorldsCount = computed(() => {
  if (!selectedBody.value) return 0
  return store.worlds.filter((world) => resolveBodyId(world) === selectedBody.value.id).length
})

const focusedWorldNodes = computed(() => {
  if (!focusedStageId.value) return []
  const stage = stagePlanetById.value[focusedStageId.value]
  if (!stage) return []
  const worlds = stage.worlds || []
  if (!worlds.length) return []

  const groups = new Map()
  worlds.forEach((world) => {
    const bodyId = resolveBodyId(world)
    const anchorType = resolveAnchorType(world)
    const key = `${bodyId}:${anchorType}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(world.id)
  })

  return worlds.map((world) => {
    const bodyId = resolveBodyId(world)
    const body = bodyById.value[bodyId] || bodyById.value.earth
    const anchorType = resolveAnchorType(world)
    const siblings = groups.get(`${bodyId}:${anchorType}`) || [world.id]
    const index = Math.max(0, siblings.indexOf(world.id))
    const angle = world.orbitalAngle ?? ((index * (360 / Math.max(siblings.length, 1))) + (world.orbitalBand || 0) * 11)
    const orbitRadius = getWorldOrbitRadius(world, body, anchorType, index)
    const nodePosition = getWorldNodePosition(body, anchorType, orbitRadius, angle)
    const label = getWorldLabelAnchor(nodePosition.x, nodePosition.y, body.x, body.y)

    return {
      ...world,
      bodyId,
      anchorType,
      x: nodePosition.x,
      y: nodePosition.y,
      nodeRadius: 10,
      labelSideX: label.sideX,
      labelSideY: label.sideY,
      labelAnchor: label.anchor,
      orbitRadius,
    }
  })
})

const visibleWorldNodes = computed(() => (isStageFocusMode.value ? focusedWorldNodes.value : []))

const focusedWorldOrbitTracks = computed(() => {
  const seen = new Set()
  return focusedWorldNodes.value
    .filter((world) => world.anchorType === 'orbit' || world.anchorType === 'satellite')
    .map((world) => ({ bodyId: world.bodyId, radius: Math.round(world.orbitRadius || 0) }))
    .filter(({ bodyId, radius }) => {
      if (!radius || !bodyId) return false
      const key = `${bodyId}:${radius}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(({ bodyId, radius }) => {
      const body = bodyById.value[bodyId]
      if (!body) return null
      return {
      id: `${bodyId}-${radius}`,
      cx: body.x,
      cy: body.y,
      r: radius,
      }
    })
    .filter(Boolean)
})

const renderedWorldOrbitTracks = computed(() => {
  if (!isStageFocusMode.value || mapZoom.value < 110) return []
  return focusedWorldOrbitTracks.value
})

const renderedSolarBodies = computed(() => {
  if (!lowDetailMode.value && mapZoom.value >= 72) return solarBodies.value
  const allowedIds = new Set(['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'])
  return solarBodies.value.filter((body) => allowedIds.has(body.id))
})

const stageClusters = computed(() => stagePlanets.value)

const selectedStage = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'stage') return null
  return stageClusters.value.find((cluster) => cluster.id === selectedEntity.value.id) || null
})

const selectedWorld = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'world') return null
  return store.worlds.find((world) => world.id === selectedEntity.value.id) || null
})
const selectedWorldBodyId = computed(() => (selectedWorld.value ? resolveBodyId(selectedWorld.value) : null))

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

const selectedWorldOperationGroups = computed(() => {
  return selectedWorldSections.value.map((section) => ({
    ...section,
    missions: store.missions.filter((mission) => mission.sectionId === section.id),
  }))
})

const selectedWorldPeers = computed(() => {
  if (!selectedWorld.value) return []
  return store.worlds.filter(
    (world) => world.chapterId === selectedWorld.value.chapterId && world.id !== selectedWorld.value.id
  )
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

function resolveAnchorType(world) {
  const type = world.locationType || 'orbit'
  if (type === 'surface') return 'surface'
  if (type === 'satellite') return 'satellite'
  return 'orbit'
}

function getWorldOrbitRadius(world, body, anchorType, index = 0) {
  if (anchorType === 'surface') return Math.max(body.displayRadius + 8 + (index % 2), body.displayRadius + 7)
  if (anchorType === 'satellite') {
    return body.displayRadius + 18 + ((world.orbitalBand || 1) * 4) + ((index % 5) * 4)
  }
  return body.displayRadius + 28 + ((world.orbitalBand || 1) * 6) + ((index % 6) * 6)
}

function getWorldNodePosition(body, anchorType, orbitRadius, angle) {
  if (anchorType === 'surface') {
    return pointOnCircle(body.x, body.y, body.displayRadius + 5, angle)
  }
  return pointOnCircle(body.x, body.y, orbitRadius, angle)
}

function getWorldLabelAnchor(x, y, referenceX = solarCenter.x, referenceY = solarCenter.y) {
  const isRight = x >= referenceX
  const isBottom = y >= referenceY

  return {
    sideX: isRight ? 1 : -1,
    sideY: isBottom ? 1 : -1,
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

function truncateLabel(label, maxLength = 16) {
  if (!label) return ''
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength - 1)}…`
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function markInteraction() {
  return
}

function syncCameraTargets() {
  targetZoom.value = mapZoom.value
  targetCameraX.value = cameraX.value
  targetCameraY.value = cameraY.value
}

function clampCameraPosition(nextX, nextY, zoomPercent = targetZoom.value) {
  const safeZoom = clamp(zoomPercent, MIN_ZOOM, effectiveMaxZoom.value)
  const scale = safeZoom / 100
  const halfViewWidth = VIEWBOX_CENTER.x / scale
  const halfViewHeight = VIEWBOX_CENTER.y / scale

  const minCameraX = SCENE_MIN_X + halfViewWidth
  const maxCameraX = SCENE_MAX_X - halfViewWidth
  const minCameraY = SCENE_MIN_Y + halfViewHeight
  const maxCameraY = SCENE_MAX_Y - halfViewHeight

  const clampedX = minCameraX > maxCameraX
    ? (SCENE_MIN_X + SCENE_MAX_X) / 2
    : clamp(nextX, minCameraX, maxCameraX)
  const clampedY = minCameraY > maxCameraY
    ? (SCENE_MIN_Y + SCENE_MAX_Y) / 2
    : clamp(nextY, minCameraY, maxCameraY)

  return { x: clampedX, y: clampedY, zoom: safeZoom }
}

function stopCameraAnimation() {
  if (cameraFrame) {
    cancelAnimationFrame(cameraFrame)
    cameraFrame = null
  }
}

function stopDragFrame() {
  if (dragFrame) {
    cancelAnimationFrame(dragFrame)
    dragFrame = null
  }
}

function tickCameraAnimation() {
  const bounded = clampCameraPosition(targetCameraX.value, targetCameraY.value, targetZoom.value)
  targetZoom.value = bounded.zoom
  targetCameraX.value = bounded.x
  targetCameraY.value = bounded.y

  const zoomDelta = bounded.zoom - mapZoom.value
  const xDelta = bounded.x - cameraX.value
  const yDelta = bounded.y - cameraY.value
  const epsilon = 0.02

  if (Math.abs(zoomDelta) < epsilon && Math.abs(xDelta) < epsilon && Math.abs(yDelta) < epsilon) {
    mapZoom.value = targetZoom.value
    cameraX.value = targetCameraX.value
    cameraY.value = targetCameraY.value
    cameraFrame = null
    return
  }

  const ease = motionEnabled.value ? CAMERA_EASE : 1
  mapZoom.value += zoomDelta * ease
  cameraX.value += xDelta * ease
  cameraY.value += yDelta * ease

  cameraFrame = requestAnimationFrame(tickCameraAnimation)
}

function animateCameraToTargets() {
  if (!motionEnabled.value || lowDetailMode.value) {
    mapZoom.value = targetZoom.value
    cameraX.value = targetCameraX.value
    cameraY.value = targetCameraY.value
    stopCameraAnimation()
    return
  }

  if (!cameraFrame) {
    cameraFrame = requestAnimationFrame(tickCameraAnimation)
  }
}

function applyCameraImmediately(nextX, nextY, nextZoom = mapZoom.value) {
  const bounded = clampCameraPosition(nextX, nextY, nextZoom)
  mapZoom.value = bounded.zoom
  cameraX.value = bounded.x
  cameraY.value = bounded.y
  syncCameraTargets()
}

function scenePx(value) {
  return value * inverseSceneScale.value
}

function isBodyLabelVisible(body) {
  if (isDragging.value || dragState.active) return false
  if (!isStageFocusMode.value) return body.id !== 'sun'

  if (!selectedWorldBodyId.value) {
    if (mapZoom.value < 120) return false
    const distance = Math.hypot(body.x - cameraX.value, body.y - cameraY.value)
    const revealRadius = 190 / mapScale.value
    if (distance > revealRadius) return false
    if (mapZoom.value < 180 && (body.id === 'moon' || body.id === 'uranus' || body.id === 'neptune')) return false
    return true
  }

  if (body.id === selectedWorldBodyId.value) return true
  return selectedWorldBodyId.value === 'moon' && body.id === 'earth'
}

function getStageClusterScale(stageId) {
  if (selectedStage.value?.id === stageId) return 1.22
  if (!hoverEffectsEnabled.value) return 1
  if (hoveredStageId.value === stageId) return 1.35
  return 1
}

function getStageClusterRingRadius(stageId) {
  return scenePx(13 * getStageClusterScale(stageId))
}

function getStageClusterHitRadius(stageId) {
  return scenePx(20 * getStageClusterScale(stageId))
}

function getWorldNodeScale(worldId) {
  if (selectedWorld.value?.id === worldId) return 1.2
  if (!hoverEffectsEnabled.value) return 1
  if (hoveredWorldId.value === worldId) return 1.35
  return 1
}

function getWorldNodeCoreRadius(world) {
  return scenePx(Math.max(5.5, world.nodeRadius - 3.5) * getWorldNodeScale(world.id))
}

function getWorldNodeRingRadius(world) {
  return scenePx((world.nodeRadius + 1.5) * getWorldNodeScale(world.id))
}

function getWorldNodeHitRadius(world) {
  return Math.max(getWorldNodeRingRadius(world) + scenePx(8), scenePx(18))
}

function getWorldNodeTextSize(worldId) {
  return 6 * getWorldNodeScale(worldId)
}

function getWorldLabelSize(worldId) {
  return 8 * getWorldNodeScale(worldId)
}

function getWorldLabelX(world) {
  return world.labelSideX * scenePx(14)
}

function getWorldLabelY(world) {
  return world.labelSideY > 0 ? scenePx(8) : scenePx(-8)
}

function isWorldLabelVisible(world) {
  if (hoverEffectsEnabled.value && hoveredWorldId.value === world.id) return true
  if (selectedWorld.value) return selectedWorld.value.id === world.id
  if (!showWorldLabels.value || mapZoom.value < 260) return false
  if (selectedStage.value && selectedStage.value.id !== world.chapterId) return false

  const distance = Math.hypot(world.x - cameraX.value, world.y - cameraY.value)
  return distance <= (130 / mapScale.value)
}

function clientToViewBox(clientX, clientY) {
  if (!viewportMetrics.ready) refreshViewportMetrics()

  return {
    x: ((clientX - viewportMetrics.left - viewportMetrics.offsetX) / viewportMetrics.renderWidth) * VIEWBOX_WIDTH,
    y: ((clientY - viewportMetrics.top - viewportMetrics.offsetY) / viewportMetrics.renderHeight) * VIEWBOX_HEIGHT,
  }
}

function refreshViewportMetrics() {
  const element = mapViewportRef.value
  if (!element) return

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

  viewportMetrics.left = rect.left
  viewportMetrics.top = rect.top
  viewportMetrics.renderWidth = renderWidth
  viewportMetrics.renderHeight = renderHeight
  viewportMetrics.offsetX = offsetX
  viewportMetrics.offsetY = offsetY
  viewportMetrics.ready = true
}

function viewToWorld(
  viewPoint,
  scale = targetZoom.value / 100,
  centerX = targetCameraX.value,
  centerY = targetCameraY.value
) {
  return {
    x: centerX + (viewPoint.x - VIEWBOX_CENTER.x) / scale,
    y: centerY + (viewPoint.y - VIEWBOX_CENTER.y) / scale,
  }
}

function worldToView(x, y) {
  return {
    x: VIEWBOX_CENTER.x + (x - cameraX.value) * mapScale.value,
    y: VIEWBOX_CENTER.y + (y - cameraY.value) * mapScale.value,
  }
}

function worldRadiusToView(radius) {
  return radius * mapScale.value
}

function viewUnitsForPx(px) {
  if (!viewportMetrics.renderWidth) return px
  return px * (VIEWBOX_WIDTH / viewportMetrics.renderWidth)
}

function getCanvasContext() {
  const canvas = mapCanvasRef.value
  if (!canvas) return null
  const context = canvas.getContext('2d', { alpha: false, desynchronized: true })
  if (!context) return null
  const width = Math.max(1, Math.round(canvas.clientWidth))
  const height = Math.max(1, Math.round(canvas.clientHeight))
  const dpr = Math.max(1, Math.min(CANVAS_DPR_MAX, window.devicePixelRatio || 1))
  const pixelWidth = Math.round(width * dpr)
  const pixelHeight = Math.round(height * dpr)

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = false
  return context
}

function updateMapPalette() {
  const palette = getComputedStyle(document.documentElement)
  mapPalette.accent = palette.getPropertyValue('--accent-color').trim() || '#00ffd9'
  mapPalette.textPrimary = palette.getPropertyValue('--text-primary').trim() || '#ffffff'
  mapPalette.textSecondary = palette.getPropertyValue('--text-secondary').trim() || '#a7adb7'
}

function scheduleMapRender() {
  if (typeof window === 'undefined') return
  if (mapRenderFrame) return
  mapRenderFrame = requestAnimationFrame(() => {
    mapRenderFrame = null
    drawMapCanvas()
  })
}

function clearMapHover() {
  const hadHover = Boolean(hoveredWorldId.value || hoveredStageId.value)
  hoveredWorldId.value = null
  hoveredStageId.value = null
  if (hadHover) scheduleMapRender()
}

function findHoveredEntity(clientX, clientY) {
  const viewPoint = clientToViewBox(clientX, clientY)
  const worldPoint = viewToWorld(viewPoint, mapScale.value, cameraX.value, cameraY.value)

  if (showWorldMarkers.value) {
    let bestWorld = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const world of visibleWorldNodes.value) {
      const distance = Math.hypot(world.x - worldPoint.x, world.y - worldPoint.y)
      if (distance > getWorldNodeHitRadius(world)) continue
      if (distance < bestDistance) {
        bestDistance = distance
        bestWorld = world
      }
    }

    if (bestWorld) return { type: 'world', id: bestWorld.id }
  }

  if (showStageClusters.value) {
    let bestStage = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const stage of stageClusters.value) {
      const distance = Math.hypot(stage.x - worldPoint.x, stage.y - worldPoint.y)
      const body = bodyById.value[stage.bodyId]
      const stageHitRadius = Math.max(
        getStageClusterHitRadius(stage.id),
        body ? (body.displayRadius + 12) : 28
      )
      if (distance > stageHitRadius) continue
      if (distance < bestDistance) {
        bestDistance = distance
        bestStage = stage
      }
    }

    if (bestStage) return { type: 'stage', id: bestStage.id }
  }

  return null
}

function drawMapCanvas() {
  refreshViewportMetrics()
  const ctx = getCanvasContext()
  if (!ctx) return
  const accent = mapPalette.accent
  const textPrimary = mapPalette.textPrimary
  const textSecondary = mapPalette.textSecondary
  const interactionCut = isDragging.value || dragState.active || isWheelInteracting.value

  const canvas = mapCanvasRef.value
  const width = canvas?.clientWidth || 0
  const height = canvas?.clientHeight || 0

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(6, 9, 14, 0.95)'
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(viewportMetrics.offsetX, viewportMetrics.offsetY)
  ctx.scale(viewportMetrics.renderWidth / VIEWBOX_WIDTH, viewportMetrics.renderHeight / VIEWBOX_HEIGHT)

  const px1 = viewUnitsForPx(1)
  const px2 = viewUnitsForPx(2)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  const stars = interactionCut ? renderedStarField.value.filter((_, index) => index % 2 === 0) : renderedStarField.value
  for (const star of stars) {
    ctx.globalAlpha = star.opacity
    ctx.beginPath()
    ctx.arc(star.x, star.y, Math.max(viewUnitsForPx(star.r * 1.2), px1 * 0.5), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const centerView = worldToView(solarCenter.x, solarCenter.y)

  ctx.strokeStyle = 'rgba(157, 168, 194, 0.26)'
  ctx.lineWidth = Math.max(px1, viewUnitsForPx(1.3))
  ctx.setLineDash([viewUnitsForPx(7), viewUnitsForPx(11)])
  for (const track of renderedSolarOrbitTracks.value) {
    ctx.beginPath()
    ctx.arc(centerView.x, centerView.y, worldRadiusToView(track.r), 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])

  if (!interactionCut && !lowDetailMode.value && mapZoom.value >= 180) {
    ctx.strokeStyle = 'rgba(160, 174, 220, 0.22)'
    ctx.lineWidth = viewUnitsForPx(8)
    ctx.setLineDash([viewUnitsForPx(1), viewUnitsForPx(12)])
    ctx.beginPath()
    ctx.arc(centerView.x, centerView.y, worldRadiusToView(asteroidBeltRadius), 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  if (!interactionCut && renderedWorldOrbitTracks.value.length) {
    ctx.strokeStyle = `${accent}70`
    ctx.lineWidth = viewUnitsForPx(1.2)
    ctx.setLineDash([viewUnitsForPx(4), viewUnitsForPx(8)])
    for (const track of renderedWorldOrbitTracks.value) {
      const anchor = worldToView(track.cx, track.cy)
      ctx.beginPath()
      ctx.arc(anchor.x, anchor.y, worldRadiusToView(track.r), 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  const bodyColor = {
    sun: '#f7b950',
    mercury: '#9ba3b0',
    venus: '#c99758',
    earth: '#4b7fe6',
    moon: '#9aa3b3',
    mars: '#c55a44',
    jupiter: '#d3b18c',
    saturn: '#cfa36d',
    uranus: '#8dc7dd',
    neptune: '#718cd6',
  }

  for (const body of renderedSolarBodies.value) {
    const point = worldToView(body.x, body.y)
    const radius = worldRadiusToView(body.displayRadius)

    if (body.id === 'sun' && !performanceCutMode.value) {
      ctx.fillStyle = 'rgba(255, 183, 77, 0.18)'
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius * 1.8, 0, Math.PI * 2)
      ctx.fill()
    }

    if (body.id === 'saturn' && !performanceCutMode.value) {
      ctx.strokeStyle = 'rgba(231, 208, 145, 0.82)'
      ctx.lineWidth = viewUnitsForPx(4)
      ctx.beginPath()
      ctx.ellipse(point.x, point.y, radius * 1.95, radius * 0.7, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = bodyColor[body.id] || '#9aa7be'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = viewUnitsForPx(1)
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    if (interactionCut || !isBodyLabelVisible(body)) continue
    ctx.fillStyle = textPrimary
    ctx.font = `${Math.max(viewUnitsForPx(body.id === 'sun' ? 10 : 9), px2)}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncateLabel(body.label, 12), point.x, point.y + radius + viewUnitsForPx(16))
  }

  if (showStageClusters.value) {
    for (const cluster of stageClusters.value) {
      const point = worldToView(cluster.x, cluster.y)
      const ringRadius = worldRadiusToView(getStageClusterRingRadius(cluster.id))
      const isActive = selectedStage.value?.id === cluster.id
      const body = bodyById.value[cluster.bodyId]
      const bodyRadius = worldRadiusToView(body?.displayRadius || 16)

      ctx.strokeStyle = isActive ? accent : 'rgba(157, 168, 194, 0.44)'
      ctx.lineWidth = viewUnitsForPx(1.2)
      ctx.beginPath()
      ctx.arc(point.x, point.y, Math.max(ringRadius, bodyRadius + viewUnitsForPx(4)), 0, Math.PI * 2)
      ctx.stroke()

      if (interactionCut) continue

      ctx.fillStyle = textSecondary
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${Math.max(viewUnitsForPx(8), px2)}px Inter, system-ui, sans-serif`
      ctx.fillText(
        truncateLabel(cluster.title, 18),
        point.x,
        point.y + bodyRadius + viewUnitsForPx(14)
      )

      if (isActive || hoveredStageId.value === cluster.id) {
        ctx.strokeStyle = `${accent}88`
        ctx.lineWidth = viewUnitsForPx(1)
        ctx.beginPath()
        ctx.arc(point.x, point.y, bodyRadius + viewUnitsForPx(10), 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  if (showWorldMarkers.value) {
    for (const world of visibleWorldNodes.value) {
      const point = worldToView(world.x, world.y)
      const isActive = selectedWorld.value?.id === world.id
      const isMuted = selectedStage.value && selectedStage.value.id !== world.chapterId
      const alpha = isMuted ? 0.42 : 1

      ctx.globalAlpha = alpha
      ctx.strokeStyle = isActive ? accent : `${accent}88`
      ctx.lineWidth = viewUnitsForPx(1)
      ctx.beginPath()
      ctx.arc(point.x, point.y, worldRadiusToView(getWorldNodeRingRadius(world)), 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = 'rgba(15, 24, 36, 0.9)'
      ctx.beginPath()
      ctx.arc(point.x, point.y, worldRadiusToView(getWorldNodeCoreRadius(world)), 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = isActive ? accent : textPrimary
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${Math.max(viewUnitsForPx(getWorldNodeTextSize(world.id)), px2)}px Inter, system-ui, sans-serif`
      ctx.fillText(world.mapTag || buildMapTag(world.name), point.x, point.y)

      if (!interactionCut && isWorldLabelVisible(world)) {
        ctx.font = `${Math.max(viewUnitsForPx(getWorldLabelSize(world.id)), px2)}px Inter, system-ui, sans-serif`
        ctx.textAlign = world.labelAnchor
        ctx.fillText(
          truncateLabel(world.name, 18),
          point.x + worldRadiusToView(getWorldLabelX(world)),
          point.y + worldRadiusToView(getWorldLabelY(world))
        )
      }
    }
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

function focusCamera(nextX, nextY, nextZoom = targetZoom.value, immediate = false) {
  const bounded = clampCameraPosition(nextX, nextY, nextZoom)
  targetZoom.value = bounded.zoom
  targetCameraX.value = bounded.x
  targetCameraY.value = bounded.y

  if (immediate) {
    applyCameraImmediately(targetCameraX.value, targetCameraY.value, targetZoom.value)
    return
  }

  animateCameraToTargets()
}

function resetCamera() {
  focusedStageId.value = null
  selectedEntity.value = null
  isPanelOpen.value = false
  focusCamera(solarCenter.x, solarCenter.y, DEFAULT_ZOOM)
}

function stepZoom(direction) {
  markInteraction()
  const factor = direction > 0 ? 1.5 : (1 / 1.5)
  const nextZoom = clamp(targetZoom.value * factor, MIN_ZOOM, effectiveMaxZoom.value)
  const bounded = clampCameraPosition(targetCameraX.value, targetCameraY.value, nextZoom)
  focusCamera(bounded.x, bounded.y, bounded.zoom)
}

function toggleExplorer() {
  explorerOpen.value = !explorerOpen.value
}

function onWheel(event) {
  markInteraction()
  isWheelInteracting.value = true
  if (wheelInteractionTimeout) {
    clearTimeout(wheelInteractionTimeout)
    wheelInteractionTimeout = null
  }
  wheelState.clientX = event.clientX
  wheelState.clientY = event.clientY
  wheelState.deltaX += event.deltaX
  wheelState.deltaY += event.deltaY
  wheelState.pinchLike = wheelState.pinchLike || event.ctrlKey || event.metaKey

  if (wheelFrame) return

  wheelFrame = requestAnimationFrame(() => {
    wheelFrame = null
    const absX = Math.abs(wheelState.deltaX)
    const absY = Math.abs(wheelState.deltaY)
    const panMode = !wheelState.pinchLike && (absX > 0.1 || absY < 24)

    if (panMode) {
      const nextCameraX = targetCameraX.value - ((wheelState.deltaX * WHEEL_PAN_SENSITIVITY) / mapScale.value)
      const nextCameraY = targetCameraY.value - ((wheelState.deltaY * WHEEL_PAN_SENSITIVITY) / mapScale.value)
      const bounded = clampCameraPosition(nextCameraX, nextCameraY, targetZoom.value)
      applyCameraImmediately(bounded.x, bounded.y, bounded.zoom)
      wheelState.deltaX = 0
      wheelState.deltaY = 0
      wheelState.pinchLike = false
      return
    }

    const viewPoint = clientToViewBox(wheelState.clientX, wheelState.clientY)
    const pointerWorld = viewToWorld(viewPoint)
    const boundedDelta = clamp(wheelState.deltaY, -420, 420)
    const zoomFactor = Math.exp(-boundedDelta * WHEEL_ZOOM_SENSITIVITY)
    wheelState.deltaX = 0
    wheelState.deltaY = 0
    wheelState.pinchLike = false
    const nextZoom = clamp(targetZoom.value * zoomFactor, MIN_ZOOM, effectiveMaxZoom.value)
    const nextScale = nextZoom / 100

    const nextCameraX = pointerWorld.x - (viewPoint.x - VIEWBOX_CENTER.x) / nextScale
    const nextCameraY = pointerWorld.y - (viewPoint.y - VIEWBOX_CENTER.y) / nextScale
    const bounded = clampCameraPosition(nextCameraX, nextCameraY, nextZoom)
    applyCameraImmediately(bounded.x, bounded.y, bounded.zoom)
    wheelInteractionTimeout = setTimeout(() => {
      isWheelInteracting.value = false
      wheelInteractionTimeout = null
      scheduleMapRender()
    }, 120)
  })
}

function onDoubleClick(event) {
  markInteraction()
  const hovered = findHoveredEntity(event.clientX, event.clientY)
  if (hovered?.type === 'stage') {
    selectBodyByStage(hovered.id, { force: true })
    return
  }
  if (hovered?.type === 'world') {
    selectWorld(hovered.id, { force: true })
    return
  }
  const viewPoint = clientToViewBox(event.clientX, event.clientY)
  const worldPoint = viewToWorld(viewPoint)
  focusCamera(worldPoint.x, worldPoint.y, Math.min(effectiveMaxZoom.value, targetZoom.value + 50))
}

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest('button, .world-node, .stage-cluster, .explorer-rail'))
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return
  if (isInteractiveTarget(event.target)) return

  refreshViewportMetrics()
  stopCameraAnimation()
  stopDragFrame()
  const point = clientToViewBox(event.clientX, event.clientY)
  dragState.active = true
  dragState.pointerId = event.pointerId
  dragState.startX = point.x
  dragState.startY = point.y
  dragState.startCameraX = cameraX.value
  dragState.startCameraY = cameraY.value
  dragState.moved = false
  markInteraction()
  mapViewportRef.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (!dragState.active || dragState.pointerId !== event.pointerId) {
    if (dragState.active) return
    if (isInteractiveTarget(event.target)) {
      if (mapViewportRef.value && !isDragging.value) {
        mapViewportRef.value.style.cursor = 'default'
      }
      clearMapHover()
      return
    }
    const hovered = findHoveredEntity(event.clientX, event.clientY)
    if (!hoverEffectsEnabled.value) {
      if (hoveredWorldId.value || hoveredStageId.value) {
        hoveredWorldId.value = null
        hoveredStageId.value = null
        scheduleMapRender()
      }
      if (mapViewportRef.value && !isDragging.value) {
        mapViewportRef.value.style.cursor = hovered ? 'pointer' : 'grab'
      }
      return
    }
    const nextWorld = hovered?.type === 'world' ? hovered.id : null
    const nextStage = hovered?.type === 'stage' ? hovered.id : null
    const hasChanged = hoveredWorldId.value !== nextWorld || hoveredStageId.value !== nextStage
    hoveredWorldId.value = nextWorld
    hoveredStageId.value = nextStage
    if (mapViewportRef.value && !isDragging.value) {
      mapViewportRef.value.style.cursor = hovered ? 'pointer' : 'grab'
    }
    if (hasChanged) scheduleMapRender()
    return
  }

  dragState.lastClientX = event.clientX
  dragState.lastClientY = event.clientY

  if (dragFrame) return

  dragFrame = requestAnimationFrame(() => {
    dragFrame = null
    if (!dragState.active) return

    const point = clientToViewBox(dragState.lastClientX, dragState.lastClientY)
    const deltaX = point.x - dragState.startX
    const deltaY = point.y - dragState.startY

    if (!dragState.moved && Math.hypot(deltaX, deltaY) > 2) {
      dragState.moved = true
      isDragging.value = true
    }

    const nextCameraX = dragState.startCameraX - (deltaX / mapScale.value)
    const nextCameraY = dragState.startCameraY - (deltaY / mapScale.value)
    markInteraction()
    const bounded = clampCameraPosition(nextCameraX, nextCameraY, mapZoom.value)
    applyCameraImmediately(bounded.x, bounded.y, bounded.zoom)
  })
}

function onPointerUp(event) {
  if (!dragState.active || dragState.pointerId !== event.pointerId) return

  mapViewportRef.value?.releasePointerCapture?.(event.pointerId)
  const dragged = dragState.moved

  if (dragged) {
    suppressClickUntil.value = Date.now() + 140
  }

  dragState.active = false
  dragState.pointerId = null
  dragState.moved = false
  dragState.lastClientX = 0
  dragState.lastClientY = 0
  stopDragFrame()
  isDragging.value = false
  if (mapViewportRef.value) {
    mapViewportRef.value.style.cursor = 'grab'
  }

  if (!dragged && Date.now() >= suppressClickUntil.value) {
    const hovered = findHoveredEntity(event.clientX, event.clientY)
    if (hovered?.type === 'stage') {
      selectBodyByStage(hovered.id)
    } else if (hovered?.type === 'world') {
      selectWorld(hovered.id)
    }
  }

  syncCameraTargets()
  scheduleMapRender()
}

function onPointerLeave() {
  if (dragState.active) return
  if (mapViewportRef.value) {
    mapViewportRef.value.style.cursor = 'grab'
  }
  clearMapHover()
}

function selectStage(stageId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return

  const stage = stageClusters.value.find((cluster) => cluster.id === stageId)
  if (!stage) return

  selectedEntity.value = { type: 'stage', id: stageId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
}

function selectBody(bodyId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return
  const body = bodyById.value[bodyId]
  if (!body) return

  selectedEntity.value = { type: 'body', id: bodyId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
}

function selectBodyByStage(stageId, options = {}) {
  const stage = stagePlanetById.value[stageId]
  if (!stage) return
  selectBody(stage.bodyId, options)
}

function openStageWorlds(stageId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return

  const stage = stageClusters.value.find((cluster) => cluster.id === stageId)
  if (!stage) return

  focusedStageId.value = stage.id
  selectedEntity.value = { type: 'stage', id: stageId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
  const minStageZoom = lowDetailMode.value ? 180 : 220
  const targetZoom = clamp(98000 / Math.max(stage.radius, 180), minStageZoom, effectiveMaxZoom.value)
  focusCamera(stage.x, stage.y, Math.max(mapZoom.value, targetZoom))
}

function selectWorld(worldId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return

  let worldNode = visibleWorldNodes.value.find((world) => world.id === worldId)
  if (!worldNode) {
    const fallbackWorld = store.worlds.find((world) => world.id === worldId)
    if (!fallbackWorld) return
    focusedStageId.value = fallbackWorld.chapterId || null
    worldNode = focusedWorldNodes.value.find((world) => world.id === worldId)
  }
  if (!worldNode) return

  activateWorld(worldId)
  selectedEntity.value = { type: 'world', id: worldId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
  const focusBody = bodyById.value[worldNode.bodyId] || worldNode
  const focusZoom = lowDetailMode.value
    ? (worldNode.anchorType === 'surface' ? 280 : 230)
    : (worldNode.anchorType === 'surface' ? 920 : 720)
  focusCamera(focusBody.x, focusBody.y, Math.max(mapZoom.value, focusZoom))
}

function closePanel() {
  isPanelOpen.value = false
  scheduleMapRender()
}

function closeMobilePanels() {
  explorerOpen.value = false
  isPanelOpen.value = false
  scheduleMapRender()
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

watchEffect(() => {
  mapZoom.value
  cameraX.value
  cameraY.value
  hoveredWorldId.value
  hoveredStageId.value
  selectedStage.value?.id
  selectedWorld.value?.id
  showStageClusters.value
  showWorldMarkers.value
  showWorldLabels.value
  renderedStarField.value.length
  renderedSolarOrbitTracks.value.length
  renderedWorldOrbitTracks.value.length
  renderedSolarBodies.value.length
  scheduleMapRender()
})

watchEffect(() => {
  const stageId = focusedStageId.value
  if (!stageId) return
  if (targetZoom.value >= STAGE_FOCUS_EXIT_ZOOM && mapZoom.value >= STAGE_FOCUS_EXIT_ZOOM) return

  const stage = stagePlanetById.value[stageId]
  focusedStageId.value = null
  if (stage && selectedEntity.value?.type !== 'stage') {
    selectedEntity.value = { type: 'body', id: stage.bodyId }
  }
})

watchEffect(() => {
  systemStore.accentColor
  systemStore.systemTheme
  updateMapPalette()
  scheduleMapRender()
})

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    const cores = navigator.hardwareConcurrency ?? 8
    const memory = navigator.deviceMemory ?? 8
    lowPowerDevice.value = cores <= 4 || memory <= 4
  }

  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionHandler = (event) => {
    prefersReducedMotion.value = event.matches
  }
  prefersReducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', reducedMotionHandler)

  resizeHandler = () => {
    isMobileView.value = window.innerWidth <= MOBILE_BREAKPOINT
    viewportMetrics.ready = false
    refreshViewportMetrics()
    if (!isMobileView.value) return
    explorerOpen.value = false
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
  updateMapPalette()
  if (mapViewportRef.value) {
    mapViewportRef.value.style.cursor = 'grab'
  }
  scheduleMapRender()
})

onBeforeUnmount(() => {
  stopCameraAnimation()
  stopDragFrame()
  if (wheelFrame) {
    cancelAnimationFrame(wheelFrame)
    wheelFrame = null
  }
  if (mapRenderFrame) {
    cancelAnimationFrame(mapRenderFrame)
    mapRenderFrame = null
  }
  if (wheelInteractionTimeout) {
    clearTimeout(wheelInteractionTimeout)
    wheelInteractionTimeout = null
  }
  if (reducedMotionQuery && reducedMotionHandler) {
    reducedMotionQuery.removeEventListener('change', reducedMotionHandler)
    reducedMotionQuery = null
    reducedMotionHandler = null
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})
</script>

<style scoped>
.stages-page {
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.map-layout {
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

.explorer-panel {
  position: absolute;
  left: 10px;
  top: 10px;
  bottom: 10px;
  width: min(340px, calc(100vw - 44px));
  max-width: calc(100vw - 44px);
  overflow: hidden;
  opacity: 0;
  transform: translateX(calc(-100% - 18px));
  pointer-events: none;
  z-index: 35;
  transition:
    opacity 140ms ease,
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}

.explorer-panel.is-open {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.explorer-inner {
  height: 100%;
  min-height: 0;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-elevated);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.explorer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-elevated);
  flex: 0 0 auto;
}

.explorer-scroll {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  min-height: 0;
  padding: 14px 16px 18px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.overview-card,
.explorer-card,
.explorer-world-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
}

.overview-card,
.explorer-card-button,
.explorer-world-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  box-sizing: border-box;
}

.explorer-card {
  overflow: hidden;
}

.explorer-card-button,
.explorer-world-card {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.explorer-card-top,
.explorer-world-head,
.toolbar-actions,
.mission-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.explorer-world-list,
.mission-section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 12px;
}

.explorer-world-card small,
.explorer-world-card span {
  color: var(--text-secondary);
}

.card-badge,
.world-tag {
  border-radius: 999px;
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  font-size: 0.66rem;
  color: var(--text-secondary);
}

.map-pane {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.map-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, var(--bg-main) 12%);
}

.toolbar-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.toolbar-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 0;
  border-radius: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 48%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, black 8%), var(--bg-main));
  cursor: grab;
  touch-action: none;
}

.map-inline-title {
  position: absolute;
  left: 14px;
  top: 12px;
  z-index: 7;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--text-secondary) 86%, white 14%);
  pointer-events: none;
}

.map-viewport.is-dragging {
  cursor: grabbing;
}

.solar-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.map-controls {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 6;
}

.map-control-button,
.map-zoom-pill {
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 94%, var(--bg-main) 6%);
  color: var(--text-primary);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.map-control-button {
  padding: 0 12px;
  cursor: pointer;
  font: inherit;
}

.map-control-button--icon {
  width: 34px;
  padding: 0;
  font-size: 1rem;
}

.map-zoom-pill {
  display: grid;
  place-items: center;
  min-width: 62px;
  padding: 0 10px;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.space-backdrop {
  fill: color-mix(in srgb, var(--bg-main) 94%, black 6%);
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
  stroke: color-mix(in srgb, var(--text-secondary) 45%, transparent);
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
  stroke: color-mix(in srgb, var(--accent-color) 44%, transparent);
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
  fill: var(--text-primary);
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
  fill: none;
  stroke: color-mix(in srgb, var(--text-secondary) 44%, transparent);
  stroke-width: 1.1;
}

.stage-cluster-hit,
.world-node-hit {
  fill: transparent;
  stroke: transparent;
}

.stage-cluster-core {
  fill: color-mix(in srgb, var(--bg-elevated) 84%, transparent);
  stroke: color-mix(in srgb, var(--text-primary) 35%, transparent);
  stroke-width: 0.9;
}

.stage-cluster-index {
  fill: var(--text-primary);
  font-size: 8px;
  font-weight: 700;
}

.stage-cluster-count {
  fill: var(--text-secondary);
  font-size: 6px;
  letter-spacing: 0.12em;
}

.stage-cluster.is-active .stage-cluster-ring,
.stage-cluster.is-active .stage-cluster-core {
  stroke: var(--accent-color);
}

.world-node-ring {
  fill: none;
  stroke: color-mix(in srgb, var(--accent-color) 52%, transparent);
  stroke-width: 1;
}

.world-node-core {
  fill: color-mix(in srgb, var(--bg-elevated) 90%, transparent);
  stroke: color-mix(in srgb, var(--text-primary) 42%, transparent);
  stroke-width: 0.9;
}

.world-node-tag {
  fill: var(--text-primary);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.04em;
  pointer-events: none;
}

.world-node-label {
  fill: var(--text-primary);
  font-size: 9px;
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

.map-viewport.is-low-detail .stage-cluster-ring,
.map-viewport.is-low-detail .stage-cluster-core,
.map-viewport.is-low-detail .stage-cluster-index,
.map-viewport.is-low-detail .stage-cluster-count,
.map-viewport.is-low-detail .world-node-ring,
.map-viewport.is-low-detail .world-node-core,
.map-viewport.is-low-detail .world-node-tag,
.map-viewport.is-low-detail .world-node-label {
  transition: none;
}

.map-viewport.is-performance-cut .map-control-button,
.map-viewport.is-performance-cut .map-zoom-pill,
.map-viewport.is-performance-cut .sun-aura,
.map-viewport.is-performance-cut .saturn-ring {
  box-shadow: none;
  filter: none;
}

:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .stage-cluster-ring {
  transition: stroke 0.1s linear;
}

:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .stage-cluster-core {
  transition: fill 0.1s linear, stroke 0.1s linear;
}

:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .stage-cluster-index,
:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .stage-cluster-count,
:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .world-node-tag,
:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .world-node-label {
  transition: fill 0.1s linear;
}

:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .world-node-ring {
  transition: stroke 0.1s linear;
}

:global(html[data-animations='true']) .map-viewport:not(.is-performance-cut) .world-node-core {
  transition: fill 0.1s linear, stroke 0.1s linear;
}

:global(html[data-animations='true']) .explorer-panel,
:global(html[data-animations='true']) .detail-panel {
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

:global(html[data-animations='true']) .explorer-card-button,
:global(html[data-animations='true']) .explorer-world-card,
:global(html[data-animations='true']) .list-item,
:global(html[data-animations='true']) .mission-item,
:global(html[data-animations='true']) .panel-metric,
:global(html[data-animations='true']) .map-control-button,
:global(html[data-animations='true']) .explorer-rail {
  transition:
    transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 140ms linear,
    background-color 140ms linear,
    box-shadow 160ms ease,
    color 120ms linear !important;
}

:global(html[data-animations='true']) .explorer-card-button:hover,
:global(html[data-animations='true']) .explorer-world-card:hover,
:global(html[data-animations='true']) .list-item:hover,
:global(html[data-animations='true']) .mission-item:hover,
:global(html[data-animations='true']) .panel-metric:hover {
  transform: translate3d(0, -2px, 0);
  border-color: color-mix(in srgb, var(--accent-color) 46%, var(--border-color));
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
}

:global(html[data-animations='true']) .map-control-button:hover,
:global(html[data-animations='true']) .explorer-rail:hover {
  transform: translate3d(0, -1px, 0);
  border-color: color-mix(in srgb, var(--accent-color) 56%, var(--border-color));
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
}

:global(html[data-animations='false']) .explorer-panel,
:global(html[data-animations='false']) .detail-panel,
:global(html[data-animations='false']) .stage-cluster-ring,
:global(html[data-animations='false']) .stage-cluster-core,
:global(html[data-animations='false']) .stage-cluster-index,
:global(html[data-animations='false']) .stage-cluster-count,
:global(html[data-animations='false']) .world-node-ring,
:global(html[data-animations='false']) .world-node-core,
:global(html[data-animations='false']) .world-node-tag,
:global(html[data-animations='false']) .world-node-label {
  transition: none !important;
}

.map-hint {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  border: 1px solid var(--border-color);
  pointer-events: none;
}

.explorer-rail {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  color: var(--text-primary);
  padding: 12px 8px;
  cursor: pointer;
}

.mobile-overlay {
  position: absolute;
  inset: 0;
  z-index: 28;
  border: 0;
  background: rgba(0, 0, 0, 0.28);
}

.detail-panel {
  position: absolute;
  right: 10px;
  top: 10px;
  bottom: 10px;
  width: min(420px, calc(100vw - 44px));
  max-width: calc(100vw - 44px);
  overflow: hidden;
  opacity: 0;
  transform: translateX(calc(100% + 18px));
  pointer-events: none;
  z-index: 34;
  transition:
    opacity 140ms ease,
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}

.detail-panel.is-open {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.detail-panel-inner {
  height: 100%;
  min-height: 0;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-elevated);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  box-sizing: border-box;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
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
  background: color-mix(in srgb, var(--bg-elevated) 90%, transparent);
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
  background: color-mix(in srgb, var(--bg-elevated) 86%, var(--accent-color) 2%);
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

.mission-section {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: color-mix(in srgb, var(--bg-elevated) 86%, var(--accent-color) 2%);
}

.panel-empty {
  display: grid;
  place-items: center;
  min-height: 180px;
}

.mission-section-head {
  align-items: flex-start;
  margin-bottom: 8px;
}

.mission-section-head small {
  color: var(--text-secondary);
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

@media (max-width: 980px) {
  .map-pane {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .explorer-panel {
    left: 8px;
    top: 8px;
    bottom: 8px;
    width: min(340px, 88vw);
    max-width: 88vw;
  }

  .explorer-panel:not(.is-open) {
    transform: translateX(calc(-100% - 14px));
  }

  .detail-panel {
    right: 8px;
    top: 8px;
    bottom: 8px;
    width: min(340px, 88vw);
  }

  .detail-panel:not(.is-open) {
    transform: translateX(calc(100% + 14px));
  }
}

@media (max-width: 720px) {
  .map-toolbar {
    padding: 6px 10px;
  }

  .toolbar-subtitle {
    display: none;
  }

  .map-controls {
    top: 10px;
    right: 10px;
    gap: 6px;
  }

  .map-control-button {
    padding: 0 10px;
  }

  .map-control-button--icon {
    width: 30px;
    min-height: 30px;
  }

  .map-zoom-pill {
    min-width: 52px;
    min-height: 30px;
    font-size: 0.72rem;
  }

  .map-hint {
    left: 10px;
    right: 10px;
    bottom: 10px;
    padding: 7px 9px;
  }

  .explorer-rail {
    top: auto;
    bottom: 14px;
    transform: none;
  }
}
</style>
