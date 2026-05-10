import { reactive } from 'vue'

export const INTERACTION_FILE_KINDS = Object.freeze({
  chat: 'chat',
  motion: 'motion',
  canvas: 'canvas',
  log: 'log',
  forge: 'forge',
})

const FILE_KIND_ALIASES = Object.freeze({
  chat: 'chat',
  documentation: 'log',
  notebook: 'log',
  journal: 'log',
  reference: 'log',
  todo: 'forge',
  mindmap: 'forge',
  roadmap: 'forge',
  decision: 'forge',
  api: 'canvas',
  config: 'canvas',
  test: 'canvas',
  map: 'canvas',
  flow: 'canvas',
  shotlist: 'motion',
  audio: 'motion',
  motion: 'motion',
  timeline: 'motion',
  storyboard: 'motion',
  scene: 'canvas',
  sim: 'canvas',
  entity: 'canvas',
  mission: 'canvas',
  js: 'canvas',
  ts: 'canvas',
  logic: 'canvas',
  schema: 'canvas',
  canvas: 'canvas',
  note: 'log',
  log: 'log',
  brief: 'log',
  research: 'log',
  forge: 'forge',
  plan: 'forge',
  spec: 'forge',
  system: 'forge',
})

const DEFAULT_POPUP_TYPE = 'info'
const RUNTIME_VERSION = 2

function nowIso() {
  return new Date().toISOString()
}

function createId(prefix = 'interaction') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().split('-')[0]}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function resolveKind(kind) {
  const normalized = String(kind || '')
    .replace('.', '')
    .trim()
    .toLowerCase()

  return FILE_KIND_ALIASES[normalized] || INTERACTION_FILE_KINDS.chat
}

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? [...value] : [...fallback]
}

function createChatRuntime(initialData = {}) {
  return {
    messages: normalizeArray(initialData.messages),
    draft: initialData.draft || '',
    status: initialData.status || 'idle',
    channel: initialData.channel || 'general',
    model: initialData.model || null,
    notes: initialData.notes || '',
  }
}

function createMotionRuntime(initialData = {}) {
  return {
    prompt: initialData.prompt || '',
    script: initialData.script || '',
    timeline: normalizeArray(initialData.timeline),
    shots: normalizeArray(initialData.shots),
    activeStepId: initialData.activeStepId || null,
    isPlaying: Boolean(initialData.isPlaying),
    progress: Number(initialData.progress) || 0,
    explanation: initialData.explanation || '',
    assets: normalizeArray(initialData.assets),
    render: {
      fps: Number(initialData.render?.fps) || 24,
      durationSec: Number(initialData.render?.durationSec) || 12,
      resolution: initialData.render?.resolution || '1920x1080',
      format: initialData.render?.format || 'mp4',
    },
  }
}

function createCanvasRuntime(initialData = {}) {
  return {
    nodes: normalizeArray(initialData.nodes),
    edges: normalizeArray(initialData.edges),
    viewport: initialData.viewport || { x: 0, y: 0, zoom: 1 },
    selection: normalizeArray(initialData.selection),
    layers: normalizeArray(initialData.layers),
    annotations: normalizeArray(initialData.annotations),
    logicBlocks: normalizeArray(initialData.logicBlocks),
  }
}

function createLogRuntime(initialData = {}) {
  return {
    entries: normalizeArray(initialData.entries),
    pinnedEntryId: initialData.pinnedEntryId || null,
    filter: initialData.filter || 'all',
    tags: normalizeArray(initialData.tags),
    summary: initialData.summary || '',
    references: normalizeArray(initialData.references),
  }
}

function createForgeRuntime(initialData = {}) {
  const defaultMindmapNode = {
    id: createId('mind'),
    label: 'Core idea',
    x: 20,
    y: 30,
    type: 'core',
  }

  return {
    blueprint: initialData.blueprint || '',
    projectScope: initialData.projectScope || '',
    goals: normalizeArray(initialData.goals),
    sections: normalizeArray(initialData.sections),
    tasks: normalizeArray(initialData.tasks).map((task) => ({
      id: task.id || createId('forge-task'),
      title: task.title || 'Untitled task',
      done: Boolean(task.done),
      priority: task.priority || 'normal',
      notes: task.notes || '',
      owner: task.owner || '',
      dueAt: task.dueAt || null,
    })),
    status: initialData.status || 'draft',
    requirements: normalizeArray(initialData.requirements),
    acceptanceCriteria: normalizeArray(initialData.acceptanceCriteria),
    plan: initialData.plan || '',
    docs: normalizeArray(initialData.docs),
    decisions: normalizeArray(initialData.decisions),
    mindmap: {
      nodes: normalizeArray(initialData.mindmap?.nodes, [defaultMindmapNode]),
      edges: normalizeArray(initialData.mindmap?.edges),
    },
    logic: {
      nodes: normalizeArray(initialData.logic?.nodes),
      edges: normalizeArray(initialData.logic?.edges),
    },
  }
}

function createRuntimeByKind(kind, initialData = {}) {
  if (kind === INTERACTION_FILE_KINDS.motion) return createMotionRuntime(initialData)
  if (kind === INTERACTION_FILE_KINDS.canvas) return createCanvasRuntime(initialData)
  if (kind === INTERACTION_FILE_KINDS.log) return createLogRuntime(initialData)
  if (kind === INTERACTION_FILE_KINDS.forge) return createForgeRuntime(initialData)
  return createChatRuntime(initialData)
}

export function parseWorkspaceNotesToRuntime(notes, fileKind) {
  const kind = resolveKind(fileKind)
  const raw = typeof notes === 'string' ? notes.trim() : ''

  if (!raw) return createRuntimeByKind(kind, {})

  if (!raw.startsWith('{') && !raw.startsWith('[')) {
    if (kind === INTERACTION_FILE_KINDS.motion) {
      return createMotionRuntime({ explanation: raw, prompt: raw })
    }
    if (kind === INTERACTION_FILE_KINDS.forge) {
      return createForgeRuntime({ blueprint: raw, projectScope: raw })
    }
    if (kind === INTERACTION_FILE_KINDS.log) {
      return createLogRuntime({ summary: raw })
    }
    return createRuntimeByKind(kind, {})
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.runtime && typeof parsed.runtime === 'object') {
      return createRuntimeByKind(kind, parsed.runtime)
    }
    return createRuntimeByKind(kind, parsed)
  } catch {
    return createRuntimeByKind(kind, {})
  }
}

export function serializeWorkspaceRuntimeToNotes(runtime, fileKind) {
  const kind = resolveKind(fileKind)
  const payload = {
    version: RUNTIME_VERSION,
    kind,
    runtime: cloneValue(runtime || {}),
  }
  return JSON.stringify(payload, null, 2)
}

function createPopup(config = {}) {
  return {
    id: config.id || createId('popup'),
    type: config.type || DEFAULT_POPUP_TYPE,
    title: config.title || 'Danilo signal',
    text: config.text || '',
    actions: normalizeArray(config.actions),
    payload: config.payload || null,
    createdAt: nowIso(),
  }
}

function createObjective(payload = {}) {
  return {
    id: payload.id || createId('objective'),
    title: payload.title || 'Unnamed objective',
    description: payload.description || '',
    status: payload.status || 'pending',
    kind: payload.kind || 'task',
    createdAt: payload.createdAt || nowIso(),
    updatedAt: payload.updatedAt || payload.createdAt || nowIso(),
  }
}

class InteractionEngine {
  constructor() {
    this.state = reactive({
      activeApps: {},
      overlayVisible: false,
      currentStep: null,
      popupStack: [],
      mission: {
        id: null,
        title: '',
        status: 'idle',
        objectives: [],
        hints: [],
        companion: null,
      },
      lastEvent: null,
    })

    this.svgLibrary = new Map()
    this.listeners = new Map()
  }

  getApp(id) {
    return this.state.activeApps[id] || null
  }

  getAllApps() {
    return Object.values(this.state.activeApps)
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName).add(handler)

    return () => {
      this.off(eventName, handler)
    }
  }

  off(eventName, handler) {
    const bucket = this.listeners.get(eventName)
    if (!bucket) return
    bucket.delete(handler)
    if (!bucket.size) this.listeners.delete(eventName)
  }

  emit(eventName, payload = null) {
    this.state.lastEvent = {
      name: eventName,
      payload,
      createdAt: nowIso(),
    }

    const bucket = this.listeners.get(eventName)
    if (!bucket) return
    bucket.forEach((handler) => handler(payload))
  }

  openApp(id, config = {}) {
    const kind = resolveKind(config.kind || config.fileKind || config.type)
    const runtimeData = reactive({
      ...createRuntimeByKind(kind, config.initialData || {}),
      ...config.runtimeData,
    })

    this.state.activeApps[id] = {
      id,
      title: config.title || 'Everest System Utility',
      kind,
      type: kind,
      layout: normalizeArray(config.layout),
      runtimeData,
      validator: typeof config.validator === 'function' ? config.validator : (() => false),
      onComplete: typeof config.onComplete === 'function' ? config.onComplete : (() => {}),
      onClose: typeof config.onClose === 'function' ? config.onClose : (() => {}),
      meta: config.meta || {},
      status: config.status || 'idle',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.state.overlayVisible = true
    this.emit('app:opened', this.state.activeApps[id])
    return this.state.activeApps[id]
  }

  launchWorkspaceFile(file, options = {}) {
    const id = options.id || file.id || createId('workspace')
    return this.openApp(id, {
      title: options.title || file.name || 'Workspace object',
      kind: file.kind,
      layout: options.layout || [],
      initialData: options.initialData || parseWorkspaceNotesToRuntime(file.notes || '', file.kind),
      meta: {
        fileId: file.id || null,
        fileName: file.name || null,
        source: 'incubator-workspace',
        ...options.meta,
      },
      validator: options.validator,
      onComplete: options.onComplete,
      onClose: options.onClose,
    })
  }

  closeApp(id, result = null) {
    const app = this.getApp(id)
    if (!app) return

    app.onClose(result)
    delete this.state.activeApps[id]

    if (!Object.keys(this.state.activeApps).length) {
      this.state.overlayVisible = false
    }

    this.emit('app:closed', { id, result })
  }

  updateData(id, key, value) {
    const app = this.getApp(id)
    if (!app) return

    app.runtimeData[key] = value
    app.updatedAt = nowIso()
    this.checkProgress(id)
    this.emit('app:updated', { id, key, value })
  }

  patchData(id, patch = {}) {
    const app = this.getApp(id)
    if (!app) return

    Object.assign(app.runtimeData, patch)
    app.updatedAt = nowIso()
    this.checkProgress(id)
    this.emit('app:patched', { id, patch })
  }

  replaceLayout(id, layout = []) {
    const app = this.getApp(id)
    if (!app) return
    app.layout = [...layout]
    app.updatedAt = nowIso()
    this.emit('app:layout-updated', { id, layout: app.layout })
  }

  setCurrentStep(step = null) {
    this.state.currentStep = step
    this.emit('step:changed', step)
  }

  checkProgress(id) {
    const app = this.getApp(id)
    if (!app) return false

    if (!app.validator(app.runtimeData, app)) return false

    app.status = 'completed'
    app.updatedAt = nowIso()
    app.onComplete(app.runtimeData)
    this.emit('app:completed', app)
    return true
  }

  openPopup(config = {}) {
    const popup = createPopup(config)
    this.state.popupStack.push(popup)
    this.state.overlayVisible = true
    this.emit('popup:opened', popup)
    return popup
  }

  closePopup(id, result = null) {
    const index = this.state.popupStack.findIndex((popup) => popup.id === id)
    if (index === -1) return
    const [popup] = this.state.popupStack.splice(index, 1)
    this.emit('popup:closed', { popup, result })
  }

  clearPopups() {
    this.state.popupStack = []
    this.emit('popup:cleared')
  }

  appendChatMessage(id, message) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.chat) return

    app.runtimeData.messages.push({
      id: message.id || createId('chat-msg'),
      author: message.author || 'danilo',
      text: message.text || '',
      tone: message.tone || 'signal',
      createdAt: message.createdAt || nowIso(),
      meta: message.meta || {},
    })
    app.updatedAt = nowIso()
    this.emit('chat:message', { id, message: app.runtimeData.messages.at(-1) })
  }

  setChatStatus(id, status) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.chat) return
    app.runtimeData.status = status
    app.updatedAt = nowIso()
    this.emit('chat:status', { id, status })
  }

  queueMotionStep(id, step) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.motion) return

    app.runtimeData.timeline.push({
      id: step.id || createId('motion-step'),
      title: step.title || 'Motion step',
      description: step.description || '',
      status: step.status || 'pending',
      payload: step.payload || null,
    })
    app.updatedAt = nowIso()
    this.emit('motion:queued', { id, step: app.runtimeData.timeline.at(-1) })
  }

  generateMotionTimelineFromScript(id) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.motion) return

    const script = String(app.runtimeData.script || '').split('\n').map((line) => line.trim()).filter(Boolean)
    if (!script.length) return

    app.runtimeData.timeline = script.slice(0, 12).map((line, index) => ({
      id: createId('motion-step'),
      title: `Beat ${index + 1}`,
      description: line,
      status: index === 0 ? 'active' : 'pending',
      payload: { source: 'script' },
    }))
    app.runtimeData.activeStepId = app.runtimeData.timeline[0]?.id || null
    app.updatedAt = nowIso()
    this.emit('motion:timeline-generated', { id, timeline: app.runtimeData.timeline })
  }

  playMotion(id, activeStepId = null) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.motion) return
    app.runtimeData.isPlaying = true
    app.runtimeData.activeStepId = activeStepId || app.runtimeData.activeStepId
    app.updatedAt = nowIso()
    this.emit('motion:play', { id, activeStepId: app.runtimeData.activeStepId })
  }

  pauseMotion(id) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.motion) return
    app.runtimeData.isPlaying = false
    app.updatedAt = nowIso()
    this.emit('motion:pause', { id })
  }

  setMotionExplanation(id, explanation) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.motion) return
    app.runtimeData.explanation = explanation
    app.updatedAt = nowIso()
    this.emit('motion:explanation', { id, explanation })
  }

  setCanvasGraph(id, graph = {}) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.canvas) return
    app.runtimeData.nodes = normalizeArray(graph.nodes)
    app.runtimeData.edges = normalizeArray(graph.edges)
    app.runtimeData.layers = Array.isArray(graph.layers) ? [...graph.layers] : app.runtimeData.layers
    app.updatedAt = nowIso()
    this.emit('canvas:graph', { id, graph: app.runtimeData })
  }

  upsertCanvasNode(id, node) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.canvas) return
    if (!node?.id) return

    const nextNode = { ...node }
    const index = app.runtimeData.nodes.findIndex((item) => item.id === nextNode.id)
    if (index === -1) {
      app.runtimeData.nodes.push(nextNode)
    } else {
      app.runtimeData.nodes[index] = {
        ...app.runtimeData.nodes[index],
        ...nextNode,
      }
    }

    app.updatedAt = nowIso()
    this.emit('canvas:node', { id, node: nextNode })
  }

  appendLogEntry(id, entry) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.log) return

    app.runtimeData.entries.push({
      id: entry.id || createId('log-entry'),
      title: entry.title || '',
      text: entry.text || '',
      tone: entry.tone || 'system',
      tags: normalizeArray(entry.tags),
      createdAt: entry.createdAt || nowIso(),
    })
    app.updatedAt = nowIso()
    this.emit('log:entry', { id, entry: app.runtimeData.entries.at(-1) })
  }

  pinLogEntry(id, entryId) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.log) return
    app.runtimeData.pinnedEntryId = entryId
    app.updatedAt = nowIso()
    this.emit('log:pinned', { id, entryId })
  }

  setForgeBlueprint(id, blueprint) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return
    app.runtimeData.blueprint = blueprint
    app.updatedAt = nowIso()
    this.emit('forge:blueprint', { id, blueprint })
  }

  setForgePlan(id, plan) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return
    app.runtimeData.plan = plan
    app.updatedAt = nowIso()
    this.emit('forge:plan', { id, plan })
  }

  addForgeTask(id, task) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return

    app.runtimeData.tasks.push({
      id: task.id || createId('forge-task'),
      title: task.title || 'Untitled task',
      done: Boolean(task.done),
      priority: task.priority || 'normal',
      notes: task.notes || '',
      owner: task.owner || '',
      dueAt: task.dueAt || null,
    })
    app.updatedAt = nowIso()
    this.emit('forge:task', { id, task: app.runtimeData.tasks.at(-1) })
  }

  toggleForgeTask(id, taskId, done = null) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return
    const task = app.runtimeData.tasks.find((item) => item.id === taskId)
    if (!task) return
    task.done = done === null ? !task.done : Boolean(done)
    app.updatedAt = nowIso()
    this.emit('forge:task-toggled', { id, taskId, done: task.done })
  }

  upsertForgeMindNode(id, node) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return
    if (!node?.id) return
    const index = app.runtimeData.mindmap.nodes.findIndex((item) => item.id === node.id)
    if (index === -1) {
      app.runtimeData.mindmap.nodes.push({ ...node })
    } else {
      app.runtimeData.mindmap.nodes[index] = { ...app.runtimeData.mindmap.nodes[index], ...node }
    }
    app.updatedAt = nowIso()
    this.emit('forge:mindmap-node', { id, node })
  }

  connectForgeMindNodes(id, fromId, toId) {
    const app = this.getApp(id)
    if (!app || app.kind !== INTERACTION_FILE_KINDS.forge) return
    if (!fromId || !toId) return
    const exists = app.runtimeData.mindmap.edges.some((edge) => edge.from === fromId && edge.to === toId)
    if (exists) return
    app.runtimeData.mindmap.edges.push({
      id: createId('mind-edge'),
      from: fromId,
      to: toId,
    })
    app.updatedAt = nowIso()
    this.emit('forge:mindmap-edge', { id, fromId, toId })
  }

  setMission(payload = {}) {
    this.state.mission.id = payload.id || null
    this.state.mission.title = payload.title || ''
    this.state.mission.status = payload.status || 'idle'
    this.state.mission.objectives = Array.isArray(payload.objectives)
      ? payload.objectives.map((item) => createObjective(item))
      : []
    this.state.mission.hints = normalizeArray(payload.hints)
    this.state.mission.companion = payload.companion || null
    this.emit('mission:set', this.state.mission)
  }

  addObjective(payload = {}) {
    const objective = createObjective(payload)
    this.state.mission.objectives.push(objective)
    this.emit('mission:objective-added', objective)
    return objective
  }

  updateObjective(id, patch = {}) {
    const objective = this.state.mission.objectives.find((item) => item.id === id)
    if (!objective) return
    Object.assign(objective, patch, { updatedAt: nowIso() })
    this.emit('mission:objective-updated', objective)
  }

  addHint(text, payload = null) {
    const hint = {
      id: createId('hint'),
      text,
      payload,
      createdAt: nowIso(),
    }
    this.state.mission.hints.push(hint)
    this.emit('mission:hint', hint)
    return hint
  }

  startAnimation(svgSelector, animationId = null) {
    const container = document.querySelector(svgSelector)
    if (!container) return

    const animations = animationId
      ? container.querySelectorAll(`#${animationId}`)
      : container.querySelectorAll('animate, animateTransform, animateMotion')

    animations.forEach((animation) => {
      if (typeof animation.beginElement === 'function') {
        animation.beginElement()
      }
    })
  }

  pauseAnimations(svgSelector) {
    const svg = document.querySelector(svgSelector)
    if (svg && typeof svg.pauseAnimations === 'function') {
      svg.pauseAnimations()
    }
  }

  resumeAnimations(svgSelector) {
    const svg = document.querySelector(svgSelector)
    if (svg && typeof svg.unpauseAnimations === 'function') {
      svg.unpauseAnimations()
    }
  }

  injectNativeAnimation(elementId, params = {}) {
    const target = document.getElementById(elementId)
    if (!target) return

    const svgNamespace = 'http://www.w3.org/2000/svg'
    const animation = document.createElementNS(svgNamespace, 'animate')

    animation.setAttribute('attributeName', params.attribute || 'opacity')
    animation.setAttribute('from', params.from ?? '0')
    animation.setAttribute('to', params.to ?? '1')
    animation.setAttribute('dur', params.dur || '1s')
    animation.setAttribute('begin', 'indefinite')
    animation.setAttribute('fill', 'freeze')

    target.appendChild(animation)
    animation.beginElement()
  }
}

export const interaction = new InteractionEngine()
export const resolveInteractionKind = resolveKind
