<template>
  <div class="incubator-page">
    <div
      class="incubator-shell"
      :class="{
        'is-workspace-open': Boolean(bayWorkspaceProjectId),
        'is-comms-mobile': isMobileViewport && incubatorStore.activeSection === 'comms',
      }"
    >
      <header class="incubator-header surface">
        <div class="header-copy">
          <BaseText tag="span" size="xs" weight="bold" color="accent" class="eyebrow">
            {{ systemStore.t('incubator.privateZone') }}
          </BaseText>
          <BaseText tag="h1" size="md" weight="bold">{{ systemStore.t('incubator.title') }}</BaseText>
        </div>

        <div class="header-actions">
          <BaseSelectGroup v-model="activeSectionModel" :options="sectionTabOptions" />
          <BaseButton size="sm" variant="outline" @click="exportPortfolio">
            {{ systemStore.t('incubator.exportPortfolio') }}
          </BaseButton>
        </div>
      </header>

      <section
        v-if="incubatorStore.activeSection === 'comms'"
        class="comms-layout"
        :class="{ 'is-mobile': isMobileViewport, 'is-threads-open': mobileCommsSidebarOpen }"
      >
        <aside class="chat-sidebar surface" :class="{ 'is-mobile-drawer': isMobileViewport, 'is-open': mobileCommsSidebarOpen }">
          <div class="sidebar-top">
            <div class="sidebar-top-row">
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('incubator.commsTitle') }}</BaseText>
              <BaseButton
                v-if="isMobileViewport"
                size="icon"
                variant="outline"
                class="create-icon-btn"
                title="Закрити список чатів"
                aria-label="Закрити список чатів"
                @click="closeMobileCommsThreads"
              >
                ✕
              </BaseButton>
            </div>
            <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.commsSubtitle') }}</BaseText>
          </div>

          <form class="tree-create" @submit.prevent="handleCreateThread">
            <input
              v-model="newThreadTitle"
              class="app-input"
              type="text"
              :placeholder="systemStore.t('incubator.newThreadPlaceholder')"
            />
            <BaseButton type="button" size="sm" variant="outline" @click="handleCreateFolder">
              {{ systemStore.t('incubator.addFolder') }}
            </BaseButton>
            <BaseButton type="submit" variant="accent">
              {{ systemStore.t('incubator.newThreadAction') }}
            </BaseButton>
          </form>

          <div class="thread-list">
            <template v-if="groupedThreads.length">
              <section v-for="group in groupedThreads" :key="group.folder" class="thread-group">
                <button
                  class="tree-folder-row"
                  :class="{ 'is-selected': selectedTreeFolder === group.folder }"
                  type="button"
                  @click="toggleFolder(group.folder)"
                >
                  <span class="tree-caret">{{ isFolderCollapsed(group.folder) ? '▸' : '▾' }}</span>
                  <strong>{{ group.label }}</strong>
                </button>
                <div v-if="!isFolderCollapsed(group.folder)" class="tree-children">
                  <button
                    v-for="thread in group.threads"
                    :key="thread.id"
                    class="thread-item"
                    :class="{ 'is-active': thread.id === incubatorStore.activeThreadId }"
                    type="button"
                    @click="selectThreadFromList(thread.id)"
                  >
                    <span class="tree-file-dot">•</span>
                    <strong class="thread-title">{{ thread.title }}</strong>
                    <span v-if="thread.unread" class="thread-badge">{{ thread.unread }}</span>
                  </button>
                </div>
              </section>
            </template>
            <div v-else class="thread-empty">{{ systemStore.t('incubator.memoryFallback') }}</div>
          </div>
        </aside>

        <main class="chat-main surface">
          <template v-if="activeThread">
            <div class="chat-main-head" :class="{ 'is-mobile': isMobileViewport }">
              <div class="chat-main-title-row">
                <BaseButton
                  v-if="isMobileViewport"
                  size="icon"
                  variant="outline"
                  class="create-icon-btn"
                  title="Відкрити список чатів"
                  aria-label="Відкрити список чатів"
                  @click="openMobileCommsThreads"
                >
                  ☰
                </BaseButton>
                <BaseText tag="h2" size="lg" weight="bold" class="chat-main-title">{{ activeThread.title }}</BaseText>
              </div>
              <div class="chat-head-actions">
                <span v-if="!isMobileViewport" class="thread-folder-chip">{{ folderLabel(activeThread.folder || DEFAULT_THREAD_FOLDER) }}</span>
                <BaseButton v-if="linkedProject" size="sm" variant="primary" @click="openLinkedProject">
                  {{ linkedProject.title }}
                </BaseButton>
              </div>
            </div>

            <div ref="messageFeedRef" class="chat-feed">
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

            <form class="composer" @submit.prevent="handleSendSignal">
              <div class="composer-input-row">
                <textarea
                  v-model="composerText"
                  class="app-textarea composer-textarea"
                  rows="3"
                  :disabled="isGenerating"
                  :placeholder="systemStore.t('incubator.composerPlaceholder')"
                ></textarea>
                <BaseButton type="submit" variant="accent" class="send-button" :disabled="isGenerating">
                  {{ isGenerating ? systemStore.t('incubator.localAiGenerating') : systemStore.t('incubator.sendSignal') }}
                </BaseButton>
              </div>
              <BaseText size="xs" color="secondary">{{ systemStore.t('incubator.signalHint') }}</BaseText>
              <BaseText size="xs" :color="incubatorStore.aiStatus === 'error' ? 'accent' : 'secondary'">
                {{ aiStatusLabel }}
              </BaseText>
            </form>
          </template>

          <div v-else class="empty-state">
            <BaseText size="md" weight="bold">{{ systemStore.t('incubator.memoryFallback') }}</BaseText>
          </div>
        </main>

        <div
          v-if="isMobileViewport && mobileCommsSidebarOpen"
          class="mobile-drawer-backdrop"
          @click="closeMobileCommsThreads"
        ></div>
      </section>

      <section v-else class="bay-layout">
        <template v-if="!bayWorkspaceProjectId">
          <div class="workspace-list-head">
            <div>
              <BaseText tag="h2" size="lg" weight="bold">{{ systemStore.t('incubator.bayTitle') }}</BaseText>
              <BaseText size="sm" color="secondary">{{ systemStore.t('incubator.bayGallerySubtitle') }}</BaseText>
            </div>
            <div class="workspace-list-actions">
              <input
                v-model="workspaceSearch"
                class="app-input workspace-search"
                type="text"
                :placeholder="systemStore.t('incubator.projectName')"
              />
              <BaseButton
                size="icon"
                variant="accent"
                class="create-icon-btn"
                title="Створити новий workspace"
                aria-label="Створити новий workspace"
                @click="openCreateWorkspaceCardModal"
              >
                ＋
              </BaseButton>
            </div>
          </div>

          <div class="bay-filter-row">
            <button
              v-for="profile in bayProfileFilters"
              :key="profile.id"
              class="workspace-stat workspace-filter-chip"
              :class="{ 'is-active': activeBayProfileFilter === profile.id }"
              type="button"
              @click="activeBayProfileFilter = profile.id"
            >
              <span>{{ profile.icon }}</span>
              <span>{{ profile.title }}</span>
              <span>{{ profile.count }}</span>
            </button>
          </div>

          <div class="workspace-grid">
            <button
              v-for="project in filteredProjects"
              :key="project.id"
              class="workspace-card surface"
              type="button"
              @click="openProjectWorkspace(project.id)"
            >
              <div class="workspace-card-meta">
                <span class="workspace-pill">{{ projectStageLabel(project) }}</span>
                <span class="workspace-updated">{{ formatDateTime(project.updatedAt) }}</span>
              </div>
              <div class="workspace-card-head">
                <span class="workspace-icon">{{ project.icon || '🧠' }}</span>
                <BaseText tag="h3" size="lg" weight="bold">{{ project.title }}</BaseText>
              </div>
              <BaseText size="md" color="secondary" class="workspace-summary">{{ project.summary }}</BaseText>
              <div class="workspace-card-foot">
                <span class="workspace-stat">⚡ {{ project.progress }}%</span>
                <span class="workspace-stat">🗂 {{ project.files.length }}</span>
                <span class="workspace-stat">{{ workspaceProfileLabel(project) }}</span>
              </div>
            </button>
          </div>

          <div v-if="isCreateWorkspaceCardModalOpen" class="create-object-overlay" @click.self="closeCreateWorkspaceCardModal">
            <div class="create-object-modal workspace-glass surface">
              <div class="workspace-column-head">
                <BaseText tag="h3" size="lg" weight="bold">Create workspace card</BaseText>
                <button class="modal-close" type="button" @click="closeCreateWorkspaceCardModal">✕</button>
              </div>

              <label class="field-group">
                <span>Workspace name</span>
                <input v-model="newWorkspaceCardTitle" class="app-input" type="text" placeholder="Mars Simulation Lab" />
              </label>

              <div class="workspace-kind-list">
                <button
                  v-for="profile in workspaceCardProfiles"
                  :key="profile.id"
                  class="workspace-kind-card"
                  :class="{ 'is-active': newWorkspaceCardProfile === profile.id }"
                  type="button"
                  @click="newWorkspaceCardProfile = profile.id"
                >
                  <span class="workspace-kind-icon">{{ profile.icon }}</span>
                  <div class="workspace-kind-copy">
                    <strong>{{ profile.title }}</strong>
                    <span>{{ profile.subtitle }}</span>
                  </div>
                </button>
              </div>

              <div class="workspace-modal-actions">
                <BaseButton size="sm" variant="outline" @click="closeCreateWorkspaceCardModal">Cancel</BaseButton>
                <BaseButton size="sm" variant="accent" @click="handleCreateWorkspaceCard">
                  Create
                </BaseButton>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeProject">
          <div class="workspace-shell surface">
            <div class="workspace-head" :class="{ 'is-mobile-compact': isMobileViewport }">
              <div class="workspace-head-main">
                <button class="back-button" type="button" @click="closeProjectWorkspace">
                  {{ systemStore.t('incubator.backToBay') }}
                </button>
                <BaseText tag="h2" size="lg" weight="bold" class="workspace-title">{{ activeProject.icon || '🧠' }} {{ activeProject.title }}</BaseText>
              </div>
              <div class="workspace-head-actions">
                <BaseButton
                  size="icon"
                  variant="outline"
                  class="create-icon-btn mobile-only"
                  title="Файли"
                  aria-label="Відкрити панель файлів"
                  @click="openMobileExplorer"
                >
                  ☰
                </BaseButton>
                <BaseButton
                  size="icon"
                  variant="outline"
                  class="create-icon-btn mobile-only"
                  title="Danilo"
                  aria-label="Відкрити чат Danilo"
                  @click="openMobileChat"
                >
                  ✦
                </BaseButton>
                <BaseButton
                  size="sm"
                  class="desktop-only"
                  :variant="activeWorkbenchPanel === 'editor' ? 'accent' : 'outline'"
                  @click="activeWorkbenchPanel = 'editor'"
                >
                  Editor
                </BaseButton>
                <BaseButton
                  size="sm"
                  class="desktop-only"
                  :variant="activeWorkbenchPanel === 'chat' ? 'accent' : 'outline'"
                  @click="activeWorkbenchPanel = 'chat'"
                >
                  Danilo
                </BaseButton>
                <BaseButton v-if="!isMobileViewport" size="sm" variant="outline" @click="exportPortfolio">
                  {{ systemStore.t('incubator.exportResume') }}
                </BaseButton>
              </div>
            </div>

            <div class="workspace-studio">
              <aside
                class="workspace-column workspace-explorer workspace-glass"
                :class="{ 'is-mobile-drawer': true, 'is-open': mobileExplorerOpen }"
              >
                <div class="workspace-column-head">
                  <BaseText tag="h3" size="md" weight="bold">{{ systemStore.t('incubator.workspace.explorerLabel') }}</BaseText>
                  <div class="workspace-head-actions">
                    <BaseButton size="sm" variant="outline" @click="openWorkspaceManagerModal">
                      Налаштувати
                    </BaseButton>
                    <BaseButton
                      size="icon"
                      variant="accent"
                      class="create-icon-btn"
                      title="Створити файл"
                      aria-label="Створити файл"
                      @click="openCreateObjectModal"
                    >
                      ＋
                    </BaseButton>
                  </div>
                </div>

                <div v-if="hasMultipleProjectWorkspaces" class="workspace-deck-tabs">
                  <button
                    v-for="deck in projectWorkspaceDecks"
                    :key="deck.id"
                    class="workspace-deck-tab"
                    :class="{ 'is-active': activeWorkspaceDeck === deck.id }"
                    type="button"
                    @click="activeWorkspaceDeck = deck.id"
                  >
                    <span>{{ deck.icon }}</span>
                    <strong>{{ deck.title }}</strong>
                  </button>
                </div>

                <div class="workspace-tree">
                  <button class="workspace-folder-row" type="button" @click="workspaceTreeCollapsed = !workspaceTreeCollapsed">
                    <span class="tree-caret">{{ workspaceTreeCollapsed ? '▸' : '▾' }}</span>
                    <strong>{{ activeProject.title }} · {{ activeWorkspaceDeckMeta?.title }}</strong>
                  </button>

                  <div v-if="!workspaceTreeCollapsed" class="workspace-file-tree">
                    <button
                      v-for="entry in visibleWorkspaceEntries"
                      :key="entry.id"
                      class="workspace-file-row"
                      :class="{ 'is-active': selectedWorkspaceFileId === entry.id }"
                      type="button"
                      @click="selectWorkspaceFile(entry.id)"
                    >
                      <span
                        class="workspace-file-kind-icon"
                        :class="`is-${workspaceFileKind(entry).kind}`"
                      >{{ workspaceFileKind(entry).icon }}</span>
                      <span class="workspace-file-copy">
                        <span class="workspace-file-label">{{ entry.name }}</span>
                        <span class="workspace-file-deck">{{ workspaceDeckLabel(entry) }}</span>
                      </span>
                    </button>
                    <div v-if="!visibleWorkspaceFiles.length" class="workspace-files-empty">
                      {{ systemStore.t('incubator.workspace.emptyEditor') }}
                    </div>
                  </div>
                </div>
              </aside>

              <main v-show="activeWorkbenchPanel === 'editor'" class="workspace-column workspace-editor workspace-glass">
                <div class="workspace-column-head">
                  <BaseText tag="h3" size="md" weight="bold">{{ systemStore.t('incubator.workspace.editorLabel') }}</BaseText>
                  <span v-if="activeWorkspaceFile || isWorkspaceDashboardSelected" class="workspace-chip">
                    {{ activeWorkspaceFile ? workspaceFileKind(activeWorkspaceFile).extension : '.dashboard' }}
                  </span>
                </div>

                <div v-if="activeWorkspaceFile || isWorkspaceDashboardSelected" class="workspace-editor-body">
                  <template v-if="isWorkspaceDashboardSelected">
                    <BaseText tag="h4" size="lg" weight="bold">dashboard</BaseText>
                    <BaseText size="sm" color="secondary">
                      Головний стан воркспейсу, прогрес і ключові метрики.
                    </BaseText>
                  </template>
                  <template v-else>
                  <BaseText tag="h4" size="lg" weight="bold">{{ activeWorkspaceFile.name }}</BaseText>
                  <BaseText size="sm" color="secondary">
                    {{ workspaceFileKind(activeWorkspaceFile).title }} — {{ workspaceFileKind(activeWorkspaceFile).subtitle }}
                  </BaseText>
                  </template>

                  <EvWorkspaceDashboard
                    v-if="isWorkspaceDashboardSelected"
                    :workspace-id="activeWorkspaceDeckMeta?.id || 'research'"
                    :file-count="visibleWorkspaceFiles.length"
                    :runtime-data="dashboardRuntimeData"
                    @create-task="handleDashboardCreateTask"
                    @create-mind-node="handleDashboardCreateMindNode"
                    @open-main-file="openDashboardMainFile"
                  />

                  <EvInteractionWindow
                    v-if="activeWorkspaceInteractionApp && !isWorkspaceDashboardSelected"
                    :kind="activeWorkspaceFile.kind"
                    :runtime-data="activeWorkspaceInteractionApp.runtimeData"
                    @patch="handleInteractionPatch"
                    @action="handleInteractionAction"
                  />

                  <div
                    v-if="!isWorkspaceDashboardSelected && workspaceFileKind(activeWorkspaceFile).kind === 'motion' && activeMotionApp"
                    class="motion-preview-panel"
                  >
                    <div class="motion-preview-head">
                      <div>
                        <BaseText size="sm" weight="bold">Motion live preview</BaseText>
                        <BaseText size="xs" color="secondary">
                          {{ activeMotionApp.runtimeData.explanation || activeMotionApp.runtimeData.prompt }}
                        </BaseText>
                      </div>
                      <span class="workspace-chip">{{ Math.round(activeMotionApp.runtimeData.progress) }}%</span>
                    </div>

                    <div ref="motionPreviewRef" class="motion-preview-stage">
                      <div class="motion-grid"></div>
                      <div ref="motionPulseRef" class="motion-pulse"></div>
                      <div class="motion-axis motion-axis-x"></div>
                      <div class="motion-axis motion-axis-y"></div>
                      <div class="motion-orbit-track"></div>
                      <div ref="motionOrbRef" class="motion-orb"></div>
                      <div class="motion-core"></div>
                    </div>

                    <div class="motion-timeline">
                      <div
                        v-for="step in activeMotionApp.runtimeData.timeline"
                        :key="step.id"
                        class="motion-step"
                        :class="{ 'is-active': step.id === activeMotionApp.runtimeData.activeStepId }"
                      >
                        <strong>{{ step.title }}</strong>
                        <span>{{ step.description }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <BaseText size="md" weight="bold">{{ systemStore.t('incubator.workspace.emptyEditor') }}</BaseText>
                </div>
              </main>

              <section
                v-show="activeWorkbenchPanel === 'chat' || mobileChatOpen"
                class="workspace-column workspace-chat workspace-glass"
                :class="{ 'is-mobile-drawer': true, 'is-open': mobileChatOpen }"
              >
                <div class="workspace-column-head">
                  <BaseText tag="h3" size="md" weight="bold">{{ systemStore.t('incubator.daniloPresence') }}</BaseText>
                  <span v-if="activeWorkspaceFile" class="workspace-chip">{{ activeWorkspaceFile.name }}</span>
                </div>

                <div v-if="workspaceThread" class="workspace-chat-body">
                  <BaseText size="xs" color="secondary" class="workspace-chat-context">
                    {{ workspaceFileKind(activeWorkspaceFile).title }} · {{ systemStore.t('incubator.signalHint') }}
                  </BaseText>

                  <div v-if="workspacePreviewFamily(activeWorkspaceFile) === 'chat'" class="chat-preview-hero">
                    <div class="chat-preview-icon">◉</div>
                    <div>
                      <BaseText size="sm" weight="bold">Chat preview</BaseText>
                      <BaseText size="xs" color="secondary">
                        {{ chatPreviewSummary }}
                      </BaseText>
                    </div>
                  </div>

                  <div ref="workspaceMessageFeedRef" class="chat-feed workspace-chat-feed">
                    <article
                      v-for="message in workspaceThread.messages"
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

                  <form class="composer workspace-composer" @submit.prevent="handleSendWorkspaceSignal">
                    <div class="composer-input-row">
                      <textarea
                        v-model="workspaceComposerText"
                        class="app-textarea composer-textarea"
                        rows="3"
                        :disabled="isGenerating"
                        :placeholder="systemStore.t('incubator.projectComposerPlaceholder')"
                      ></textarea>
                      <BaseButton type="submit" variant="accent" class="send-button" :disabled="isGenerating">
                        {{ isGenerating ? systemStore.t('incubator.localAiGenerating') : systemStore.t('incubator.sendSignal') }}
                      </BaseButton>
                    </div>
                    <BaseText size="xs" :color="incubatorStore.aiStatus === 'error' ? 'accent' : 'secondary'">
                      {{ aiStatusLabel }}
                    </BaseText>
                  </form>
                </div>

                <div v-else class="empty-state">
                  <BaseText size="md" weight="bold">{{ systemStore.t('incubator.createProjectThread') }}</BaseText>
                </div>
              </section>

              <div
                v-if="isMobileViewport && (mobileExplorerOpen || mobileChatOpen)"
                class="mobile-drawer-backdrop"
                @click="closeMobileDrawers"
              ></div>
            </div>
          </div>

          <div v-if="isCreateObjectModalOpen" class="create-object-overlay" @click.self="closeCreateObjectModal">
            <div class="create-object-modal workspace-glass surface">
              <div class="workspace-column-head">
                <BaseText tag="h3" size="lg" weight="bold">{{ systemStore.t('incubator.workspace.createObjectTitle') }}</BaseText>
                <button class="modal-close" type="button" @click="closeCreateObjectModal">✕</button>
              </div>

              <label class="field-group">
                <span>{{ systemStore.t('incubator.workspace.objectNameLabel') }}</span>
                <input
                  v-model="newWorkspaceObjectName"
                  class="app-input workspace-input-mono"
                  type="text"
                  :placeholder="systemStore.t('incubator.workspace.objectNamePlaceholder')"
                />
              </label>

              <div v-if="hasMultipleProjectWorkspaces" class="workspace-deck-list">
                <button
                  v-for="deck in projectWorkspaceDecks"
                  :key="deck.id"
                  class="workspace-deck-card"
                  :class="{ 'is-active': selectedWorkspaceDeck === deck.id }"
                  type="button"
                  @click="selectedWorkspaceDeck = deck.id"
                >
                  <span class="workspace-kind-icon">{{ deck.icon }}</span>
                  <div class="workspace-kind-copy">
                    <strong>{{ deck.title }}</strong>
                    <span>{{ deck.subtitle }}</span>
                  </div>
                  </button>
              </div>

              <BaseText v-else size="xs" color="secondary">
                Активний воркспейс: {{ activeWorkspaceDeckMeta?.icon }} {{ activeWorkspaceDeckMeta?.title }}
              </BaseText>

              <div class="workspace-kind-category-list">
                <section v-for="group in selectedDeckKindsByCategory" :key="group.category" class="workspace-kind-category-group">
                  <BaseText size="xs" color="secondary" class="workspace-kind-category-title">{{ group.category }}</BaseText>
                  <div class="workspace-kind-list">
                    <button
                      v-for="kind in group.kinds"
                      :key="kind.kind"
                      class="workspace-kind-card"
                      :class="{ 'is-active': selectedWorkspaceKind === kind.kind }"
                      type="button"
                      @click="selectedWorkspaceKind = kind.kind"
                    >
                      <span class="workspace-kind-icon" :class="`is-${kind.kind}`">{{ kind.icon }}</span>
                      <div class="workspace-kind-copy">
                        <strong>{{ kind.extension }} · {{ kind.title }}</strong>
                        <span>{{ kind.subtitle }}</span>
                      </div>
                    </button>
                  </div>
                </section>
              </div>

              <div class="workspace-modal-actions">
                <BaseButton size="sm" variant="outline" @click="closeCreateObjectModal">
                  {{ systemStore.t('incubator.workspace.cancel') }}
                </BaseButton>
                <BaseButton size="sm" variant="accent" @click="handleCreateWorkspaceObject">
                  {{ systemStore.t('incubator.workspace.createConfirm') }}
                </BaseButton>
              </div>
            </div>
          </div>

          <div v-if="isWorkspaceManagerModalOpen" class="create-object-overlay" @click.self="closeWorkspaceManagerModal">
            <div class="create-object-modal workspace-glass surface">
              <div class="workspace-column-head">
                <BaseText tag="h3" size="lg" weight="bold">Workspace manager</BaseText>
                <button class="modal-close" type="button" @click="closeWorkspaceManagerModal">✕</button>
              </div>

              <div class="workspace-manager-list">
                <button
                  v-for="deck in projectWorkspaceDecks"
                  :key="deck.id"
                  class="workspace-kind-card"
                  :class="{ 'is-active': editingWorkspaceId === deck.id }"
                  type="button"
                  @click="beginWorkspaceEdit(deck)"
                >
                  <span class="workspace-kind-icon">{{ deck.icon }}</span>
                  <div class="workspace-kind-copy">
                    <strong>{{ deck.title }}</strong>
                    <span>{{ deck.subtitle }}</span>
                  </div>
                </button>
              </div>

              <label class="field-group">
                <span>Workspace name</span>
                <input v-model="workspaceFormTitle" class="app-input" type="text" placeholder="Mission Lab" />
              </label>

              <div class="workspace-manager-meta">
                <label class="field-group">
                  <span>Icon</span>
                  <input v-model="workspaceFormIcon" class="app-input" type="text" placeholder="◈" />
                </label>
                <label class="field-group">
                  <span>Subtitle</span>
                  <input v-model="workspaceFormSubtitle" class="app-input" type="text" placeholder="Describe this workspace" />
                </label>
              </div>

              <label class="field-group">
                <span>Preview mode</span>
                <div class="workspace-family-list">
                  <button
                    v-for="family in workspaceFamilies"
                    :key="family.id"
                    class="workspace-family-chip"
                    :class="{ 'is-active': workspaceFormFamily === family.id }"
                    type="button"
                    @click="workspaceFormFamily = family.id"
                  >
                    {{ family.label }}
                  </button>
                </div>
              </label>

              <label class="field-group">
                <span>Allowed file types</span>
                <div class="workspace-kind-category-list">
                  <section v-for="group in workspaceKindsByCategory" :key="group.category" class="workspace-kind-category-group">
                    <BaseText size="xs" color="secondary" class="workspace-kind-category-title">{{ group.category }}</BaseText>
                    <div class="workspace-kind-list">
                      <button
                        v-for="kind in group.kinds"
                        :key="kind.kind"
                        class="workspace-kind-card"
                        :class="{ 'is-active': workspaceFormKinds.includes(kind.kind) }"
                        type="button"
                        @click="toggleWorkspaceFormKind(kind.kind)"
                      >
                        <span class="workspace-kind-icon" :class="`is-${kind.kind}`">{{ kind.icon }}</span>
                        <div class="workspace-kind-copy">
                          <strong>{{ kind.extension }} · {{ kind.title }}</strong>
                          <span>{{ kind.subtitle }}</span>
                        </div>
                      </button>
                    </div>
                  </section>
                </div>
              </label>

              <div class="workspace-modal-actions">
                <BaseButton size="sm" variant="outline" @click="startWorkspaceCreate">New workspace</BaseButton>
                <BaseButton size="sm" variant="accent" @click="saveWorkspaceConfig">
                  {{ editingWorkspaceId ? 'Save workspace' : 'Create workspace' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelectGroup from '@/components/ui/BaseSelectGroup.vue'
import BaseText from '@/components/ui/BaseText.vue'
import EvInteractionWindow from '@/components/interactions/EvInteractionWindow.vue'
import EvWorkspaceDashboard from '@/components/interactions/EvWorkspaceDashboard.vue'
import { useIncubatorStore } from '@/stores/incubatorStore'
import { useSystemStore } from '@/stores/systemStore'
import { interaction, parseWorkspaceNotesToRuntime, serializeWorkspaceRuntimeToNotes } from '@/utils/interactionEngine'

const DEFAULT_THREAD_FOLDER = 'general'
const WORKSPACE_DASHBOARD_FILE_ID = '__workspace-dashboard__'

const incubatorStore = useIncubatorStore()
const systemStore = useSystemStore()

const composerText = ref('')
const newThreadTitle = ref('')
const workspaceSearch = ref('')
const selectedTreeFolder = ref(DEFAULT_THREAD_FOLDER)
const customFolders = ref([])
const collapsedFolders = ref({})
const bayWorkspaceProjectId = ref(null)
const messageFeedRef = ref(null)
const selectedWorkspaceFileId = ref(null)
const activeWorkspaceDeck = ref('motion')
const activeWorkbenchPanel = ref('editor')
const activeBayProfileFilter = ref('all')
const isMobileViewport = ref(false)
const mobileCommsSidebarOpen = ref(false)
const mobileExplorerOpen = ref(false)
const mobileChatOpen = ref(false)
const workspaceTreeCollapsed = ref(false)
const isCreateObjectModalOpen = ref(false)
const isWorkspaceManagerModalOpen = ref(false)
const isCreateWorkspaceCardModalOpen = ref(false)
const selectedWorkspaceDeck = ref('motion')
const selectedWorkspaceKind = ref('motion')
const newWorkspaceObjectName = ref('')
const newWorkspaceCardTitle = ref('')
const newWorkspaceCardProfile = ref('research')
const editingWorkspaceId = ref(null)
const workspaceFormTitle = ref('')
const workspaceFormIcon = ref('◈')
const workspaceFormSubtitle = ref('')
const workspaceFormFamily = ref('canvas')
const workspaceFormKinds = ref([])
const motionPreviewRef = ref(null)
const motionOrbRef = ref(null)
const motionPulseRef = ref(null)
const workspaceComposerText = ref('')
const workspaceMessageFeedRef = ref(null)
let mobileMediaQuery = null
let motionPreviewTimeline = null

const activeThread = computed(() => incubatorStore.activeThread)
const activeProject = computed(() => {
  if (!bayWorkspaceProjectId.value) return null
  return incubatorStore.projects.find((project) => project.id === bayWorkspaceProjectId.value) || incubatorStore.activeProject
})
const linkedProject = computed(() => {
  if (!activeThread.value?.linkedProjectId) return null
  return incubatorStore.projects.find((project) => project.id === activeThread.value.linkedProjectId) || null
})
const workspaceThread = computed(() => {
  if (!activeProject.value?.linkedThreadId) return null
  return incubatorStore.threads.find((thread) => thread.id === activeProject.value.linkedThreadId) || null
})
const isGenerating = computed(() => incubatorStore.aiStatus === 'generating')
const aiStatusLabel = computed(() => {
  if (incubatorStore.aiStatus === 'error' && incubatorStore.aiError) {
    return `${systemStore.t('incubator.localAiErrorPrefix')}: ${incubatorStore.aiError}`
  }

  if (incubatorStore.aiStatus === 'generating') {
    return `${systemStore.t('incubator.localAiGenerating')} · ${incubatorStore.localLlmRuntime}`
  }

  return `${systemStore.t('incubator.localAiReady')} · ${incubatorStore.localLlmRuntime}`
})

const folderOptions = computed(() => {
  const fromThreads = incubatorStore.threads.map((thread) => normalizeFolder(thread.folder))
  const fromCustom = customFolders.value.map((folder) => normalizeFolder(folder))
  const set = new Set([DEFAULT_THREAD_FOLDER, ...fromThreads, ...fromCustom].filter(Boolean))
  return [...set]
})

const groupedThreads = computed(() => {
  const groups = folderOptions.value.map((folder) => ({
    folder,
    label: folderLabel(folder),
    threads: incubatorStore.sortedThreads.filter((thread) => normalizeFolder(thread.folder) === folder),
  }))
  return groups.filter((group) => group.threads.length || customFolders.value.includes(group.folder))
})

const filteredProjects = computed(() => {
  const query = workspaceSearch.value.trim().toLowerCase()
  return incubatorStore.sortedProjects.filter((project) => {
    const profileMatch = activeBayProfileFilter.value === 'all'
      || (project.workspaceProfile || 'research') === activeBayProfileFilter.value
    if (!profileMatch) return false
    if (!query) return true
    return project.title.toLowerCase().includes(query) || project.summary.toLowerCase().includes(query)
  })
})

const fallbackWorkspaceDecks = [
  { id: 'motion', icon: '✦', title: 'Motion', subtitle: 'Animations and explainers', family: 'motion', allowedKinds: ['motion', 'timeline', 'storyboard', 'shotlist', 'audio', 'chat'] },
  { id: 'sim', icon: '◈', title: 'Simulation', subtitle: '3D scenes and mission logic', family: 'canvas', allowedKinds: ['scene', 'sim', 'entity', 'mission', 'map', 'flow', 'canvas', 'chat'] },
  { id: 'code', icon: '</>', title: 'Code', subtitle: 'Scripts, schemas, and systems', family: 'canvas', allowedKinds: ['js', 'ts', 'logic', 'schema', 'api', 'config', 'test', 'chat'] },
  { id: 'research', icon: '▣', title: 'Research', subtitle: 'Notes, chats, and references', family: 'log', allowedKinds: ['chat', 'note', 'notebook', 'journal', 'log', 'documentation', 'brief', 'reference', 'research'] },
  { id: 'forge', icon: '⬢', title: 'Forge', subtitle: 'Production blueprints and plans', family: 'forge', allowedKinds: ['forge', 'plan', 'todo', 'mindmap', 'roadmap', 'decision', 'spec', 'system', 'chat'] },
]
const projectWorkspaceDecks = computed(() => {
  if (activeProject.value?.workspaces?.length) return activeProject.value.workspaces
  return fallbackWorkspaceDecks
})
const hasMultipleProjectWorkspaces = computed(() => projectWorkspaceDecks.value.length > 1)
const activeWorkspaceDeckMeta = computed(() =>
  projectWorkspaceDecks.value.find((deck) => deck.id === activeWorkspaceDeck.value) || projectWorkspaceDecks.value[0] || null
)
const workspaceFamilies = [
  { id: 'motion', label: 'Motion' },
  { id: 'canvas', label: 'Simulation/Code' },
  { id: 'log', label: 'Research/Log' },
  { id: 'forge', label: 'Forge' },
  { id: 'chat', label: 'Chat' },
]
const workspaceCardProfiles = computed(() => [
  { id: 'motion', icon: '✦', title: 'Motion workspace', subtitle: 'Animation and motion explainers.' },
  { id: 'sim', icon: '◈', title: 'Simulation workspace', subtitle: '3D scenes and mission mechanics.' },
  { id: 'code', icon: '</>', title: 'Code workspace', subtitle: 'Logic, schema, and runtime scripts.' },
  { id: 'research', icon: '▣', title: 'Research workspace', subtitle: 'Chat, notes, and knowledge base.' },
  { id: 'forge', icon: '⬢', title: 'Forge workspace', subtitle: 'Blueprints, plans, and production specs.' },
])
const bayProfileFilters = computed(() => {
  const allCount = incubatorStore.sortedProjects.length
  return [
    { id: 'all', icon: '◉', title: 'All', count: allCount },
    ...workspaceCardProfiles.value.map((profile) => ({
      id: profile.id,
      icon: profile.icon,
      title: profile.title.replace(' workspace', ''),
      count: incubatorStore.sortedProjects.filter((project) => (project.workspaceProfile || 'research') === profile.id).length,
    })),
  ]
})
const workspaceFileKinds = computed(() => [
  { kind: 'chat', extension: '.chat', icon: '◉', family: 'chat', category: 'Communication', title: 'Chat lane', subtitle: 'Universal conversation lane for this workspace.' },

  { kind: 'motion', extension: '.motion', icon: '✦', family: 'motion', category: 'Motion', title: 'Motion scene', subtitle: 'Main animation sequence.' },
  { kind: 'timeline', extension: '.timeline', icon: '⟢', family: 'motion', category: 'Motion', title: 'Timeline', subtitle: 'Step-by-step animation beats.' },
  { kind: 'storyboard', extension: '.storyboard', icon: '☰', family: 'motion', category: 'Motion', title: 'Storyboard', subtitle: 'Visual script of shots and transitions.' },
  { kind: 'shotlist', extension: '.shotlist', icon: '◫', family: 'motion', category: 'Motion', title: 'Shot list', subtitle: 'Ordered cinematic shots and camera intent.' },
  { kind: 'audio', extension: '.audio', icon: '♫', family: 'motion', category: 'Motion', title: 'Audio plan', subtitle: 'Voice, music and effects timing plan.' },

  { kind: 'scene', extension: '.scene', icon: '◎', family: 'canvas', category: 'Simulation', title: '3D scene', subtitle: 'World setup with scene notes.' },
  { kind: 'sim', extension: '.sim', icon: '⬡', family: 'canvas', category: 'Simulation', title: 'Simulation config', subtitle: 'Physics and simulation parameters.' },
  { kind: 'entity', extension: '.entity', icon: '◇', family: 'canvas', category: 'Simulation', title: 'Entity profile', subtitle: 'Actors, bodies, and interactions.' },
  { kind: 'mission', extension: '.mission', icon: '⚑', family: 'canvas', category: 'Simulation', title: 'Mission script', subtitle: 'Objectives, win-state, and flow.' },
  { kind: 'map', extension: '.map', icon: '⌖', family: 'canvas', category: 'Simulation', title: 'Map layout', subtitle: 'Spatial layout and zone topology.' },
  { kind: 'flow', extension: '.flow', icon: '⤳', family: 'canvas', category: 'Simulation', title: 'Flow map', subtitle: 'State and interaction flow diagram.' },
  { kind: 'canvas', extension: '.canvas', icon: '▦', family: 'canvas', category: 'Simulation', title: 'Canvas board', subtitle: 'General node canvas and whiteboard.' },

  { kind: 'js', extension: '.js', icon: 'λ', family: 'canvas', category: 'Code', title: 'JavaScript module', subtitle: 'Runtime logic or tooling script.' },
  { kind: 'ts', extension: '.ts', icon: 'τ', family: 'canvas', category: 'Code', title: 'TypeScript module', subtitle: 'Typed systems and utilities.' },
  { kind: 'logic', extension: '.logic', icon: '⊕', family: 'canvas', category: 'Code', title: 'Logic graph', subtitle: 'Rule map for game logic.' },
  { kind: 'schema', extension: '.schema', icon: '⌗', family: 'canvas', category: 'Code', title: 'Data schema', subtitle: 'Structured format for mission data.' },
  { kind: 'api', extension: '.api', icon: '⇄', family: 'canvas', category: 'Code', title: 'API contract', subtitle: 'Endpoints, payloads and integration contract.' },
  { kind: 'config', extension: '.config', icon: '⚙', family: 'canvas', category: 'Code', title: 'Config profile', subtitle: 'Environment and runtime configuration.' },
  { kind: 'test', extension: '.test', icon: '✓', family: 'canvas', category: 'Code', title: 'Test plan', subtitle: 'Verification cases and checks.' },

  { kind: 'note', extension: '.note', icon: '✎', family: 'log', category: 'Knowledge', title: 'Note', subtitle: 'Fast capture for ideas and findings.' },
  { kind: 'notebook', extension: '.notebook', icon: '☰', family: 'log', category: 'Knowledge', title: 'Notebook', subtitle: 'Long-form structured notes.' },
  { kind: 'journal', extension: '.journal', icon: '▤', family: 'log', category: 'Knowledge', title: 'Journal', subtitle: 'Chronological working journal.' },
  { kind: 'log', extension: '.log', icon: '▣', family: 'log', category: 'Knowledge', title: 'Activity log', subtitle: 'Event and experiment history.' },
  { kind: 'documentation', extension: '.documentation', icon: '📘', family: 'log', category: 'Knowledge', title: 'Documentation', subtitle: 'Project docs and onboarding notes.' },
  { kind: 'brief', extension: '.brief', icon: '☷', family: 'log', category: 'Knowledge', title: 'Brief', subtitle: 'Condensed context for a task.' },
  { kind: 'reference', extension: '.reference', icon: '🔖', family: 'log', category: 'Knowledge', title: 'Reference', subtitle: 'Links, sources, and citations.' },
  { kind: 'research', extension: '.research', icon: '⌕', family: 'log', category: 'Knowledge', title: 'Research doc', subtitle: 'Collected references and insights.' },

  { kind: 'forge', extension: '.forge', icon: '⬢', family: 'forge', category: 'Planning', title: 'Blueprint', subtitle: 'Core production blueprint.' },
  { kind: 'plan', extension: '.plan', icon: '⋯', family: 'forge', category: 'Planning', title: 'Execution plan', subtitle: 'Milestones and production blocks.' },
  { kind: 'todo', extension: '.todo', icon: '☑', family: 'forge', category: 'Planning', title: 'Todo list', subtitle: 'Actionable tasks and execution queue.' },
  { kind: 'mindmap', extension: '.mindmap', icon: '✺', family: 'forge', category: 'Planning', title: 'Mindmap', subtitle: 'Idea clusters and conceptual branches.' },
  { kind: 'roadmap', extension: '.roadmap', icon: '🛤', family: 'forge', category: 'Planning', title: 'Roadmap', subtitle: 'Phase timeline and delivery horizon.' },
  { kind: 'decision', extension: '.decision', icon: '◆', family: 'forge', category: 'Planning', title: 'Decision log', subtitle: 'Architecture and product decisions.' },
  { kind: 'spec', extension: '.spec', icon: '☍', family: 'forge', category: 'Planning', title: 'Spec sheet', subtitle: 'Technical constraints and targets.' },
  { kind: 'system', extension: '.system', icon: '⚙', family: 'forge', category: 'Planning', title: 'System design', subtitle: 'Architecture and integration map.' },
])
const workspaceKindsById = computed(() =>
  Object.fromEntries(workspaceFileKinds.value.map((kind) => [kind.kind, kind]))
)
const projectWorkspaceById = computed(() =>
  Object.fromEntries(projectWorkspaceDecks.value.map((workspace) => [workspace.id, workspace]))
)
const selectedDeckKinds = computed(() =>
  (projectWorkspaceById.value[selectedWorkspaceDeck.value]?.allowedKinds || [])
    .map((kindId) => workspaceKindsById.value[kindId])
    .filter(Boolean)
)
const workspaceKindsByCategory = computed(() => {
  const buckets = {}
  workspaceFileKinds.value.forEach((kind) => {
    const category = kind.category || 'General'
    if (!buckets[category]) buckets[category] = []
    buckets[category].push(kind)
  })
  return Object.entries(buckets).map(([category, kinds]) => ({ category, kinds }))
})
const selectedDeckKindsByCategory = computed(() => {
  const buckets = {}
  selectedDeckKinds.value.forEach((kind) => {
    const category = kind.category || 'General'
    if (!buckets[category]) buckets[category] = []
    buckets[category].push(kind)
  })
  return Object.entries(buckets).map(([category, kinds]) => ({ category, kinds }))
})
const visibleWorkspaceFiles = computed(() => {
  if (!activeProject.value) return []
  return activeProject.value.files.filter((file) => {
    const fileDeck = String(file.workspace || projectWorkspaceDecks.value[0]?.id || 'research')
    return fileDeck === activeWorkspaceDeck.value
  })
})
const visibleWorkspaceEntries = computed(() => {
  const dashboardEntry = {
    id: WORKSPACE_DASHBOARD_FILE_ID,
    name: 'dashboard',
    kind: 'dashboard',
    workspace: activeWorkspaceDeck.value,
    status: 'system',
    notes: '',
  }
  return [dashboardEntry, ...visibleWorkspaceFiles.value]
})
const isWorkspaceDashboardSelected = computed(() => selectedWorkspaceFileId.value === WORKSPACE_DASHBOARD_FILE_ID)

const activeWorkspaceFile = computed(() => {
  if (isWorkspaceDashboardSelected.value) return null
  if (!activeProject.value) return null
  return activeProject.value.files.find((file) => file.id === selectedWorkspaceFileId.value) || visibleWorkspaceFiles.value[0] || null
})
const activeMotionApp = computed(() => {
  if (!activeWorkspaceFile.value || workspacePreviewFamily(activeWorkspaceFile.value) !== 'motion') return null
  const app = interaction.getApp(activeWorkspaceFile.value.id)
  return app?.kind === 'motion' ? app : null
})
const activeWorkspaceInteractionApp = computed(() => {
  if (!activeWorkspaceFile.value) return null
  return interaction.getApp(activeWorkspaceFile.value.id)
})
const primaryWorkspaceFile = computed(() => visibleWorkspaceFiles.value[0] || null)
const primaryWorkspaceInteractionApp = computed(() => {
  if (!primaryWorkspaceFile.value) return null
  return interaction.getApp(primaryWorkspaceFile.value.id)
})
const dashboardRuntimeData = computed(() =>
  activeWorkspaceInteractionApp.value?.runtimeData
  || primaryWorkspaceInteractionApp.value?.runtimeData
  || {}
)
const chatPreviewSummary = computed(() =>
  activeWorkspaceInteractionApp.value?.runtimeData?.summary
  || activeWorkspaceInteractionApp.value?.runtimeData?.notes
  || activeWorkspaceInteractionApp.value?.runtimeData?.blueprint
  || workspaceNotesPreview(activeWorkspaceFile.value)
  || 'Direct conversation lane for Danilo, fast ideation, and mission planning.'
)

const sectionTabOptions = computed(() => [
  { value: 'comms', label: 'incubator.tabs.comms' },
  { value: 'bay', label: 'incubator.tabs.bay' },
])

const activeSectionModel = computed({
  get() {
    return incubatorStore.activeSection
  },
  set(value) {
    if (value === 'bay') {
      openBayOverview()
      return
    }
    openCommsHub()
  },
})

function normalizeFolder(value) {
  return (value || DEFAULT_THREAD_FOLDER).trim().toLowerCase()
}

function folderLabel(folder) {
  if (folder === DEFAULT_THREAD_FOLDER) return systemStore.t('incubator.defaultFolder')
  return folder
}

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

function projectStageLabel(project) {
  const stage = String(project?.stage || 'idea')
  return systemStore.t(`incubator.projectStages.${stage}`)
}

function workspaceProfileLabel(project) {
  const profileId = project?.workspaceProfile || project?.workspaces?.[0]?.id || 'research'
  return workspaceCardProfiles.value.find((item) => item.id === profileId)?.title || 'Workspace'
}

function scrollFeed(feedRef) {
  const feed = feedRef.value
  if (!feed) return
  feed.scrollTop = feed.scrollHeight
}

function openCommsHub() {
  incubatorStore.setActiveSection('comms')
  closeMobileCommsThreads()
}

function openBayOverview() {
  incubatorStore.setActiveSection('bay')
  bayWorkspaceProjectId.value = null
  closeMobileCommsThreads()
}

function openCreateWorkspaceCardModal() {
  newWorkspaceCardTitle.value = ''
  newWorkspaceCardProfile.value = 'research'
  isCreateWorkspaceCardModalOpen.value = true
}

function closeCreateWorkspaceCardModal() {
  isCreateWorkspaceCardModalOpen.value = false
}

function syncMobileViewport() {
  if (typeof window === 'undefined') return
  const nextIsMobile = mobileMediaQuery ? mobileMediaQuery.matches : window.innerWidth <= 980
  isMobileViewport.value = nextIsMobile
  if (!nextIsMobile) {
    mobileCommsSidebarOpen.value = false
    mobileExplorerOpen.value = false
    mobileChatOpen.value = false
  }
}

function closeMobileCommsThreads() {
  mobileCommsSidebarOpen.value = false
}

function openMobileCommsThreads() {
  if (!isMobileViewport.value) return
  mobileCommsSidebarOpen.value = true
}

function closeMobileDrawers() {
  mobileExplorerOpen.value = false
  mobileChatOpen.value = false
}

function selectThreadFromList(threadId) {
  incubatorStore.selectThread(threadId)
  if (isMobileViewport.value) {
    closeMobileCommsThreads()
  }
}

function openMobileExplorer() {
  mobileChatOpen.value = false
  mobileExplorerOpen.value = true
}

function openMobileChat() {
  mobileExplorerOpen.value = false
  mobileChatOpen.value = true
}

function handleCreateWorkspaceCard() {
  const title = newWorkspaceCardTitle.value.trim() || `Workspace ${incubatorStore.projects.length + 1}`
  const createdProjectId = incubatorStore.createProject(title, {
    workspaceProfile: newWorkspaceCardProfile.value,
  })
  if (!createdProjectId) return
  closeCreateWorkspaceCardModal()
  openProjectWorkspace(createdProjectId)
}

function openProjectWorkspace(projectId) {
  incubatorStore.selectProject(projectId)
  incubatorStore.setActiveSection('bay')
  bayWorkspaceProjectId.value = projectId
  activeWorkbenchPanel.value = 'editor'
  closeMobileDrawers()
  workspaceTreeCollapsed.value = false
  const project = incubatorStore.projects.find((item) => item.id === projectId)
  if (project?.workspaces?.length) {
    activeWorkspaceDeck.value = project.workspaces[0].id
  }
  if (project?.files?.length) {
    activeWorkspaceDeck.value = String(project.files[0].workspace || project.workspaces?.[0]?.id || activeWorkspaceDeck.value)
    selectedWorkspaceFileId.value = WORKSPACE_DASHBOARD_FILE_ID
  }
}

function closeProjectWorkspace() {
  bayWorkspaceProjectId.value = null
  activeWorkspaceDeck.value = 'motion'
  activeWorkbenchPanel.value = 'editor'
  closeMobileDrawers()
  workspaceComposerText.value = ''
}

function workspaceFileKind(file) {
  if (file?.id === WORKSPACE_DASHBOARD_FILE_ID || String(file?.kind || '').toLowerCase() === 'dashboard') {
    return {
      kind: 'dashboard',
      extension: '.dashboard',
      icon: '◍',
      title: 'Workspace dashboard',
      subtitle: 'Main workspace overview and stats.',
    }
  }
  const normalizedKind = String(file?.kind || '').replace('.', '').toLowerCase()
  return workspaceKindsById.value[normalizedKind] || workspaceFileKinds.value[0]
}

function workspaceDeckLabel(file) {
  if (file?.id === WORKSPACE_DASHBOARD_FILE_ID) return 'Overview'
  const deckId = String(file?.workspace || projectWorkspaceDecks.value[0]?.id || 'research')
  return projectWorkspaceDecks.value.find((deck) => deck.id === deckId)?.title || 'Research'
}

function workspacePreviewFamily(file) {
  const workspace = projectWorkspaceById.value[file?.workspace]
  if (workspace?.family) return workspace.family
  return workspaceFileKind(file).family
}

function workspaceNotesPreview(file) {
  const notes = String(file?.notes || '').trim()
  if (!notes || notes.startsWith('{') || notes.startsWith('[')) return ''
  return notes
}

function selectWorkspaceFile(fileId) {
  if (fileId === WORKSPACE_DASHBOARD_FILE_ID) {
    selectedWorkspaceFileId.value = WORKSPACE_DASHBOARD_FILE_ID
    activeWorkbenchPanel.value = 'editor'
    if (isMobileViewport.value) {
      closeMobileDrawers()
    }
    return
  }

  const selectedFile = activeProject.value?.files.find((file) => file.id === fileId)
  if (selectedFile) {
    activeWorkspaceDeck.value = String(selectedFile.workspace || projectWorkspaceDecks.value[0]?.id || 'research')
    activeWorkbenchPanel.value = 'editor'
    ensureWorkspaceInteraction(selectedFile)
    if (isMobileViewport.value) {
      closeMobileDrawers()
    }
  }
  selectedWorkspaceFileId.value = fileId
}

function ensureDashboardTargetFile() {
  if (!activeProject.value) return null
  const existing = primaryWorkspaceFile.value
  if (existing) {
    ensureWorkspaceInteraction(existing)
    return existing
  }

  const fallbackKind = activeWorkspaceDeckMeta.value?.allowedKinds?.[0] || 'note'
  const createdId = incubatorStore.addProjectFile(activeProject.value.id, {
    kind: fallbackKind,
    workspace: activeWorkspaceDeck.value,
    name: defaultWorkspaceObjectName(fallbackKind),
    notes: '',
    status: 'draft',
  })
  if (!createdId) return null
  const createdFile = activeProject.value.files.find((file) => file.id === createdId) || null
  if (createdFile) {
    ensureWorkspaceInteraction(createdFile)
    persistWorkspaceInteraction(createdFile)
  }
  return createdFile
}

function openDashboardMainFile() {
  const targetFile = ensureDashboardTargetFile()
  if (!targetFile) return
  selectWorkspaceFile(targetFile.id)
}

function handleDashboardCreateTask() {
  const targetFile = ensureDashboardTargetFile()
  if (!targetFile) return
  ensureWorkspaceInteraction(targetFile)
  interaction.addForgeTask(targetFile.id, {
    title: `Task ${(interaction.getApp(targetFile.id)?.runtimeData.tasks?.length || 0) + 1}`,
  })
  persistWorkspaceInteraction(targetFile)
}

function handleDashboardCreateMindNode() {
  const targetFile = ensureDashboardTargetFile()
  if (!targetFile) return
  ensureWorkspaceInteraction(targetFile)
  const runtime = interaction.getApp(targetFile.id)?.runtimeData
  interaction.upsertForgeMindNode(targetFile.id, {
    id: `mind-${(runtime?.mindmap?.nodes?.length || 0) + 1}`,
    label: `Node ${(runtime?.mindmap?.nodes?.length || 0) + 1}`,
    x: 24,
    y: 38,
    type: 'detail',
  })
  persistWorkspaceInteraction(targetFile)
}

function ensureWorkspaceInteraction(file, options = {}) {
  if (!file) return null

  const parsedRuntime = parseWorkspaceNotesToRuntime(file.notes || '', file.kind)
  const existing = interaction.getApp(file.id)

  if (!existing) {
    return interaction.openApp(file.id, {
      title: file.name || 'Workspace object',
      kind: file.kind,
      initialData: parsedRuntime,
      meta: {
        source: 'incubator-workspace',
        workspace: file.workspace || null,
      },
    })
  }

  if (options.forceFromNotes) {
    interaction.patchData(file.id, parsedRuntime)
  }

  return existing
}

function persistWorkspaceInteraction(file = activeWorkspaceFile.value) {
  if (!activeProject.value || !file) return
  const app = interaction.getApp(file.id)
  if (!app) return

  const serialized = serializeWorkspaceRuntimeToNotes(app.runtimeData, file.kind)
  if (serialized === file.notes) return
  incubatorStore.updateProjectFile(activeProject.value.id, file.id, { notes: serialized })
}

function handleInteractionPatch(patch = {}) {
  const file = activeWorkspaceFile.value
  if (!file) return

  ensureWorkspaceInteraction(file)
  interaction.patchData(file.id, patch)
  persistWorkspaceInteraction(file)
}

function handleInteractionAction(actionId) {
  const file = activeWorkspaceFile.value
  if (!file) return

  ensureWorkspaceInteraction(file)

  if (actionId === 'motion:generate-timeline') {
    interaction.generateMotionTimelineFromScript(file.id)
  } else if (actionId === 'motion:play') {
    interaction.playMotion(file.id)
  } else if (actionId === 'motion:pause') {
    interaction.pauseMotion(file.id)
  } else if (actionId === 'forge:add-task') {
    interaction.addForgeTask(file.id, {
      title: `Task ${(interaction.getApp(file.id)?.runtimeData.tasks?.length || 0) + 1}`,
    })
  } else if (actionId === 'forge:add-mind-node') {
    const runtime = interaction.getApp(file.id)?.runtimeData
    interaction.upsertForgeMindNode(file.id, {
      id: `mind-${(runtime?.mindmap?.nodes?.length || 0) + 1}`,
      label: `Node ${(runtime?.mindmap?.nodes?.length || 0) + 1}`,
      x: 24,
      y: 38,
      type: 'detail',
    })
  } else if (actionId === 'forge:connect-mind') {
    const nodes = interaction.getApp(file.id)?.runtimeData?.mindmap?.nodes || []
    if (nodes.length > 1) {
      interaction.connectForgeMindNodes(file.id, nodes[nodes.length - 2].id, nodes[nodes.length - 1].id)
    }
  } else if (actionId === 'canvas:add-node') {
    const runtime = interaction.getApp(file.id)?.runtimeData
    const nextIndex = (runtime?.nodes?.length || 0) + 1
    interaction.upsertCanvasNode(file.id, {
      id: `canvas-node-${nextIndex}`,
      label: `Node ${nextIndex}`,
      type: 'state',
    })
  } else if (actionId === 'canvas:connect-latest') {
    const runtime = interaction.getApp(file.id)?.runtimeData
    const nodes = runtime?.nodes || []
    const edges = runtime?.edges || []
    if (nodes.length > 1) {
      interaction.patchData(file.id, {
        edges: [
          ...edges,
          {
            id: `canvas-edge-${edges.length + 1}`,
            from: nodes[nodes.length - 2].id,
            to: nodes[nodes.length - 1].id,
          },
        ],
      })
    }
  } else if (actionId === 'log:add-entry') {
    interaction.appendLogEntry(file.id, {
      title: 'New entry',
      text: 'Capture key observation, decision, and next step.',
      tone: 'system',
    })
  } else if (actionId === 'chat:add-note') {
    interaction.patchData(file.id, {
      notes: `${interaction.getApp(file.id)?.runtimeData?.notes || ''}\n- New note`,
    })
  }

  persistWorkspaceInteraction(file)
}

function ensureMotionWorkspace(file) {
  if (!file || workspacePreviewFamily(file) !== 'motion') return
  const app = ensureWorkspaceInteraction(file)
  if (!app) return

  const explanation = app.runtimeData.explanation
    || app.runtimeData.prompt
    || 'Test motion scene for Danilo explanations and animated teaching beats.'
  const timeline = [
    {
      id: 'motion-intro',
      title: 'Signal ignition',
      description: 'Danilo launches the explanation scene.',
      status: 'active',
    },
    {
      id: 'motion-orbit',
      title: 'Orbit transfer',
      description: 'The object gains motion and curves around the core.',
      status: 'pending',
    },
    {
      id: 'motion-lock',
      title: 'Concept lock',
      description: 'The animation resolves into a stable visual state.',
      status: 'pending',
    },
  ]

  interaction.patchData(file.id, {
    explanation,
    timeline: app.runtimeData.timeline?.length ? app.runtimeData.timeline : timeline,
    isPlaying: true,
  })
}

function destroyMotionPreview() {
  if (!motionPreviewTimeline) return
  motionPreviewTimeline.kill()
  motionPreviewTimeline = null
}

function startMotionPreview(app) {
  destroyMotionPreview()
  if (!app || !motionPreviewRef.value || !motionOrbRef.value || !motionPulseRef.value) return

  app.runtimeData.progress = 0
  app.runtimeData.activeStepId = 'motion-intro'

  gsap.set(motionOrbRef.value, { x: 0, y: 0 })
  gsap.set(motionPulseRef.value, { scale: 0.7, opacity: 0.22 })

  motionPreviewTimeline = gsap.timeline({
    repeat: -1,
    defaults: {
      ease: 'sine.inOut',
    },
    onUpdate: () => {
      if (!motionPreviewTimeline || !activeMotionApp.value || activeMotionApp.value.id !== app.id) return

      const progress = motionPreviewTimeline.progress()
      app.runtimeData.progress = progress * 100

      if (progress < 0.34) {
        app.runtimeData.activeStepId = 'motion-intro'
      } else if (progress < 0.74) {
        app.runtimeData.activeStepId = 'motion-orbit'
      } else {
        app.runtimeData.activeStepId = 'motion-lock'
      }
    },
  })

  motionPreviewTimeline
    .to(motionPulseRef.value, { scale: 1.65, opacity: 0.6, duration: 1.05 }, 0)
    .to(motionOrbRef.value, { x: 94, y: -48, duration: 1.2 }, 0)
    .to(motionOrbRef.value, { x: 164, y: 0, duration: 1.35 }, 1.2)
    .to(motionOrbRef.value, { x: 94, y: 48, duration: 1.15 }, 2.55)
    .to(motionOrbRef.value, { x: 0, y: 0, duration: 1.25 }, 3.7)
    .to(motionPulseRef.value, { scale: 0.78, opacity: 0.2, duration: 0.95 }, 3.7)
}

function defaultWorkspaceObjectName(kind) {
  const existingCount = activeProject.value?.files.filter((file) => workspaceFileKind(file).kind === kind).length || 0
  return `untitled-${kind}-${existingCount + 1}.${kind}`
}

function openCreateObjectModal() {
  selectedWorkspaceDeck.value = activeWorkspaceDeck.value
  selectedWorkspaceKind.value = selectedDeckKinds.value[0]?.kind || workspaceFileKinds.value[0].kind
  newWorkspaceObjectName.value = defaultWorkspaceObjectName(selectedWorkspaceKind.value)
  isCreateObjectModalOpen.value = true
}

function closeCreateObjectModal() {
  isCreateObjectModalOpen.value = false
  newWorkspaceObjectName.value = ''
}

function handleCreateWorkspaceObject() {
  if (!activeProject.value) return

  const kind = selectedWorkspaceKind.value || workspaceFileKinds.value[0].kind
  const deck = selectedWorkspaceDeck.value || activeWorkspaceDeck.value
  const fileName = newWorkspaceObjectName.value.trim() || defaultWorkspaceObjectName(kind)
  const createdId = incubatorStore.addProjectFile(activeProject.value.id, {
    kind,
    workspace: deck,
    name: fileName,
    notes: '',
    status: 'draft',
  })

  if (!createdId) return

  activeWorkspaceDeck.value = deck
  selectedWorkspaceFileId.value = createdId
  activeWorkbenchPanel.value = 'editor'
  const createdFile = activeProject.value.files.find((file) => file.id === createdId)
  if (createdFile) {
    ensureWorkspaceInteraction(createdFile)
    persistWorkspaceInteraction(createdFile)
  }
  closeCreateObjectModal()
}

function applyWorkspaceForm(workspace = null) {
  editingWorkspaceId.value = workspace?.id || null
  workspaceFormTitle.value = workspace?.title || 'Custom workspace'
  workspaceFormIcon.value = workspace?.icon || '◈'
  workspaceFormSubtitle.value = workspace?.subtitle || 'Custom workflow zone'
  workspaceFormFamily.value = workspace?.family || 'canvas'
  const baseKinds = Array.isArray(workspace?.allowedKinds) && workspace.allowedKinds.length
    ? [...workspace.allowedKinds]
    : ['scene']
  workspaceFormKinds.value = baseKinds.includes('chat') ? baseKinds : [...baseKinds, 'chat']
}

function startWorkspaceCreate() {
  applyWorkspaceForm(null)
}

function beginWorkspaceEdit(workspace) {
  applyWorkspaceForm(workspace)
}

function openWorkspaceManagerModal() {
  applyWorkspaceForm(projectWorkspaceDecks.value[0] || null)
  isWorkspaceManagerModalOpen.value = true
}

function closeWorkspaceManagerModal() {
  isWorkspaceManagerModalOpen.value = false
}

function toggleWorkspaceFormKind(kindId) {
  if (workspaceFormKinds.value.includes(kindId)) {
    if (workspaceFormKinds.value.length === 1) return
    workspaceFormKinds.value = workspaceFormKinds.value.filter((item) => item !== kindId)
    return
  }
  workspaceFormKinds.value = [...workspaceFormKinds.value, kindId]
}

function saveWorkspaceConfig() {
  if (!activeProject.value) return

  const payload = {
    title: workspaceFormTitle.value.trim() || 'Custom workspace',
    icon: workspaceFormIcon.value.trim() || '◈',
    subtitle: workspaceFormSubtitle.value.trim() || 'Custom workflow zone',
    family: workspaceFormFamily.value,
    allowedKinds: (() => {
      const kinds = workspaceFormKinds.value.length ? [...workspaceFormKinds.value] : ['scene']
      return kinds.includes('chat') ? kinds : [...kinds, 'chat']
    })(),
  }

  if (editingWorkspaceId.value) {
    incubatorStore.updateProjectWorkspace(activeProject.value.id, editingWorkspaceId.value, payload)
    return
  }

  const createdWorkspaceId = incubatorStore.addProjectWorkspace(activeProject.value.id, payload)
  if (!createdWorkspaceId) return
  editingWorkspaceId.value = createdWorkspaceId
  activeWorkspaceDeck.value = createdWorkspaceId
  selectedWorkspaceDeck.value = createdWorkspaceId
}

function handleCreateFolder() {
  const normalized = normalizeFolder(newThreadTitle.value)
  if (!normalized) return
  if (!folderOptions.value.includes(normalized)) {
    customFolders.value = [...customFolders.value, normalized]
  }
  selectedTreeFolder.value = normalized
  collapsedFolders.value = { ...collapsedFolders.value, [normalized]: false }
  newThreadTitle.value = ''
}

function isFolderCollapsed(folder) {
  return Boolean(collapsedFolders.value[folder])
}

function toggleFolder(folder) {
  selectedTreeFolder.value = folder
  collapsedFolders.value = {
    ...collapsedFolders.value,
    [folder]: !collapsedFolders.value[folder],
  }
}

async function handleCreateThread() {
  const normalizedFolder = normalizeFolder(selectedTreeFolder.value)
  if (!folderOptions.value.includes(normalizedFolder)) {
    customFolders.value = [...customFolders.value, normalizedFolder]
  }
  const resolvedTitle = newThreadTitle.value.trim() || `Chat ${incubatorStore.threads.length + 1}`
  const threadId = incubatorStore.createThread(resolvedTitle, {
    folder: normalizedFolder,
    initialMessage: 'Канал відкрито. Я на лінії - кидай сюди сирі думки, а я допоможу зібрати їх у щось сильне.',
  })
  if (!threadId) return
  newThreadTitle.value = ''
  collapsedFolders.value = { ...collapsedFolders.value, [normalizedFolder]: false }
  await nextTick()
  scrollFeed(messageFeedRef)
}

async function handleSendSignal() {
  const sent = await incubatorStore.sendMessage(composerText.value)
  if (!sent) return
  composerText.value = ''
  await nextTick()
  scrollFeed(messageFeedRef)
}

async function handleSendWorkspaceSignal() {
  if (!workspaceThread.value) return
  const sent = await incubatorStore.sendMessage(workspaceComposerText.value, workspaceThread.value.id)
  if (!sent) return
  workspaceComposerText.value = ''
  await nextTick()
  scrollFeed(workspaceMessageFeedRef)
}

function openLinkedProject() {
  if (!linkedProject.value) return
  openProjectWorkspace(linkedProject.value.id)
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
      `${project.icon || '🧠'} ${project.title}`,
      `Summary: ${project.summary}`,
      `Notes: ${project.notes || ''}`,
      'Files:',
      ...project.files.map((file) => `- ${file.name} (${file.workspace || project.workspaces?.[0]?.id || 'research'} / ${file.kind}, ${file.status})`),
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
  () => selectedWorkspaceDeck.value,
  () => {
    const activeKind = selectedDeckKinds.value.find((item) => item.kind === selectedWorkspaceKind.value)
    if (activeKind) return
    const fallbackKind = selectedDeckKinds.value[0]?.kind
    if (!fallbackKind) return
    selectedWorkspaceKind.value = fallbackKind
    newWorkspaceObjectName.value = defaultWorkspaceObjectName(fallbackKind)
  }
)

watch(
  () => selectedWorkspaceKind.value,
  (kind) => {
    if (!isCreateObjectModalOpen.value) return
    if (!kind) return
    if (!newWorkspaceObjectName.value.trim() || !newWorkspaceObjectName.value.includes('.')) {
      newWorkspaceObjectName.value = defaultWorkspaceObjectName(kind)
    }
  }
)

watch(
  () => [incubatorStore.activeThreadId, activeThread.value?.messages.length],
  async () => {
    await nextTick()
    scrollFeed(messageFeedRef)
  },
  { immediate: true }
)

watch(
  () => [workspaceThread.value?.id, workspaceThread.value?.messages.length],
  async () => {
    await nextTick()
    scrollFeed(workspaceMessageFeedRef)
  },
  { immediate: true }
)

watch(
  () => [bayWorkspaceProjectId.value, activeWorkspaceDeck.value, activeProject.value?.files.length],
  () => {
    if (!activeProject.value) {
      selectedWorkspaceFileId.value = null
      return
    }

    const hasSelected = activeProject.value.files.some((file) => {
      const inDeck = String(file.workspace || projectWorkspaceDecks.value[0]?.id || 'research') === activeWorkspaceDeck.value
      return inDeck && file.id === selectedWorkspaceFileId.value
    })
    const hasDashboardSelected = selectedWorkspaceFileId.value === WORKSPACE_DASHBOARD_FILE_ID

    if (!visibleWorkspaceFiles.value.length) {
      selectedWorkspaceFileId.value = WORKSPACE_DASHBOARD_FILE_ID
      return
    }

    if (!hasSelected && !hasDashboardSelected) {
      selectedWorkspaceFileId.value = WORKSPACE_DASHBOARD_FILE_ID
    }
  },
  { immediate: true }
)

watch(
  () => [isWorkspaceDashboardSelected.value, primaryWorkspaceFile.value?.id],
  ([isDashboard]) => {
    if (!isDashboard) return
    if (!primaryWorkspaceFile.value) return
    ensureWorkspaceInteraction(primaryWorkspaceFile.value)
  },
  { immediate: true }
)

watch(
  () => activeProject.value?.id,
  (projectId) => {
    if (!projectId) return
    incubatorStore.ensureProjectThread(projectId)
  },
  { immediate: true }
)

watch(
  () => activeWorkspaceFile.value,
  async (file) => {
    destroyMotionPreview()
    if (!file) return
    ensureWorkspaceInteraction(file)
    if (workspacePreviewFamily(file) !== 'motion') return
    ensureMotionWorkspace(file)
    await nextTick()
    if (activeMotionApp.value) {
      startMotionPreview(activeMotionApp.value)
    }
  },
  { immediate: true }
)

watch(
  () => activeWorkspaceFile.value?.notes,
  (notes) => {
    const file = activeWorkspaceFile.value
    if (!file) return
    const app = ensureWorkspaceInteraction(file)
    if (!app) return
    const parsed = parseWorkspaceNotesToRuntime(notes || '', file.kind)
    interaction.patchData(file.id, parsed)
    if (workspacePreviewFamily(file) === 'motion') {
      ensureMotionWorkspace(file)
    }
  }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    mobileMediaQuery = window.matchMedia('(max-width: 980px)')
    syncMobileViewport()
    if (typeof mobileMediaQuery.addEventListener === 'function') {
      mobileMediaQuery.addEventListener('change', syncMobileViewport)
    } else if (typeof mobileMediaQuery.addListener === 'function') {
      mobileMediaQuery.addListener(syncMobileViewport)
    }
    window.addEventListener('resize', syncMobileViewport)
  }
})

onBeforeUnmount(() => {
  destroyMotionPreview()
  if (typeof window !== 'undefined') {
    if (mobileMediaQuery) {
      if (typeof mobileMediaQuery.removeEventListener === 'function') {
        mobileMediaQuery.removeEventListener('change', syncMobileViewport)
      } else if (typeof mobileMediaQuery.removeListener === 'function') {
        mobileMediaQuery.removeListener(syncMobileViewport)
      }
    }
    window.removeEventListener('resize', syncMobileViewport)
  }
})
</script>

<style scoped>
.incubator-page {
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.incubator-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.surface {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-elevated);
}

.incubator-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
}

.eyebrow {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-actions,
.workspace-tabs,
.chat-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mode-pill,
.back-button {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  color: var(--text-primary);
  font: inherit;
  cursor: pointer;
}

.mode-pill.is-active {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.comms-layout {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 10px;
}

.chat-sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sidebar-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tree-create {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.thread-list,
.chat-feed,
.workspace-grid,
.file-list {
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thread-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tree-folder-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--bg-main) 96%, var(--accent-color) 4%);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.tree-folder-row.is-selected {
  border-color: var(--accent-color);
}

.tree-caret {
  width: 12px;
  color: var(--text-secondary);
}

.tree-children {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 16px;
}

.thread-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.thread-item.is-active {
  border-color: var(--accent-color);
}

.tree-file-dot {
  color: var(--text-secondary);
}

.thread-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-badge {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  display: grid;
  place-items: center;
  font-size: 0.72rem;
}

.thread-empty {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.chat-main {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px;
  gap: 10px;
}

.chat-main-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.chat-main-title-row {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chat-main-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-folder-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.chat-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 2px;
}

.message-bubble {
  max-width: 80%;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.message-bubble.is-stepan {
  align-self: flex-end;
  background: color-mix(in srgb, var(--accent-color) 14%, var(--bg-elevated));
}

.message-bubble.is-danilo {
  align-self: flex-start;
}

.message-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.message-head span,
.message-bubble p {
  color: var(--text-secondary);
  margin: 0;
}

.composer {
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.composer-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: end;
}

.composer-textarea {
  min-height: 86px;
}

.send-button {
  min-width: 132px;
  height: 46px;
}

.bay-layout {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  min-width: 0;
}

.workspace-list-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
}

.bay-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.workspace-filter-chip {
  cursor: pointer;
  gap: 6px;
}

.workspace-filter-chip.is-active {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.workspace-search {
  width: min(360px, 100%);
  max-width: 360px;
}

.create-icon-btn {
  min-width: 34px;
  min-height: 34px;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
}

.mobile-only {
  display: none;
}

.workspace-grid {
  max-height: calc(100% - 84px);
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);
  grid-auto-rows: 228px;
  gap: 14px;
  padding-right: 2px;
  justify-content: center;
  align-content: start;
}

.workspace-card {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 320px;
  height: 228px;
  min-height: 228px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
  overflow: hidden;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--accent-color) 20%, var(--border-color));
  border-radius: 14px;
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 56%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 94%, var(--bg-main) 6%), color-mix(in srgb, var(--bg-main) 88%, transparent));
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.workspace-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.workspace-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--text-primary) 94%, white 6%);
  background: color-mix(in srgb, var(--card-hue, var(--accent-color)) 24%, rgba(255, 255, 255, 0.08));
  border: 1px solid color-mix(in srgb, var(--card-hue, var(--accent-color)) 42%, transparent);
}

.workspace-updated {
  font-size: 11px;
  color: color-mix(in srgb, var(--text-secondary) 86%, white 14%);
}

.workspace-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.workspace-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 58%, white 42%), color-mix(in srgb, var(--accent-color) 78%, black 22%));
  border: 1px solid color-mix(in srgb, var(--accent-color) 62%, black 38%);
  box-shadow:
    0 8px 16px color-mix(in srgb, var(--accent-color) 26%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
  flex-shrink: 0;
}

.workspace-summary {
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.workspace-card-foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.workspace-stat {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  height: 24px;
  max-width: 100%;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: color-mix(in srgb, var(--text-primary) 92%, white 8%);
  border: 1px solid color-mix(in srgb, var(--border-color) 76%, transparent);
  background: color-mix(in srgb, var(--bg-main) 74%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 86% 18%, color-mix(in srgb, var(--accent-color) 34%, transparent), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 24%);
  opacity: 0.88;
}

.workspace-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-color) 14%, transparent);
}

.workspace-card:hover {
  border-color: color-mix(in srgb, var(--accent-color) 62%, var(--border-color));
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.26),
    0 0 0 1px color-mix(in srgb, var(--accent-color) 20%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.workspace-card:nth-child(4n + 1) {
  --card-hue: #00ffd9;
}

.workspace-card:nth-child(4n + 2) {
  --card-hue: #af52de;
}

.workspace-card:nth-child(4n + 3) {
  --card-hue: #ff9f0a;
}

.workspace-card:nth-child(4n + 4) {
  --card-hue: #deff9a;
}

.workspace-card:nth-child(4n + 1)::before,
.workspace-card:nth-child(4n + 2)::before,
.workspace-card:nth-child(4n + 3)::before,
.workspace-card:nth-child(4n + 4)::before {
  background:
    radial-gradient(circle at 86% 18%, color-mix(in srgb, var(--card-hue) 36%, transparent), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 24%);
}

.workspace-shell {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow: hidden;
}

.workspace-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
}

.workspace-head-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.workspace-title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-studio {
  min-height: 0;
  flex: 1;
  display: grid;
  width: 100%;
  max-width: 100%;
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
}

.workspace-column {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  overflow: hidden;
}

.workspace-glass {
  background: color-mix(in srgb, var(--bg-main) 82%, transparent);
  border: 1px solid rgba(0, 255, 127, 0.2);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-color) 8%, transparent);
}

.workspace-column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}

.workspace-head-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.workspace-head-actions :deep(.base-btn) {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desktop-only {
  display: inline-flex;
}

.workspace-tree {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workspace-deck-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.workspace-deck-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  color: var(--text-secondary);
  cursor: pointer;
}

.workspace-deck-tab.is-active {
  color: var(--text-primary);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 30%, transparent);
}

.workspace-folder-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.workspace-file-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 16px;
}

.workspace-file-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 7px 9px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.workspace-file-row.is-active {
  border-color: var(--accent-color);
}

.workspace-file-kind-icon {
  width: 18px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.workspace-file-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-file-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workspace-file-deck {
  font-size: 0.66rem;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-files-empty {
  font-size: 0.82rem;
  color: var(--text-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  padding: 9px 10px;
}

.workspace-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.workspace-editor-body {
  min-height: 0;
  flex: 1;
  border: 1px dashed color-mix(in srgb, var(--accent-color) 30%, var(--border-color));
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.workspace-chat {
  min-width: 0;
  grid-column: 2;
}

.workspace-chat-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workspace-chat-context {
  letter-spacing: 0.04em;
}

.workspace-chat-feed {
  border: 1px dashed color-mix(in srgb, var(--accent-color) 24%, var(--border-color));
  border-radius: 12px;
  padding: 10px;
}

.workspace-composer {
  margin-top: auto;
}

.file-preview-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.preview-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.chat-preview-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 24%, var(--border-color));
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.chat-preview-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #4dffb0;
  text-shadow: 0 0 10px rgba(77, 255, 176, 0.45);
  border: 1px solid rgba(77, 255, 176, 0.22);
  background: rgba(77, 255, 176, 0.08);
}

.mobile-drawer-backdrop {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: color-mix(in srgb, #03090a 58%, transparent);
  backdrop-filter: blur(2px);
}

.canvas-preview-panel {
  justify-content: flex-start;
}

.canvas-preview-stage {
  position: relative;
  min-height: 280px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, #bb9bff 24%, var(--border-color));
  background:
    radial-gradient(circle at center, rgba(187, 155, 255, 0.14), transparent 38%),
    linear-gradient(180deg, rgba(18, 14, 35, 0.96), rgba(10, 11, 24, 0.98));
}

.canvas-preview-node,
.canvas-preview-link {
  position: absolute;
}

.canvas-preview-node {
  min-width: 56px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(187, 155, 255, 0.26);
  background: rgba(187, 155, 255, 0.1);
  color: #e4d8ff;
  font-size: 0.8rem;
  box-shadow: 0 0 18px rgba(187, 155, 255, 0.12);
}

.canvas-preview-link {
  height: 1px;
  background: linear-gradient(90deg, rgba(187, 155, 255, 0.12), rgba(187, 155, 255, 0.5), rgba(187, 155, 255, 0.12));
  transform-origin: left center;
}

.log-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-preview-entry {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #ffd978 18%, var(--border-color));
  background: color-mix(in srgb, var(--bg-main) 95%, #ffd978 5%);
}

.log-preview-entry strong {
  font-size: 0.82rem;
}

.log-preview-entry span,
.log-preview-entry p {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.log-preview-entry p {
  grid-column: 1 / -1;
  margin: 0;
}

.forge-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.forge-preview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #ff8f6e 18%, var(--border-color));
  background: color-mix(in srgb, var(--bg-main) 95%, #ff8f6e 5%);
}

.forge-task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.forge-task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
}

.forge-task-item strong,
.forge-task-item span {
  display: block;
}

.forge-task-item span {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.forge-task-dot {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  border-radius: 999px;
  background: #ff8f6e;
  box-shadow: 0 0 10px rgba(255, 143, 110, 0.38);
  flex-shrink: 0;
}

.motion-preview-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.motion-preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.motion-preview-stage {
  position: relative;
  min-height: 280px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent-color) 22%, var(--border-color));
  background:
    radial-gradient(circle at center, rgba(122, 212, 255, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(7, 20, 40, 0.96), rgba(6, 10, 20, 0.98));
}

.motion-grid,
.motion-axis,
.motion-orbit-track,
.motion-pulse,
.motion-core,
.motion-orb {
  position: absolute;
}

.motion-grid {
  inset: 0;
  background-image:
    linear-gradient(rgba(122, 212, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(122, 212, 255, 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.88), transparent);
}

.motion-axis-x,
.motion-axis-y {
  background: rgba(122, 212, 255, 0.18);
}

.motion-axis-x {
  left: 50%;
  top: 50%;
  width: 72%;
  height: 1px;
  transform: translate(-50%, -50%);
}

.motion-axis-y {
  left: 50%;
  top: 50%;
  width: 1px;
  height: 72%;
  transform: translate(-50%, -50%);
}

.motion-orbit-track {
  left: 50%;
  top: 50%;
  width: 164px;
  height: 164px;
  border: 1px dashed rgba(122, 212, 255, 0.3);
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

.motion-pulse {
  left: 50%;
  top: 50%;
  width: 84px;
  height: 84px;
  border-radius: 999px;
  border: 1px solid rgba(122, 212, 255, 0.42);
  transform: translate(-50%, -50%);
}

.motion-core {
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: radial-gradient(circle at 32% 32%, #d7f7ff, #62c8ff 58%, #1c4468 100%);
  box-shadow: 0 0 26px rgba(98, 200, 255, 0.5);
  transform: translate(-50%, -50%);
}

.motion-orb {
  left: calc(50% - 8px);
  top: calc(50% - 8px);
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: radial-gradient(circle at 32% 32%, #f9feff, #7ad4ff 55%, #1e6b9e 100%);
  box-shadow: 0 0 18px rgba(122, 212, 255, 0.45);
}

.motion-timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.motion-step {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
}

.motion-step strong {
  font-size: 0.82rem;
}

.motion-step span {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.motion-step.is-active {
  border-color: #7ad4ff;
  box-shadow: 0 0 0 1px rgba(122, 212, 255, 0.24);
}

.workspace-input-mono {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.create-object-overlay {
  position: fixed;
  inset: 0;
  z-index: 5200;
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, #03090a 70%, transparent);
  backdrop-filter: blur(8px);
}

.create-object-modal {
  width: min(720px, 100%);
  max-height: min(86vh, 760px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.modal-close {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-main) 94%, var(--accent-color) 6%);
  color: var(--text-primary);
  cursor: pointer;
}

.workspace-kind-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.workspace-kind-category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workspace-kind-category-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.workspace-kind-category-title {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-deck-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.workspace-deck-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  color: var(--text-primary);
  cursor: pointer;
}

.workspace-deck-card.is-active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 30%, transparent);
}

.workspace-kind-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  color: var(--text-primary);
  cursor: pointer;
}

.workspace-kind-card.is-active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 30%, transparent);
}

.workspace-kind-icon {
  width: 22px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.workspace-kind-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.workspace-kind-copy span {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.workspace-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.workspace-manager-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.workspace-manager-meta {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 8px;
}

.workspace-family-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.workspace-family-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-main) 95%, var(--accent-color) 5%);
  color: var(--text-secondary);
  cursor: pointer;
}

.workspace-family-chip.is-active {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group span {
  font-size: 0.72rem;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.is-chat {
  color: #4dffb0;
  text-shadow: 0 0 10px rgba(77, 255, 176, 0.45);
}

.is-motion {
  color: #7ad4ff;
  text-shadow: 0 0 10px rgba(122, 212, 255, 0.45);
}

.is-timeline,
.is-storyboard {
  color: #7ad4ff;
  text-shadow: 0 0 10px rgba(122, 212, 255, 0.45);
}

.is-canvas {
  color: #bb9bff;
  text-shadow: 0 0 10px rgba(187, 155, 255, 0.45);
}

.is-scene,
.is-sim,
.is-entity,
.is-mission,
.is-js,
.is-ts,
.is-logic,
.is-schema {
  color: #bb9bff;
  text-shadow: 0 0 10px rgba(187, 155, 255, 0.45);
}

.is-log {
  color: #ffd978;
  text-shadow: 0 0 10px rgba(255, 217, 120, 0.45);
}

.is-note,
.is-brief,
.is-research {
  color: #ffd978;
  text-shadow: 0 0 10px rgba(255, 217, 120, 0.45);
}

.is-forge {
  color: #ff8f6e;
  text-shadow: 0 0 10px rgba(255, 143, 110, 0.45);
}

.is-plan,
.is-spec,
.is-system {
  color: #ff8f6e;
  text-shadow: 0 0 10px rgba(255, 143, 110, 0.45);
}

.empty-state {
  min-height: 0;
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
}

.app-input,
.app-textarea,
.app-select {
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font: inherit;
  box-sizing: border-box;
}

.app-textarea {
  resize: vertical;
}

@media (max-width: 1400px) {
  .workspace-grid {
    grid-template-columns: repeat(auto-fill, 300px);
    grid-auto-rows: 216px;
  }

  .workspace-studio {
    grid-template-columns: minmax(200px, 240px) minmax(0, 1fr);
  }
}

@media (max-width: 980px) {
  .incubator-shell.is-comms-mobile {
    padding: 0;
    gap: 0;
  }

  .incubator-shell.is-comms-mobile .incubator-header {
    display: none;
  }

  .incubator-shell.is-comms-mobile .comms-layout {
    padding: 6px;
  }

  .incubator-shell.is-workspace-open {
    padding: 0;
    gap: 0;
  }

  .incubator-shell.is-workspace-open .incubator-header {
    display: none;
  }

  .incubator-shell.is-workspace-open .bay-layout {
    padding: 0;
  }

  .incubator-shell.is-workspace-open .workspace-shell {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    padding: 6px;
  }

  .incubator-shell.is-workspace-open .workspace-head {
    align-items: center;
    gap: 6px;
  }

  .incubator-shell.is-workspace-open .workspace-head-main {
    gap: 2px;
  }

  .incubator-shell.is-workspace-open .workspace-title {
    font-size: 1rem;
    line-height: 1.2;
  }

  .comms-layout {
    grid-template-columns: 1fr;
    position: relative;
    overflow: hidden;
  }

  .chat-sidebar.is-mobile-drawer {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(88vw, 340px);
    z-index: 40;
    overflow-y: auto;
    transform: translateX(-105%);
    transition: transform 0.22s ease;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32);
  }

  .chat-sidebar.is-mobile-drawer.is-open {
    display: flex;
    transform: translateX(0);
  }

  .chat-main {
    height: 100%;
  }

  .chat-main-head.is-mobile {
    align-items: center;
  }

  .chat-main-head.is-mobile .chat-head-actions :deep(.base-btn) {
    max-width: 46vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-grid {
    grid-template-columns: repeat(auto-fill, 300px);
    grid-auto-rows: 216px;
    max-height: calc(100% - 88px);
  }

  .workspace-card {
    width: 300px;
    height: 216px;
    min-height: 216px;
  }

  .mobile-only {
    display: inline-flex;
  }

  .desktop-only {
    display: none;
  }

  .workspace-studio {
    grid-template-columns: 1fr;
    position: relative;
    overflow-y: auto;
  }

  .workspace-explorer.is-mobile-drawer,
  .workspace-chat.is-mobile-drawer {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    max-height: none;
    width: min(88vw, 340px);
    z-index: 40;
    overflow-y: auto;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32);
    transition: transform 0.22s ease;
  }

  .workspace-explorer.is-mobile-drawer {
    left: 0;
    transform: translateX(-105%);
  }

  .workspace-chat.is-mobile-drawer {
    right: 0;
    transform: translateX(105%);
    grid-column: auto;
  }

  .workspace-explorer.is-mobile-drawer.is-open,
  .workspace-chat.is-mobile-drawer.is-open {
    display: flex;
    transform: translateX(0);
  }
}

@media (max-width: 760px) {
  .incubator-shell {
    padding: 8px;
  }

  .incubator-header,
  .workspace-head,
  .workspace-list-head,
  .tree-create,
  .composer-input-row {
    display: flex;
    flex-direction: column;
  }

  .incubator-shell.is-comms-mobile .chat-main-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .incubator-shell.is-comms-mobile .chat-head-actions {
    flex-wrap: nowrap;
  }

  .incubator-shell.is-comms-mobile .chat-main {
    padding: 10px;
    gap: 8px;
  }

  .incubator-shell.is-comms-mobile .composer {
    padding-top: 8px;
    gap: 6px;
  }

  .workspace-search {
    max-width: none;
  }

  .workspace-list-actions {
    width: 100%;
    justify-content: space-between;
  }

  .workspace-head-actions {
    width: 100%;
  }

  .workspace-head-actions :deep(.base-btn) {
    flex: 1 1 auto;
    min-width: 0;
  }

  .workspace-head-actions :deep(.create-icon-btn) {
    flex: 0 0 auto;
  }

  .incubator-shell.is-workspace-open .workspace-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .incubator-shell.is-workspace-open .workspace-head-main {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .incubator-shell.is-workspace-open .workspace-title {
    display: none;
  }

  .incubator-shell.is-workspace-open .workspace-head-actions {
    width: auto;
    flex-wrap: nowrap;
  }

  .incubator-shell.is-workspace-open .workspace-head-actions :deep(.base-btn) {
    flex: 0 0 auto;
  }

  .workspace-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: 214px;
  }

  .workspace-card {
    width: 100%;
    max-width: none;
    height: 214px;
    min-height: 214px;
  }

  .workspace-kind-list {
    grid-template-columns: 1fr;
  }

  .workspace-deck-list {
    grid-template-columns: 1fr;
  }

  .workspace-manager-list,
  .workspace-manager-meta {
    grid-template-columns: 1fr;
  }

  .message-bubble {
    max-width: 100%;
  }

  .send-button {
    width: 100%;
  }

  .workspace-modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
