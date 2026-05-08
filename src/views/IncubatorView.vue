<template>
  <div class="incubator-page">
    <div class="incubator-shell">
      <header class="incubator-header surface">
        <div class="header-copy">
          <BaseText tag="span" size="xs" weight="bold" color="accent" class="eyebrow">
            {{ systemStore.t('incubator.privateZone') }}
          </BaseText>
          <BaseText tag="h1" size="xl" weight="bold">{{ systemStore.t('incubator.title') }}</BaseText>
          <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.subtitle') }}</BaseText>
        </div>

        <div class="header-actions">
          <button
            class="mode-pill"
            :class="{ 'is-active': incubatorStore.activeSection === 'comms' }"
            type="button"
            @click="openCommsHub"
          >
            {{ systemStore.t('incubator.tabs.comms') }}
          </button>
          <button
            class="mode-pill"
            :class="{ 'is-active': incubatorStore.activeSection === 'bay' }"
            type="button"
            @click="openBayOverview"
          >
            {{ systemStore.t('incubator.tabs.bay') }}
          </button>
          <BaseButton size="sm" variant="outline" @click="exportPortfolio">
            {{ systemStore.t('incubator.exportPortfolio') }}
          </BaseButton>
        </div>
      </header>

      <section v-if="incubatorStore.activeSection === 'comms'" class="comms-layout">
        <aside class="thread-sidebar surface">
          <div class="sidebar-head">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('incubator.commsTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.commsSubtitle') }}</BaseText>
            </div>
          </div>

          <form class="thread-create" @submit.prevent="handleCreateThread">
            <input
              v-model="newThreadTitle"
              class="app-input"
              type="text"
              :placeholder="systemStore.t('incubator.newThreadPlaceholder')"
            />
            <BaseButton type="submit" variant="accent">
              {{ systemStore.t('incubator.newThreadAction') }}
            </BaseButton>
          </form>

          <div class="thread-list">
            <button
              v-for="thread in incubatorStore.sortedThreads"
              :key="thread.id"
              class="thread-card"
              :class="{ 'is-active': thread.id === incubatorStore.activeThreadId }"
              type="button"
              @click="incubatorStore.selectThread(thread.id)"
            >
              <div class="thread-card-top">
                <strong>{{ thread.title }}</strong>
                <span>{{ formatDateTime(thread.updatedAt) }}</span>
              </div>
              <p>{{ getThreadPreview(thread) }}</p>
              <div class="thread-card-bottom">
                <span>{{ thread.channel }}</span>
                <span v-if="thread.unread" class="thread-badge">{{ thread.unread }}</span>
              </div>
            </button>
          </div>
        </aside>

        <main class="chat-shell surface">
          <template v-if="activeThread">
            <div class="chat-topbar">
              <div class="chat-topbar-copy">
                <BaseText tag="h2" size="lg" weight="bold">{{ activeThread.title }}</BaseText>
                <BaseText size="sm" color="secondary">{{ activeThread.summary }}</BaseText>
              </div>

              <div class="chat-topbar-actions">
                <span class="chat-chip">{{ activeThread.channel }}</span>
                <BaseButton
                  v-if="linkedProject"
                  size="sm"
                  variant="primary"
                  @click="openLinkedProject"
                >
                  {{ linkedProject.title }}
                </BaseButton>
              </div>
            </div>

            <div ref="messageFeedRef" class="chat-feed">
              <div class="chat-feed-inner">
                <article
                  v-for="message in activeThread.messages"
                  :key="message.id"
                  class="message-bubble"
                  :class="`is-${message.author}`"
                >
                  <div class="message-head">
                    <strong>{{ message.author === 'danilo' ? 'Danilo' : 'Stepan' }}</strong>
                    <span>{{ formatDateTime(message.createdAt) }}</span>
                  </div>
                  <p>{{ message.text }}</p>
                </article>
              </div>
            </div>

            <form class="chat-composer" @submit.prevent="handleSendSignal">
              <textarea
                v-model="composerText"
                class="app-textarea composer-textarea"
                rows="4"
                :placeholder="systemStore.t('incubator.composerPlaceholder')"
              ></textarea>
              <div class="composer-actions">
                <BaseText size="xs" color="secondary">{{ systemStore.t('incubator.signalHint') }}</BaseText>
                <BaseButton type="submit" variant="accent">
                  {{ systemStore.t('incubator.sendSignal') }}
                </BaseButton>
              </div>
            </form>
          </template>
        </main>
      </section>

      <section v-else class="bay-layout">
        <template v-if="!bayWorkspaceProjectId">
          <div class="bay-overview">
            <div class="bay-intro surface">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('incubator.bayTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.bayGallerySubtitle') }}</BaseText>
            </div>

            <div class="project-gallery">
              <button
                v-for="project in incubatorStore.sortedProjects"
                :key="project.id"
                class="project-gallery-card surface"
                type="button"
                @click="openProjectWorkspace(project.id)"
              >
                <div class="project-gallery-top">
                  <div>
                    <BaseText tag="h3" size="lg" weight="bold">{{ project.title }}</BaseText>
                    <BaseText size="sm" color="secondary">{{ project.shipClass }}</BaseText>
                  </div>
                  <span class="chat-chip">{{ stageLabel(project.stage) }}</span>
                </div>

                <BaseText size="sm">{{ project.summary }}</BaseText>

                <div class="project-progress">
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${project.progress}%` }"></div>
                  </div>
                  <span>{{ project.progress }}%</span>
                </div>

                <div class="project-gallery-bottom">
                  <span>{{ formatDateTime(project.updatedAt) }}</span>
                  <span class="workspace-link">{{ systemStore.t('incubator.openWorkspace') }}</span>
                </div>
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="activeProject">
          <div class="workspace-shell surface">
            <div class="workspace-head">
              <div class="workspace-head-main">
                <button class="back-button" type="button" @click="closeProjectWorkspace">
                  {{ systemStore.t('incubator.backToBay') }}
                </button>
                <div>
                  <BaseText tag="h2" size="xl" weight="bold">{{ activeProject.title }}</BaseText>
                  <BaseText size="sm" color="secondary">{{ activeProject.shipClass }}</BaseText>
                </div>
              </div>

              <div class="workspace-head-actions">
                <BaseButton size="sm" variant="primary" @click="handleOpenProjectComms">
                  {{ systemStore.t('incubator.openComms') }}
                </BaseButton>
                <BaseButton size="sm" variant="outline" @click="exportPortfolio">
                  {{ systemStore.t('incubator.exportResume') }}
                </BaseButton>
              </div>
            </div>

            <div class="workspace-tabs">
              <button
                class="mode-pill"
                :class="{ 'is-active': projectWorkspaceTab === 'overview' }"
                type="button"
                @click="projectWorkspaceTab = 'overview'"
              >
                {{ systemStore.t('incubator.workspaceTabs.overview') }}
              </button>
              <button
                class="mode-pill"
                :class="{ 'is-active': projectWorkspaceTab === 'chat' }"
                type="button"
                @click="projectWorkspaceTab = 'chat'"
              >
                {{ systemStore.t('incubator.projectTabs.chat') }}
              </button>
              <button
                class="mode-pill"
                :class="{ 'is-active': projectWorkspaceTab === 'files' }"
                type="button"
                @click="projectWorkspaceTab = 'files'"
              >
                {{ systemStore.t('incubator.projectTabs.files') }}
              </button>
            </div>

            <section v-if="projectWorkspaceTab === 'overview'" class="workspace-panel workspace-overview">
              <div class="field-grid">
                <label class="field-group">
                  <span>{{ systemStore.t('incubator.projectName') }}</span>
                  <input
                    class="app-input"
                    type="text"
                    :value="activeProject.title"
                    @input="updateProjectField('title', $event.target.value)"
                  />
                </label>

                <label class="field-group">
                  <span>{{ systemStore.t('incubator.projectClass') }}</span>
                  <input
                    class="app-input"
                    type="text"
                    :value="activeProject.shipClass"
                    @input="updateProjectField('shipClass', $event.target.value)"
                  />
                </label>

                <label class="field-group field-group--full">
                  <span>{{ systemStore.t('incubator.projectSummary') }}</span>
                  <textarea
                    class="app-textarea"
                    rows="4"
                    :value="activeProject.summary"
                    @input="updateProjectField('summary', $event.target.value)"
                  ></textarea>
                </label>

                <label class="field-group field-group--full">
                  <span>{{ systemStore.t('incubator.projectDossier') }}</span>
                  <textarea
                    class="app-textarea"
                    rows="6"
                    :value="activeProject.dossier"
                    @input="updateProjectField('dossier', $event.target.value)"
                  ></textarea>
                </label>

                <label class="field-group field-group--full">
                  <div class="range-head">
                    <span>{{ systemStore.t('incubator.progressLabel') }}</span>
                    <strong>{{ activeProject.progress }}%</strong>
                  </div>
                  <input
                    class="progress-range"
                    type="range"
                    min="0"
                    max="100"
                    :value="activeProject.progress"
                    @input="updateProjectField('progress', Number($event.target.value))"
                  />
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${activeProject.progress}%` }"></div>
                  </div>
                </label>
              </div>
            </section>

            <section v-else-if="projectWorkspaceTab === 'chat'" class="workspace-panel workspace-chat">
              <template v-if="activeProjectThread">
                <div ref="projectMessageFeedRef" class="chat-feed">
                  <div class="chat-feed-inner">
                    <article
                      v-for="message in activeProjectThread.messages"
                      :key="message.id"
                      class="message-bubble"
                      :class="`is-${message.author}`"
                    >
                      <div class="message-head">
                        <strong>{{ message.author === 'danilo' ? 'Danilo' : 'Stepan' }}</strong>
                        <span>{{ formatDateTime(message.createdAt) }}</span>
                      </div>
                      <p>{{ message.text }}</p>
                    </article>
                  </div>
                </div>

                <form class="chat-composer workspace-composer" @submit.prevent="handleSendProjectSignal">
                  <textarea
                    v-model="projectComposerText"
                    class="app-textarea composer-textarea"
                    rows="4"
                    :placeholder="systemStore.t('incubator.projectComposerPlaceholder')"
                  ></textarea>
                  <div class="composer-actions">
                    <BaseText size="xs" color="secondary">{{ systemStore.t('incubator.signalHint') }}</BaseText>
                    <BaseButton type="submit" variant="accent">
                      {{ systemStore.t('incubator.sendSignal') }}
                    </BaseButton>
                  </div>
                </form>
              </template>

              <div v-else class="empty-state">
                <BaseText size="md" weight="bold">{{ systemStore.t('incubator.noProjectThread') }}</BaseText>
                <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.createProjectThread') }}</BaseText>
                <BaseButton variant="accent" @click="handleEnsureProjectThread">
                  {{ systemStore.t('incubator.openComms') }}
                </BaseButton>
              </div>
            </section>

            <section v-else class="workspace-panel workspace-files">
              <div class="files-head">
                <div>
                  <BaseText tag="h3" size="lg" weight="bold">{{ systemStore.t('incubator.projectTabs.files') }}</BaseText>
                  <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.projectFilesSubtitle') }}</BaseText>
                </div>
                <BaseButton size="sm" variant="accent" @click="handleAddFile">
                  {{ systemStore.t('incubator.addFile') }}
                </BaseButton>
              </div>

              <div v-if="activeProject.files.length" class="file-list">
                <article v-for="file in activeProject.files" :key="file.id" class="file-card">
                  <div class="file-grid">
                    <label class="field-group">
                      <span>{{ systemStore.t('incubator.fileName') }}</span>
                      <input
                        class="app-input"
                        type="text"
                        :value="file.name"
                        @input="updateProjectFile(file.id, 'name', $event.target.value)"
                      />
                    </label>

                    <label class="field-group">
                      <span>{{ systemStore.t('incubator.fileType') }}</span>
                      <select
                        class="app-input app-select"
                        :value="file.kind"
                        @change="updateProjectFile(file.id, 'kind', $event.target.value)"
                      >
                        <option v-for="option in fileTypeOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </label>

                    <label class="field-group">
                      <span>{{ systemStore.t('incubator.fileStatus') }}</span>
                      <select
                        class="app-input app-select"
                        :value="file.status"
                        @change="updateProjectFile(file.id, 'status', $event.target.value)"
                      >
                        <option v-for="option in fileStatusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </label>

                    <label class="field-group field-group--full">
                      <span>{{ systemStore.t('incubator.fileNotes') }}</span>
                      <textarea
                        class="app-textarea"
                        rows="4"
                        :value="file.notes"
                        @input="updateProjectFile(file.id, 'notes', $event.target.value)"
                      ></textarea>
                    </label>
                  </div>
                </article>
              </div>

              <div v-else class="empty-state">
                <BaseText size="md" weight="bold">{{ systemStore.t('incubator.projectFilesEmpty') }}</BaseText>
              </div>
            </section>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseText from '@/components/ui/BaseText.vue'
import { useIncubatorStore } from '@/stores/incubatorStore'
import { useSystemStore } from '@/stores/systemStore'

const incubatorStore = useIncubatorStore()
const systemStore = useSystemStore()

const composerText = ref('')
const projectComposerText = ref('')
const newThreadTitle = ref('')
const projectWorkspaceTab = ref('overview')
const bayWorkspaceProjectId = ref(null)
const messageFeedRef = ref(null)
const projectMessageFeedRef = ref(null)

const activeThread = computed(() => incubatorStore.activeThread)
const activeProject = computed(() => {
  if (!bayWorkspaceProjectId.value) return null
  return incubatorStore.projects.find((project) => project.id === bayWorkspaceProjectId.value) || incubatorStore.activeProject
})
const linkedProject = computed(() => {
  if (!activeThread.value?.linkedProjectId) return null
  return incubatorStore.projects.find((project) => project.id === activeThread.value.linkedProjectId) || null
})
const activeProjectThread = computed(() => {
  if (!activeProject.value?.linkedThreadId) return null
  return incubatorStore.threads.find((thread) => thread.id === activeProject.value.linkedThreadId) || null
})

const fileTypeOptions = computed(() => [
  { value: 'brief', label: systemStore.t('incubator.fileKinds.brief') },
  { value: 'spec', label: systemStore.t('incubator.fileKinds.spec') },
  { value: 'asset', label: systemStore.t('incubator.fileKinds.asset') },
  { value: 'note', label: systemStore.t('incubator.fileKinds.note') },
])

const fileStatusOptions = computed(() => [
  { value: 'draft', label: systemStore.t('incubator.fileStates.draft') },
  { value: 'linked', label: systemStore.t('incubator.fileStates.linked') },
  { value: 'archive', label: systemStore.t('incubator.fileStates.archive') },
])

function localeForDate() {
  if (systemStore.currentLanguage === 'ua') return 'uk-UA'
  if (systemStore.currentLanguage === 'pl') return 'pl-PL'
  if (systemStore.currentLanguage === 'de') return 'de-DE'
  return 'en-US'
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(localeForDate(), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getThreadPreview(thread) {
  const lastMessage = thread.messages[thread.messages.length - 1]
  return lastMessage?.text || thread.summary
}

function stageLabel(stage) {
  return systemStore.t(`incubator.projectStages.${stage}`)
}

function scrollFeed(feedRef) {
  const feed = feedRef.value
  if (!feed) return
  feed.scrollTop = feed.scrollHeight
}

function openCommsHub() {
  incubatorStore.setActiveSection('comms')
}

function openBayOverview() {
  incubatorStore.setActiveSection('bay')
  bayWorkspaceProjectId.value = null
  projectWorkspaceTab.value = 'overview'
}

function openProjectWorkspace(projectId, tab = 'overview') {
  incubatorStore.selectProject(projectId)
  incubatorStore.setActiveSection('bay')
  bayWorkspaceProjectId.value = projectId
  projectWorkspaceTab.value = tab
}

function closeProjectWorkspace() {
  bayWorkspaceProjectId.value = null
  projectWorkspaceTab.value = 'overview'
}

function updateProjectField(field, value) {
  if (!activeProject.value) return
  incubatorStore.updateProject(activeProject.value.id, { [field]: value })
}

function updateProjectFile(fileId, field, value) {
  if (!activeProject.value) return
  incubatorStore.updateProjectFile(activeProject.value.id, fileId, { [field]: value })
}

async function handleCreateThread() {
  const threadId = incubatorStore.createThread(newThreadTitle.value)
  if (!threadId) return
  newThreadTitle.value = ''
  await nextTick()
  scrollFeed(messageFeedRef)
}

async function handleSendSignal() {
  const sent = incubatorStore.sendMessage(composerText.value)
  if (!sent) return
  composerText.value = ''
  await nextTick()
  scrollFeed(messageFeedRef)
}

async function handleSendProjectSignal() {
  if (!activeProject.value) return

  const threadId = incubatorStore.ensureProjectThread(activeProject.value.id)
  if (!threadId) return

  const sent = incubatorStore.sendMessage(projectComposerText.value, threadId)
  if (!sent) return

  projectComposerText.value = ''
  await nextTick()
  scrollFeed(projectMessageFeedRef)
}

function handleEnsureProjectThread() {
  if (!activeProject.value) return
  incubatorStore.ensureProjectThread(activeProject.value.id)
}

function handleOpenProjectComms() {
  if (!activeProject.value) return
  incubatorStore.openProjectThread(activeProject.value.id)
}

function handleAddFile() {
  if (!activeProject.value) return
  incubatorStore.addProjectFile(activeProject.value.id)
}

function openLinkedProject() {
  if (!linkedProject.value) return
  openProjectWorkspace(linkedProject.value.id, 'chat')
}

function exportPortfolio() {
  const lines = [
    'EVEREST OS // INCUBATOR EXPORT',
    '',
    `${systemStore.t('incubator.title')}`,
    `${systemStore.t('incubator.subtitle')}`,
    '',
    'PROJECT BAY',
    ...incubatorStore.sortedProjects.flatMap((project) => [
      '',
      `${project.title} // ${project.shipClass}`,
      `Stage: ${stageLabel(project.stage)}`,
      `Progress: ${project.progress}%`,
      `Summary: ${project.summary}`,
      `Dossier: ${project.dossier}`,
      'Files:',
      ...project.files.map((file) => `- ${file.name} (${file.kind}, ${file.status})`),
    ]),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'everest-incubator-portfolio.txt'
  anchor.click()
  URL.revokeObjectURL(url)
}

watch(
  () => [incubatorStore.activeThreadId, activeThread.value?.messages.length],
  async () => {
    await nextTick()
    scrollFeed(messageFeedRef)
  },
  { immediate: true }
)

watch(
  () => [bayWorkspaceProjectId.value, activeProjectThread.value?.messages.length, projectWorkspaceTab.value],
  async () => {
    await nextTick()
    scrollFeed(projectMessageFeedRef)
  },
  { immediate: true }
)
</script>

<style scoped>
.incubator-page {
  height: 100%;
  overflow: hidden;
  background: var(--bg-main);
}

.incubator-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.surface {
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: var(--bg-elevated);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.incubator-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.header-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.eyebrow {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-actions,
.chat-topbar-actions,
.composer-actions,
.workspace-head-actions,
.workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-pill,
.chat-chip,
.back-button {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  color: var(--text-primary);
  font: inherit;
}

.mode-pill,
.back-button {
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.mode-pill.is-active,
.back-button:hover {
  border-color: color-mix(in srgb, var(--accent-color) 55%, var(--border-color));
  background: color-mix(in srgb, var(--accent-color) 14%, var(--bg-elevated));
  color: var(--accent-color);
}

.comms-layout {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 12px;
}

.thread-sidebar,
.chat-shell,
.workspace-shell {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.thread-sidebar {
  padding: 14px;
  gap: 12px;
}

.sidebar-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.thread-create {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thread-list,
.chat-feed,
.file-list {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-gutter: stable;
}

.thread-card {
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: 100%;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
    color-mix(in srgb, var(--bg-elevated) 94%, var(--accent-color) 6%);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.1);
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.thread-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent-color) 55%, var(--border-color));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 14px 26px rgba(0, 0, 0, 0.14);
}

.thread-card.is-active {
  border-color: var(--accent-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
    color-mix(in srgb, var(--accent-color) 16%, var(--bg-elevated));
}

.thread-card-top,
.thread-card-bottom,
.message-head,
.project-gallery-top,
.project-gallery-bottom,
.project-progress,
.range-head,
.files-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.thread-card p,
.message-bubble p,
.project-gallery-card p {
  margin: 0;
  line-height: 1.55;
}

.thread-card-top > strong {
  display: block;
  font-size: 0.98rem;
}

.thread-card p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.thread-card-top span,
.thread-card-bottom span,
.project-gallery-bottom span,
.message-head span {
  color: var(--text-secondary);
}

.thread-badge {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 56%, transparent);
  color: var(--accent-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
}

.chat-shell {
  padding: 16px;
  gap: 12px;
}

.chat-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chat-topbar-copy {
  min-width: 0;
}

.chat-feed {
  flex: 1;
}

.chat-feed-inner {
  width: min(960px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 12px;
}

.message-bubble {
  max-width: 78%;
  padding: 14px 16px;
  border-radius: 22px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.message-bubble.is-stepan {
  align-self: flex-end;
  background: color-mix(in srgb, var(--accent-color) 16%, var(--bg-elevated));
}

.message-bubble.is-danilo {
  align-self: flex-start;
}

.chat-composer {
  width: min(960px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
}

.composer-textarea {
  min-height: 124px;
}

.bay-layout {
  min-height: 0;
  flex: 1;
}

.bay-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bay-intro {
  padding: 18px 20px;
}

.project-gallery {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding-right: 2px;
}

.project-gallery-card {
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  text-align: left;
  cursor: pointer;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
    color-mix(in srgb, var(--bg-elevated) 94%, var(--accent-color) 6%);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.project-gallery-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent-color) 55%, var(--border-color));
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.15);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
    color-mix(in srgb, var(--bg-elevated) 88%, var(--accent-color) 12%);
}

.project-gallery-top {
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-gallery-top > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-progress {
  margin-top: 14px;
}

.workspace-link {
  color: var(--accent-color) !important;
  font-weight: 700;
}

.workspace-shell {
  height: 100%;
  padding: 16px;
  gap: 14px;
}

.workspace-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.workspace-head-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workspace-panel {
  min-height: 0;
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg-main) 96%, var(--accent-color) 4%);
  padding: 16px;
}

.workspace-overview {
  overflow-y: auto;
}

.field-grid,
.file-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group--full {
  grid-column: 1 / -1;
}

.field-group span {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-chat,
.workspace-files {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workspace-composer {
  width: 100%;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.file-card {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.008)),
    var(--bg-elevated);
  padding: 14px;
}

.progress-range {
  accent-color: var(--accent-color);
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-main) 90%, black 10%);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 30%, white));
}

.app-input,
.app-textarea,
.app-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font: inherit;
  box-sizing: border-box;
}

.app-textarea {
  resize: vertical;
}

@media (max-width: 900px) {
  .comms-layout {
    grid-template-columns: 1fr;
  }

  .project-gallery {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .incubator-shell {
    padding: 8px;
  }

  .incubator-header,
  .workspace-head,
  .chat-topbar {
    flex-direction: column;
  }

  .field-grid,
  .file-grid {
    grid-template-columns: 1fr;
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>
