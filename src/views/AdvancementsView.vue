<template>
  <div class="evolution-page" :class="{ 'is-modal-open': isGraphFullscreen }">
    <div class="page-inner">
      <header class="page-header">
        <div>
          <BaseText tag="h1" size="h1" weight="bold">{{ systemStore.t('evolutionView.title') }}</BaseText>
          <BaseText size="sm" color="secondary">{{ systemStore.t('evolutionView.subtitle') }}</BaseText>
        </div>

        <div class="header-actions">
          <BaseButton variant="outline" @click="router.push('/missions')">
            {{ systemStore.t('evolutionView.openMissions') }}
          </BaseButton>
          <BaseButton variant="primary" @click="router.push('/profile')">
            {{ systemStore.t('evolutionView.openProfile') }}
          </BaseButton>
        </div>
      </header>

      <div class="stats-grid">
        <BaseCard v-for="item in statCards" :key="item.label" class="stat-card">
          <BaseText size="xs" weight="bold" color="secondary" class="caps">{{ item.label }}</BaseText>
          <BaseText size="xl" weight="bold">{{ item.value }}</BaseText>
          <BaseText size="sm" color="secondary">{{ item.detail }}</BaseText>
        </BaseCard>
      </div>

      <div class="content-grid">
        <BaseCard class="graph-card">
          <div class="card-head graph-head">
            <div class="graph-head-copy">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('evolutionView.graphTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('evolutionView.graphSubtitle') }}</BaseText>
            </div>

            <BaseButton variant="outline" size="sm" @click="toggleGraphFullscreen">
              {{
                systemStore.t(
                  isGraphFullscreen ? 'evolutionView.exitFullscreen' : 'evolutionView.fullscreen'
                )
              }}
            </BaseButton>
          </div>

          <div class="graph-wrapper">
            <KnowledgeGraph :nodesData="knowledgeStore.nodes" />
          </div>
        </BaseCard>

        <aside class="intel-column">
          <BaseCard class="intel-card">
            <div class="card-head">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('evolutionView.guidanceTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('evolutionView.guidanceSubtitle') }}</BaseText>
            </div>

            <div class="guidance-list">
              <article v-for="node in availableNodes" :key="node.id" class="guidance-item">
                <BaseText size="md" weight="bold">{{ node.label }}</BaseText>
                <BaseText size="sm" color="secondary">+{{ node.xp }} XP</BaseText>
              </article>

              <BaseText v-if="!availableNodes.length" size="sm" color="secondary">
                {{ systemStore.t('evolutionView.noAvailable') }}
              </BaseText>
            </div>
          </BaseCard>

          <BaseCard class="intel-card">
            <div class="card-head">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('evolutionView.theoTitle') }}</BaseText>
              <BaseText size="xs" color="secondary">{{ systemStore.t('profile.theoCoreLabel') }}</BaseText>
            </div>

            <div class="theo-stack">
              <article v-for="note in userStore.theoNotes" :key="note" class="theo-note">
                <span class="theo-badge">T</span>
                <BaseText size="sm">{{ note }}</BaseText>
              </article>
            </div>
          </BaseCard>
        </aside>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isGraphFullscreen" class="graph-fullscreen-shell">
      <button
        class="graph-fullscreen-backdrop"
        :aria-label="systemStore.t('evolutionView.exitFullscreen')"
        @click="closeGraphFullscreen"
      ></button>

      <div class="graph-fullscreen-panel">
        <BaseCard class="graph-fullscreen-card">
          <div class="card-head graph-head">
            <div class="graph-head-copy">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('evolutionView.graphTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('evolutionView.graphSubtitle') }}</BaseText>
            </div>

            <BaseButton variant="outline" size="sm" @click="closeGraphFullscreen">
              {{ systemStore.t('evolutionView.exitFullscreen') }}
            </BaseButton>
          </div>

          <div class="graph-wrapper graph-wrapper-fullscreen">
            <KnowledgeGraph :nodesData="knowledgeStore.nodes" />
          </div>
        </BaseCard>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseText from '@/components/ui/BaseText.vue'
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useSystemStore } from '@/stores/systemStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const systemStore = useSystemStore()
const userStore = useUserStore()
const isGraphFullscreen = ref(false)

const availableNodes = computed(() => knowledgeStore.nodes.filter((node) => node.status === 'available').slice(0, 5))

const closeGraphFullscreen = () => {
  isGraphFullscreen.value = false
}

const toggleGraphFullscreen = () => {
  isGraphFullscreen.value = !isGraphFullscreen.value
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeGraphFullscreen()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const statCards = computed(() => [
  {
    label: systemStore.t('evolutionView.progress'),
    value: `${knowledgeStore.totalProgress}%`,
    detail: systemStore.t('evolutionView.progressDetail'),
  },
  {
    label: systemStore.t('evolutionView.mastered'),
    value: userStore.masteredNodes,
    detail: systemStore.t('evolutionView.masteredDetail'),
  },
  {
    label: systemStore.t('evolutionView.available'),
    value: userStore.availableNodes,
    detail: systemStore.t('evolutionView.availableDetail'),
  },
  {
    label: systemStore.t('evolutionView.locked'),
    value: userStore.lockedNodes,
    detail: systemStore.t('evolutionView.lockedDetail'),
  },
])
</script>

<style scoped>
.evolution-page {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-main);
}

.evolution-page.is-modal-open {
  overflow: hidden;
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
.header-actions,
.content-grid,
.theo-note {
  display: flex;
}

.page-header {
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  gap: 10px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.guidance-item,
.theo-note {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.stat-card {
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
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.8fr);
  gap: 18px;
}

.graph-card {
  display: flex;
  flex-direction: column;
  min-height: 720px;
}

.card-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.graph-head {
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.graph-head-copy {
  min-width: 0;
}

.graph-wrapper {
  flex: 1;
  min-height: 620px;
  overflow: hidden;
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 30%),
    var(--bg-sidebar);
}

.graph-fullscreen-shell {
  position: fixed;
  inset: 0;
  z-index: 500;
}

.graph-fullscreen-backdrop {
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background:
    radial-gradient(circle at 50% 110%, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 38%),
    rgba(3, 6, 12, 0.72);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.graph-fullscreen-panel {
  position: fixed;
  inset:
    max(12px, env(safe-area-inset-top, 0px) + 4px)
    clamp(12px, 2.4vw, 28px)
    clamp(12px, 2.4vw, 28px);
  z-index: 1;
}

.graph-fullscreen-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 18px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.34),
    0 0 0 1px color-mix(in srgb, var(--accent-color) 12%, transparent);
}

.graph-wrapper-fullscreen {
  min-height: 0;
  height: 100%;
}

:global(html[data-animations='true']) .graph-fullscreen-backdrop {
  animation: evo-backdrop-in 0.28s ease-out both;
}

:global(html[data-animations='true']) .graph-fullscreen-panel {
  animation: evo-panel-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

:global(html[data-animations='false']) .graph-fullscreen-backdrop,
:global(html[data-animations='false']) .graph-fullscreen-panel {
  animation: none !important;
  transition: none !important;
}

.intel-column,
.guidance-list,
.theo-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guidance-item,
.theo-note {
  padding: 12px;
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
  color: var(--accent-color);
  background: var(--accent-soft);
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 1080px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .graph-card {
    min-height: 620px;
  }
}

@media (max-width: 720px) {
  .page-inner {
    padding: 18px 12px 24px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .graph-head {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .graph-wrapper {
    min-height: 480px;
  }

  .graph-fullscreen-panel {
    inset:
      max(8px, env(safe-area-inset-top, 0px) + 4px)
      8px
      8px;
    padding: 14px;
  }
}

@keyframes evo-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes evo-panel-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
</style>
