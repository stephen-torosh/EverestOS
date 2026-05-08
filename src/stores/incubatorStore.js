import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEYS = {
  activeSection: 'everest.incubator.activeSection',
  activeThread: 'everest.incubator.activeThread',
  activeProject: 'everest.incubator.activeProject',
  threads: 'everest.incubator.threads',
  projects: 'everest.incubator.projects',
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJsonStorage(key, fallback) {
  if (!canUseStorage()) return fallback

  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
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

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().split('-')[0]}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

function resolveProjectStage(progress) {
  if (progress >= 85) return 'launch'
  if (progress >= 60) return 'prototype'
  if (progress >= 30) return 'build'
  return 'idea'
}

function createDefaultFiles(projectId, projectTitle = 'Project') {
  const timestamp = '2050-03-12T09:00:00.000Z'

  return [
    {
      id: `${projectId}-brief`,
      name: `${projectTitle} brief`,
      kind: 'brief',
      status: 'linked',
      notes: 'Короткий опис ідеї, контекст задачі та головний напрямок розвитку.',
      updatedAt: timestamp,
    },
    {
      id: `${projectId}-notes`,
      name: `${projectTitle} notes`,
      kind: 'note',
      status: 'draft',
      notes: 'Швидкі нотатки, чернетки рішень і питання до наступної ітерації.',
      updatedAt: timestamp,
    },
  ]
}

function normalizeThread(thread) {
  return {
    id: thread.id || createId('thread'),
    title: thread.title || 'New thread',
    channel: thread.channel || 'Fresh signal',
    summary: thread.summary || 'Приватна лінія для швидких думок і контекстних рішень.',
    linkedProjectId: thread.linkedProjectId || null,
    unread: Number(thread.unread) || 0,
    updatedAt: thread.updatedAt || new Date().toISOString(),
    messages: Array.isArray(thread.messages)
      ? thread.messages.map((message) => ({
          id: message.id || createId('msg'),
          author: message.author || 'danilo',
          tone: message.tone || 'signal',
          createdAt: message.createdAt || new Date().toISOString(),
          text: message.text || '',
        }))
      : [],
  }
}

function normalizeProject(project) {
  const progress = clampProgress(project.progress)
  const title = project.title || 'Untitled Project'

  return {
    id: project.id || createId('project'),
    title,
    shipClass: project.shipClass || 'Concept Vessel',
    progress,
    stage: project.stage || resolveProjectStage(progress),
    summary: project.summary || 'Нова задумка в інкубаторі.',
    dossier: project.dossier || 'Робоча зона для синтезу ідей, обговорень та майбутніх рішень.',
    linkedThreadId: project.linkedThreadId || null,
    updatedAt: project.updatedAt || new Date().toISOString(),
    milestones: Array.isArray(project.milestones) ? project.milestones : [],
    achievements: Array.isArray(project.achievements) ? project.achievements : [],
    files: Array.isArray(project.files) && project.files.length
      ? project.files.map((file) => ({
          id: file.id || createId('file'),
          name: file.name || 'Untitled file',
          kind: file.kind || 'note',
          status: file.status || 'draft',
          notes: file.notes || '',
          updatedAt: file.updatedAt || project.updatedAt || new Date().toISOString(),
        }))
      : createDefaultFiles(project.id || createId('project-file'), title),
  }
}

function createSeedThreads() {
  return [
    {
      id: 'thread-mars-systems',
      title: 'Питання по Марсу',
      channel: 'Research relay',
      summary: 'Окрема зашифрована лінія для колоній Марса, купольних систем і тераформінгу.',
      linkedProjectId: 'project-mars-lattice',
      unread: 2,
      updatedAt: '2050-03-18T09:44:00.000Z',
      messages: [
        {
          id: 'msg-mars-1',
          author: 'danilo',
          tone: 'signal',
          createdAt: '2050-03-18T09:12:00.000Z',
          text:
            'Степане, я звірив марсіанські вузли з новою картою SWSM. Valles Station виглядає ідеальним опорним ребром для модульної тепличної сітки.',
        },
        {
          id: 'msg-mars-2',
          author: 'stepan',
          tone: 'operator',
          createdAt: '2050-03-18T09:27:00.000Z',
          text:
            'Тоді треба думати не про один купол, а про цілий рістер з блоків: житло, вода, біоферми й транспорт.',
        },
        {
          id: 'msg-mars-3',
          author: 'danilo',
          tone: 'signal',
          createdAt: '2050-03-18T09:44:00.000Z',
          text:
            'Зафіксував. Якщо зшити це з льодовим фронтом, колонія отримає природний буфер води й палива без повернення до земної логістики.',
        },
      ],
    },
    {
      id: 'thread-engine-physics',
      title: 'Фізика двигунів',
      channel: 'Workshop line',
      summary: 'Чернетки по тязі, маневрових схемах і візуальному реалізму для майбутніх місій.',
      linkedProjectId: 'project-vector-engine',
      unread: 0,
      updatedAt: '2050-03-17T18:20:00.000Z',
      messages: [
        {
          id: 'msg-engine-1',
          author: 'stepan',
          tone: 'operator',
          createdAt: '2050-03-17T17:48:00.000Z',
          text:
            'Хочу, щоб поведінка двигуна відчувалась правдоподібно, але не перетворювалася на сухий симулятор для вузьких фанатів.',
        },
        {
          id: 'msg-engine-2',
          author: 'danilo',
          tone: 'signal',
          createdAt: '2050-03-17T18:20:00.000Z',
          text:
            'Тоді ціль - керований realism. Базова модель може бути легкою, а глибокі параметри ховати у верфі як інженерний режим.',
        },
      ],
    },
    {
      id: 'thread-personal-thoughts',
      title: 'Особисті думки',
      channel: 'Quiet notebook',
      summary: 'Приватний записник на льоту: образи, інсайти, особисті формули стилю й бренду.',
      linkedProjectId: 'project-danilo-presence',
      unread: 1,
      updatedAt: '2050-03-16T23:18:00.000Z',
      messages: [
        {
          id: 'msg-thoughts-1',
          author: 'danilo',
          tone: 'memory',
          createdAt: '2050-03-16T22:54:00.000Z',
          text:
            'Нотатка для тебе: твій стиль працює найсильніше там, де складні системи подані як щось живе, а не просто технічне.',
        },
        {
          id: 'msg-thoughts-2',
          author: 'stepan',
          tone: 'operator',
          createdAt: '2050-03-16T23:18:00.000Z',
          text:
            'Так, я хочу, щоб EverestOS відчувався не як панель, а як цілий світ зі своїм тоном і характером.',
        },
      ],
    },
    {
      id: 'thread-sector-seven',
      title: 'Сонячні панелі • Сектор 7',
      channel: 'Recovered archive',
      summary: 'Локальний тред по старих кресленнях, енергетичних масивах і способах подати це у геймплеї.',
      linkedProjectId: 'project-commander-dossier',
      unread: 0,
      updatedAt: '2050-03-15T14:05:00.000Z',
      messages: [
        {
          id: 'msg-sector-1',
          author: 'danilo',
          tone: 'signal',
          createdAt: '2050-03-15T13:34:00.000Z',
          text:
            'Степане, пам’ятаєш, ми вчора думали про сонячні панелі в Секторі 7? Я підтягнув старі креслення з архіву земної орбіти.',
        },
        {
          id: 'msg-sector-2',
          author: 'stepan',
          tone: 'operator',
          createdAt: '2050-03-15T14:05:00.000Z',
          text:
            'Супер. Це може стати хорошим кейсом для портфоліо: як ігровий вузол перетворюється на частину особистого бренду.',
        },
      ],
    },
  ]
}

function createSeedProjects() {
  return [
    {
      id: 'project-mars-lattice',
      title: 'Mars Lattice',
      shipClass: 'Terraform Constructor',
      progress: 58,
      stage: 'build',
      summary:
        'Модульна мережа куполів, біоферм і транспортних коридорів для марсіанської колонії нового покоління.',
      dossier:
        'Ідея в тому, щоб будувати Марс не як одне місто, а як гнучкий живий каркас. Кожен блок може рости незалежно, але зчитується як частина великої системи.',
      linkedThreadId: 'thread-mars-systems',
      updatedAt: '2050-03-18T09:44:00.000Z',
      milestones: [
        'Схема купольних хребтів для Valles Station',
        'Вузол біосфер, що замикає воду і кисень у локальний цикл',
        'Транспортні спиці між житлом, льодовими буровими та верфями Фобоса',
      ],
      achievements: [
        'Має чітке місце всередині SWSM',
        'Поєднує геймплей, візуал і світобудову',
        'Може стати серцевиною для кількох місій і статей портфоліо',
      ],
      files: [
        {
          id: 'mars-layout',
          name: 'mars-lattice-layout.sketch',
          kind: 'spec',
          status: 'linked',
          notes: 'Схема модулів, купольних ребер і транспортних спиць.',
          updatedAt: '2050-03-18T09:40:00.000Z',
        },
        {
          id: 'mars-brief',
          name: 'terraform-brief.md',
          kind: 'brief',
          status: 'draft',
          notes: 'Бриф по колонії, логістиці та автономності ресурсів.',
          updatedAt: '2050-03-17T20:10:00.000Z',
        },
      ],
    },
    {
      id: 'project-vector-engine',
      title: 'Vector Engine Lab',
      shipClass: 'Physics Testbed',
      progress: 34,
      stage: 'build',
      summary:
        'Лабораторія фізики рушіїв і маневрування для систем, які мають бути правдоподібними, але не перевантаженими.',
      dossier:
        'Проєкт досліджує баланс між відчуттям справжнього космосу і хорошим UX. Основна ціль - дати гравцеві силу й точність без інженерної бюрократії.',
      linkedThreadId: 'thread-engine-physics',
      updatedAt: '2050-03-17T18:20:00.000Z',
      milestones: [
        'Визначити базову модель тяги й інерції',
        'Побудувати версію з м’якими assist-системами',
        'Зв’язати технічні параметри з візуальним фідбеком корабля',
      ],
      achievements: [
        'Потенціал для окремого технічного демо',
        'Може стати основою для місій глибокого космосу',
      ],
      files: [
        {
          id: 'engine-spec',
          name: 'engine-balance-spec.txt',
          kind: 'spec',
          status: 'draft',
          notes: 'Базові параметри тяги, assist-шар і контроль інерції.',
          updatedAt: '2050-03-17T18:18:00.000Z',
        },
      ],
    },
    {
      id: 'project-commander-dossier',
      title: 'Commander Dossier',
      shipClass: 'Personal Brand Vessel',
      progress: 82,
      stage: 'prototype',
      summary:
        'Експортований журнал досягнень і сильних системних рішень, який можна показувати як портфоліо командора.',
      dossier:
        'Це не просто резюме. Це curated narrative про те, як ти мислиш: від архітектури інтерфейсів до побудови цілих цифрових світів і творчого процесу з Данилом.',
      linkedThreadId: 'thread-sector-seven',
      updatedAt: '2050-03-15T14:05:00.000Z',
      milestones: [
        'Зібрати сильні кейси з Profile, Stages&Worlds та Incubator',
        'Перетворити сухі feature-списки на історію розвитку системи',
        'Підготувати експортований формат для інших середовищ',
      ],
      achievements: [
        'Вже має зрозумілий narrative',
        'Може працювати як CV, case study і особистий manifesto',
      ],
      files: [
        {
          id: 'dossier-cv',
          name: 'commander-resume.txt',
          kind: 'brief',
          status: 'linked',
          notes: 'Коротка версія портфоліо для зовнішнього експорту.',
          updatedAt: '2050-03-15T14:04:00.000Z',
        },
      ],
    },
    {
      id: 'project-danilo-presence',
      title: 'Danilo Presence Rig',
      shipClass: 'Companion Interface',
      progress: 69,
      stage: 'prototype',
      summary:
        'Система присутності Данила як живого асистента з тілом, емоціями, реакціями та окремими режимами спілкування.',
      dossier:
        'Ідея полягає в тому, щоб Данило був не просто кнопкою. Він має жити в просторі інтерфейсу, розуміти контекст і реагувати так, ніби він справжній член екіпажу.',
      linkedThreadId: 'thread-personal-thoughts',
      updatedAt: '2050-03-16T23:18:00.000Z',
      milestones: [
        'Визначити позицію Данила в оболонці UI',
        'Побудувати набір емоційних станів і мікроанімацій',
        'Прив’язати чати, нотатки і контекстні підказки до його присутності',
      ],
      achievements: [
        'Працює як фірмовий елемент бренду EverestOS',
        'Пов’язує UI, narrative і AI в один образ',
      ],
      files: [
        {
          id: 'danilo-rig',
          name: 'danilo-presence-rig.ai',
          kind: 'asset',
          status: 'draft',
          notes: 'Ескізи аватара, реакцій і положень у sidebar / chat view.',
          updatedAt: '2050-03-16T22:40:00.000Z',
        },
      ],
    },
  ]
}

function buildDaniloReply(message, project) {
  const normalized = message.toLowerCase()
  const fragments = []

  if (normalized.includes('марс')) {
    fragments.push('Якщо це йде у Марс, я б одразу прив’язував ідею до Valles Station та крижаного фронту.')
  }

  if (normalized.includes('двиг') || normalized.includes('тяг') || normalized.includes('physics')) {
    fragments.push('Для рушіїв тримай курс на керований реалізм: сильне відчуття маси, але без зайвої бюрократії для гравця.')
  }

  if (normalized.includes('бренд') || normalized.includes('портфолі') || normalized.includes('резюме')) {
    fragments.push('Це звучить як матеріал для Commander Dossier: покажи не лише результат, а й спосіб мислення.')
  }

  if (normalized.includes('данил') || normalized.includes('аватар')) {
    fragments.push('Якщо це про мою присутність, то я б тримав баланс між живим характером і чистим функціональним UX.')
  }

  if (project) {
    fragments.push(`Прив’язав думку до проєкту "${project.title}" - вона вже не загубиться.`)
  }

  if (!fragments.length) {
    fragments.push('Прийняв сигнал. Це виглядає як хороша ідея для окремого експерименту або нового бортового модуля.')
  }

  return fragments.join(' ')
}

export const useIncubatorStore = defineStore('incubator', () => {
  const threads = ref(readJsonStorage(STORAGE_KEYS.threads, cloneValue(createSeedThreads())).map(normalizeThread))
  const projects = ref(readJsonStorage(STORAGE_KEYS.projects, cloneValue(createSeedProjects())).map(normalizeProject))

  if (!threads.value.length) threads.value = cloneValue(createSeedThreads()).map(normalizeThread)
  if (!projects.value.length) projects.value = cloneValue(createSeedProjects()).map(normalizeProject)

  const activeSection = ref(readStringStorage(STORAGE_KEYS.activeSection, 'comms'))
  const activeThreadId = ref(readStringStorage(STORAGE_KEYS.activeThread, threads.value[0]?.id || ''))
  const activeProjectId = ref(readStringStorage(STORAGE_KEYS.activeProject, projects.value[0]?.id || ''))

  function ensureSelection() {
    if (!threads.value.some((thread) => thread.id === activeThreadId.value)) {
      activeThreadId.value = threads.value[0]?.id || ''
    }

    if (!projects.value.some((project) => project.id === activeProjectId.value)) {
      activeProjectId.value = projects.value[0]?.id || ''
    }
  }

  ensureSelection()

  const sortedThreads = computed(() => {
    return [...threads.value].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
  })

  const sortedProjects = computed(() => {
    return [...projects.value].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
  })

  const activeThread = computed(() => {
    return sortedThreads.value.find((thread) => thread.id === activeThreadId.value) || null
  })

  const activeProject = computed(() => {
    return sortedProjects.value.find((project) => project.id === activeProjectId.value) || null
  })

  function setActiveSection(section) {
    activeSection.value = section
  }

  function selectThread(threadId) {
    if (!threads.value.some((thread) => thread.id === threadId)) return

    activeThreadId.value = threadId
    threads.value = threads.value.map((thread) =>
      thread.id === threadId ? { ...thread, unread: 0 } : thread
    )
  }

  function selectProject(projectId) {
    if (!projects.value.some((project) => project.id === projectId)) return
    activeProjectId.value = projectId
  }

  function createThread(title, options = {}) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return null

    const now = new Date().toISOString()
    const newThread = normalizeThread({
      id: createId('thread'),
      title: trimmedTitle,
      channel: options.channel || 'Fresh signal',
      summary: options.summary || 'Нова приватна лінія для швидких думок, рішень і зшивання ідей у проєкти.',
      linkedProjectId: options.linkedProjectId || null,
      unread: 0,
      updatedAt: now,
      messages: [
        {
          id: createId('msg'),
          author: 'danilo',
          tone: 'signal',
          createdAt: now,
          text: options.initialMessage || 'Канал відкрито. Я на лінії - кидай сюди сирі думки, а я допоможу зібрати їх у щось сильне.',
        },
      ],
    })

    threads.value = [newThread, ...threads.value]
    activeThreadId.value = newThread.id
    if (options.activateSection !== false) {
      activeSection.value = 'comms'
    }
    return newThread.id
  }

  function appendMessage(threadId, message) {
    threads.value = threads.value.map((thread) => {
      if (thread.id !== threadId) return thread

      return {
        ...thread,
        updatedAt: message.createdAt,
        unread:
          message.author === 'danilo' && activeThreadId.value !== threadId ? (thread.unread || 0) + 1 : thread.unread,
        messages: [...thread.messages, message],
      }
    })
  }

  function sendMessage(text, targetThreadId = activeThreadId.value) {
    const trimmedText = text.trim()
    if (!trimmedText) return false

    const targetThread = threads.value.find((thread) => thread.id === targetThreadId)
    if (!targetThread) return false

    const now = new Date()
    const operatorMessage = {
      id: createId('msg'),
      author: 'stepan',
      tone: 'operator',
      createdAt: now.toISOString(),
      text: trimmedText,
    }

    appendMessage(targetThreadId, operatorMessage)

    const linkedProject =
      projects.value.find((project) => project.id === targetThread.linkedProjectId) || null

    appendMessage(targetThreadId, {
      id: createId('msg'),
      author: 'danilo',
      tone: linkedProject ? 'signal' : 'memory',
      createdAt: new Date(now.getTime() + 900).toISOString(),
      text: buildDaniloReply(trimmedText, linkedProject),
    })

    return true
  }

  function ensureProjectThread(projectId) {
    const project = projects.value.find((item) => item.id === projectId)
    if (!project) return null

    if (project.linkedThreadId && threads.value.some((thread) => thread.id === project.linkedThreadId)) {
      return project.linkedThreadId
    }

    const threadId = createThread(project.title, {
      linkedProjectId: project.id,
      channel: 'Project thread',
      summary: `Робоча гілка для проєкту "${project.title}" - рішення, нотатки та короткі синки з Данилом.`,
      initialMessage: `Відкрив окремий тред для "${project.title}". Тут можна вести обговорення, не змішуючи його з іншими сигналами.`,
      activateSection: false,
    })

    if (!threadId) return null

    projects.value = projects.value.map((item) =>
      item.id === project.id
        ? {
            ...item,
            linkedThreadId: threadId,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    threads.value = threads.value.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            linkedProjectId: project.id,
          }
        : thread
    )

    return threadId
  }

  function updateProject(projectId, patch) {
    const now = new Date().toISOString()

    projects.value = projects.value.map((project) => {
      if (project.id !== projectId) return project

      const nextProgress = Object.prototype.hasOwnProperty.call(patch, 'progress')
        ? clampProgress(patch.progress)
        : project.progress

      return normalizeProject({
        ...project,
        ...patch,
        progress: nextProgress,
        stage: resolveProjectStage(nextProgress),
        updatedAt: now,
      })
    })
  }

  function addProjectFile(projectId) {
    const now = new Date().toISOString()

    projects.value = projects.value.map((project) => {
      if (project.id !== projectId) return project

      return {
        ...project,
        updatedAt: now,
        files: [
          {
            id: createId('file'),
            name: 'untitled-file.txt',
            kind: 'note',
            status: 'draft',
            notes: '',
            updatedAt: now,
          },
          ...project.files,
        ],
      }
    })
  }

  function updateProjectFile(projectId, fileId, patch) {
    const now = new Date().toISOString()

    projects.value = projects.value.map((project) => {
      if (project.id !== projectId) return project

      return {
        ...project,
        updatedAt: now,
        files: project.files.map((file) =>
          file.id === fileId
            ? {
                ...file,
                ...patch,
                updatedAt: now,
              }
            : file
        ),
      }
    })
  }

  function openProjectThread(projectId) {
    const threadId = ensureProjectThread(projectId)
    if (!threadId) return

    activeProjectId.value = projectId
    activeSection.value = 'comms'
    selectThread(threadId)
  }

  function advanceProject(projectId) {
    const project = projects.value.find((item) => item.id === projectId)
    if (!project) return false

    const nextProgress = Math.min(100, project.progress + 8)
    updateProject(projectId, { progress: nextProgress })

    const threadId = ensureProjectThread(projectId)
    if (threadId) {
      appendMessage(threadId, {
        id: createId('msg'),
        author: 'danilo',
        tone: 'signal',
        createdAt: new Date().toISOString(),
        text: `Оновив проєкт "${project.title}" до ${nextProgress}%. Каркас росте стабільно - можна переходити до наступного монтажного вузла.`,
      })
    }

    activeProjectId.value = projectId
    return true
  }

  watch(
    threads,
    (value) => {
      writeJsonStorage(STORAGE_KEYS.threads, value)
    },
    { deep: true }
  )

  watch(
    projects,
    (value) => {
      writeJsonStorage(STORAGE_KEYS.projects, value)
    },
    { deep: true }
  )

  watch(activeSection, (value) => {
    writeStringStorage(STORAGE_KEYS.activeSection, value)
  })

  watch(activeThreadId, (value) => {
    writeStringStorage(STORAGE_KEYS.activeThread, value)
  })

  watch(activeProjectId, (value) => {
    writeStringStorage(STORAGE_KEYS.activeProject, value)
  })

  return {
    threads,
    projects,
    activeSection,
    activeThreadId,
    activeProjectId,
    sortedThreads,
    sortedProjects,
    activeThread,
    activeProject,
    setActiveSection,
    selectThread,
    selectProject,
    createThread,
    sendMessage,
    ensureProjectThread,
    updateProject,
    addProjectFile,
    updateProjectFile,
    openProjectThread,
    advanceProject,
  }
})
