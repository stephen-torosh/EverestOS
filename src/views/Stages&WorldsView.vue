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
        <header class="map-toolbar">
          <div class="toolbar-copy">
            <BaseText tag="h1" size="lg" weight="bold">{{ systemStore.t('stagesView.title') }}</BaseText>
            <BaseText class="toolbar-subtitle" size="xs" color="secondary">{{ systemStore.t('stagesView.subtitle') }}</BaseText>
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
          <svg class="solar-map" viewBox="0 0 1600 900" :preserveAspectRatio="mapPreserveAspectRatio" aria-label="Stages and Worlds">
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

                  <text
                    v-if="isBodyLabelVisible(body)"
                    class="body-label"
                    text-anchor="middle"
                    :x="0"
                    :y="getBodyLabelOffset(body)"
                    :style="getBodyLabelStyle(body)"
                  >
                    {{ truncateLabel(body.label, 12) }}
                  </text>
              </g>

              <g v-if="showStageClusters" class="cluster-layer">
                <g
                  v-for="cluster in stageClusters"
                  :key="cluster.id"
                  class="stage-cluster"
                  :class="{ 'is-active': selectedStage?.id === cluster.id }"
                  :transform="`translate(${cluster.x} ${cluster.y})`"
                  @mouseenter="hoveredStageId = cluster.id"
                  @mouseleave="hoveredStageId = null"
                  @pointerdown.stop
                  @click.stop="selectStage(cluster.id)"
                >
                  <circle class="stage-cluster-hit" :r="getStageClusterHitRadius(cluster.id)" />
                  <circle class="stage-cluster-ring" :r="getStageClusterRingRadius(cluster.id)" />
                  <circle class="stage-cluster-core" :r="getStageClusterCoreRadius(cluster.id)" />
                  <text class="stage-cluster-index" text-anchor="middle" :y="getStageClusterIndexY(cluster.id)" :style="getStageClusterIndexStyle(cluster.id)">
                    {{ cluster.order }}
                  </text>
                  <text class="stage-cluster-count" text-anchor="middle" :y="getStageClusterCountY(cluster.id)" :style="getStageClusterCountStyle(cluster.id)">
                    {{ cluster.worlds.length }}
                  </text>
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
                  @mouseenter="hoveredWorldId = world.id"
                  @mouseleave="hoveredWorldId = null"
                  @pointerdown.stop
                  @click.stop="selectWorld(world.id)"
                >
                  <circle class="world-node-hit" :r="getWorldNodeHitRadius(world)" />
                  <circle class="world-node-ring" :r="getWorldNodeRingRadius(world)" />
                  <circle class="world-node-core" :r="getWorldNodeCoreRadius(world)" />
                  <text class="world-node-tag" text-anchor="middle" dominant-baseline="central" :style="pxStyle(getWorldNodeTextSize(world.id))">
                    {{ world.mapTag || buildMapTag(world.name) }}
                  </text>
                  <text
                    v-if="isWorldLabelVisible(world)"
                    class="world-node-label"
                    :x="getWorldLabelX(world)"
                    :y="getWorldLabelY(world)"
                    :text-anchor="world.labelAnchor"
                    :style="pxStyle(getWorldLabelSize(world.id))"
                  >
                    {{ truncateLabel(world.name, 18) }}
                  </text>
                </g>
              </g>
            </g>
          </svg>

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

          <template v-if="selectedEntity?.type === 'stage' && selectedStage">
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
                <div class="panel-list">
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const MAX_ZOOM = 1500
const CLUSTER_TO_WORLD_ZOOM = 145
const MOBILE_BREAKPOINT = 980
const CAMERA_EASE = 0.2

const mapViewportRef = ref(null)
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
const isPanelOpen = ref(false)
const suppressClickUntil = ref(0)
let cameraFrame = null
let resizeHandler = null

const solarCenter = { x: VIEWBOX_CENTER.x, y: VIEWBOX_CENTER.y }
const asteroidBeltRadius = 670
const mapScale = computed(() => mapZoom.value / 100)
const inverseSceneScale = computed(() => 1 / mapScale.value)
const motionEnabled = computed(() => true)
const mobileOverlayVisible = computed(() => isMobileView.value && (explorerOpen.value || isPanelOpen.value))
const mapPreserveAspectRatio = computed(() => (isMobileView.value ? 'xMidYMid slice' : 'xMidYMid meet'))
const sceneTransform = computed(() => {
  const scale = mapScale.value
  const translateX = VIEWBOX_CENTER.x - cameraX.value * scale
  const translateY = VIEWBOX_CENTER.y - cameraY.value * scale
  return `translate(${translateX} ${translateY}) scale(${scale})`
})

const zoomLabel = computed(() => `${Math.round(mapZoom.value)}%`)
const interactionHint = computed(() =>
  isMobileView.value
    ? `Drag to move • Use +/- to zoom • ${zoomLabel.value}`
    : `Drag to move • Scroll to zoom • Double click to focus • ${zoomLabel.value}`
)
const showStageClusters = computed(() => mapZoom.value < CLUSTER_TO_WORLD_ZOOM)
const showWorldMarkers = computed(() => mapZoom.value >= CLUSTER_TO_WORLD_ZOOM)
const showWorldLabels = computed(() => mapZoom.value >= 220)

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
      r: 40,
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

    const radius = nodes.length
      ? Math.max(...nodes.map((world) => Math.hypot(world.x - x, world.y - y))) + 170
      : 240

    return {
      ...chapter,
      x,
      y,
      radius,
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

function resolveAnchorType(world, bodyId) {
  if (bodyId === 'moon' && world.locationType === 'satellite') return 'surface'
  return world.locationType || 'surface'
}

function getWorldOrbitRadius(world, body, anchorType) {
  if (anchorType === 'satellite') return body.displayRadius + 24 + ((world.orbitalBand || 1) * 2.8)
  return body.displayRadius + 36 + ((world.orbitalBand || 1) * 3.4)
}

function getWorldNodePosition(world, body, anchorType, angle) {
  if (anchorType === 'surface') {
    return pointOnCircle(body.x, body.y, body.displayRadius - 1, angle)
  }

  return pointOnCircle(body.x, body.y, getWorldOrbitRadius(world, body, anchorType), angle)
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

function syncCameraTargets() {
  targetZoom.value = mapZoom.value
  targetCameraX.value = cameraX.value
  targetCameraY.value = cameraY.value
}

function stopCameraAnimation() {
  if (cameraFrame) {
    cancelAnimationFrame(cameraFrame)
    cameraFrame = null
  }
}

function tickCameraAnimation() {
  const zoomDelta = targetZoom.value - mapZoom.value
  const xDelta = targetCameraX.value - cameraX.value
  const yDelta = targetCameraY.value - cameraY.value
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
  if (!motionEnabled.value) {
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
  mapZoom.value = nextZoom
  cameraX.value = nextX
  cameraY.value = nextY
  syncCameraTargets()
}

function scenePx(value) {
  return value * inverseSceneScale.value
}

function pxStyle(sizePx) {
  return { fontSize: `${scenePx(sizePx)}px` }
}

function getBodyLabelOffset(body) {
  return body.displayRadius + scenePx(16)
}

function getBodyLabelStyle(body) {
  return pxStyle(body.id === 'sun' ? 10 : 9)
}

function isBodyLabelVisible(body) {
  if (mapZoom.value < 90) return body.id !== 'moon'
  if (!selectedWorldBodyId.value) return false
  if (body.id === selectedWorldBodyId.value) return true
  return selectedWorldBodyId.value === 'moon' && body.id === 'earth'
}

function getStageClusterScale(stageId) {
  if (selectedStage.value?.id === stageId) return 1.22
  if (hoveredStageId.value === stageId) return 1.35
  return 1
}

function getStageClusterRingRadius(stageId) {
  return scenePx(13 * getStageClusterScale(stageId))
}

function getStageClusterHitRadius(stageId) {
  return scenePx(20 * getStageClusterScale(stageId))
}

function getStageClusterCoreRadius(stageId) {
  return scenePx(8 * getStageClusterScale(stageId))
}

function getStageClusterIndexY(stageId) {
  return scenePx(-1 * getStageClusterScale(stageId))
}

function getStageClusterCountY(stageId) {
  return scenePx(6 * getStageClusterScale(stageId))
}

function getStageClusterIndexStyle(stageId) {
  return pxStyle(8 * getStageClusterScale(stageId))
}

function getStageClusterCountStyle(stageId) {
  return pxStyle(6 * getStageClusterScale(stageId))
}

function getWorldNodeScale(worldId) {
  if (selectedWorld.value?.id === worldId) return 1.2
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
  if (hoveredWorldId.value === world.id) return true
  if (selectedWorld.value) return selectedWorld.value.id === world.id
  if (!showWorldLabels.value || mapZoom.value < 260) return false
  if (selectedStage.value && selectedStage.value.id !== world.chapterId) return false

  const distance = Math.hypot(world.x - cameraX.value, world.y - cameraY.value)
  return distance <= (130 / mapScale.value)
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

function focusCamera(nextX, nextY, nextZoom = targetZoom.value, immediate = false) {
  targetZoom.value = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
  targetCameraX.value = nextX
  targetCameraY.value = nextY

  if (immediate) {
    applyCameraImmediately(targetCameraX.value, targetCameraY.value, targetZoom.value)
    return
  }

  animateCameraToTargets()
}

function resetCamera() {
  selectedEntity.value = null
  isPanelOpen.value = false
  focusCamera(solarCenter.x, solarCenter.y, DEFAULT_ZOOM)
}

function stepZoom(direction) {
  const factor = direction > 0 ? 1.22 : 0.82
  targetZoom.value = clamp(targetZoom.value * factor, MIN_ZOOM, MAX_ZOOM)
  animateCameraToTargets()
}

function toggleExplorer() {
  explorerOpen.value = !explorerOpen.value
}

function onWheel(event) {
  const viewPoint = clientToViewBox(event.clientX, event.clientY)
  const pointerWorld = viewToWorld(viewPoint)
  const zoomFactor = event.deltaY < 0 ? 1.16 : 0.84
  const nextZoom = clamp(targetZoom.value * zoomFactor, MIN_ZOOM, MAX_ZOOM)
  const nextScale = nextZoom / 100

  targetZoom.value = nextZoom
  targetCameraX.value = pointerWorld.x - (viewPoint.x - VIEWBOX_CENTER.x) / nextScale
  targetCameraY.value = pointerWorld.y - (viewPoint.y - VIEWBOX_CENTER.y) / nextScale
  animateCameraToTargets()
}

function onDoubleClick(event) {
  const viewPoint = clientToViewBox(event.clientX, event.clientY)
  const worldPoint = viewToWorld(viewPoint)
  focusCamera(worldPoint.x, worldPoint.y, Math.min(MAX_ZOOM, targetZoom.value + 80))
}

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest('button, .world-node, .stage-cluster, .explorer-rail'))
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return
  if (isInteractiveTarget(event.target)) return

  stopCameraAnimation()
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

  const nextCameraX = dragState.startCameraX - (deltaX / mapScale.value)
  const nextCameraY = dragState.startCameraY - (deltaY / mapScale.value)
  applyCameraImmediately(nextCameraX, nextCameraY, mapZoom.value)
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
  syncCameraTargets()
}

function selectStage(stageId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return

  const stage = stageClusters.value.find((cluster) => cluster.id === stageId)
  if (!stage) return

  selectedEntity.value = { type: 'stage', id: stageId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
  const targetZoom = clamp(82000 / Math.max(stage.radius, 180), 155, 340)
  focusCamera(stage.x, stage.y, targetZoom)
}

function selectWorld(worldId, options = {}) {
  if (!options.force && Date.now() < suppressClickUntil.value) return

  const worldNode = worldMapNodes.value.find((world) => world.id === worldId)
  if (!worldNode) return

  activateWorld(worldId)
  selectedEntity.value = { type: 'world', id: worldId }
  isPanelOpen.value = true
  if (isMobileView.value) explorerOpen.value = false
  const focusBody = bodyById.value[worldNode.bodyId] || worldNode
  const focusZoom = worldNode.anchorType === 'surface' ? 920 : 720
  focusCamera(focusBody.x, focusBody.y, Math.max(mapZoom.value, focusZoom))
}

function closePanel() {
  isPanelOpen.value = false
}

function closeMobilePanels() {
  explorerOpen.value = false
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

onMounted(() => {
  resizeHandler = () => {
    isMobileView.value = window.innerWidth <= MOBILE_BREAKPOINT
    if (!isMobileView.value) return
    explorerOpen.value = false
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  stopCameraAnimation()
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
  background: var(--bg-main);
}

.map-layout {
  height: 100%;
  padding: 10px;
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
  gap: 10px;
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
  border: 1px solid var(--border-color);
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 48%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, black 8%), var(--bg-main));
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
  transition: stroke 180ms ease;
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
  transition:
    fill 180ms ease,
    stroke 180ms ease;
}

.stage-cluster-index {
  fill: var(--text-primary);
  font-size: 8px;
  font-weight: 700;
  transition: fill 180ms ease;
}

.stage-cluster-count {
  fill: var(--text-secondary);
  font-size: 6px;
  letter-spacing: 0.12em;
  transition: fill 180ms ease;
}

.stage-cluster.is-active .stage-cluster-ring,
.stage-cluster.is-active .stage-cluster-core {
  stroke: var(--accent-color);
}

.world-node-ring {
  fill: none;
  stroke: color-mix(in srgb, var(--accent-color) 52%, transparent);
  stroke-width: 1;
  transition: stroke 160ms ease;
}

.world-node-core {
  fill: color-mix(in srgb, var(--bg-elevated) 90%, transparent);
  stroke: color-mix(in srgb, var(--text-primary) 42%, transparent);
  stroke-width: 0.9;
  transition:
    fill 160ms ease,
    stroke 160ms ease;
}

.world-node-tag {
  fill: var(--text-primary);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.04em;
  pointer-events: none;
  transition: fill 160ms ease;
}

.world-node-label {
  fill: var(--text-primary);
  font-size: 9px;
  font-weight: 600;
  pointer-events: none;
  transition: fill 160ms ease;
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
