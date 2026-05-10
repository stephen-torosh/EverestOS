const DEFAULT_OLLAMA_BASE_URL = '/api/ollama'
const DEFAULT_WRITER_MODEL = 'gemma4:e2b'
const DEFAULT_CRITIC_MODEL = 'gemma4:e2b'

function resolveEnvValue(key, fallback) {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function getLocalLlmConfig() {
  return {
    baseUrl: resolveEnvValue('VITE_OLLAMA_BASE_URL', DEFAULT_OLLAMA_BASE_URL),
    writerModel: resolveEnvValue('VITE_OLLAMA_WRITER_MODEL', DEFAULT_WRITER_MODEL),
    criticModel: resolveEnvValue('VITE_OLLAMA_CRITIC_MODEL', DEFAULT_CRITIC_MODEL),
  }
}

export function getLocalLlmRuntimeLabel() {
  const config = getLocalLlmConfig()
  return `Ollama · ${config.writerModel} → ${config.criticModel}`
}

function buildProjectContext(project) {
  if (!project) return 'No linked project context.'

  return [
    `Project: ${project.title}`,
    `Class: ${project.shipClass || 'Unknown'}`,
    `Progress: ${project.progress || 0}%`,
    `Summary: ${project.summary || 'No summary.'}`,
    `Brief: ${project.dossier || project.notes || 'No dossier.'}`,
  ].join('\n')
}

function buildConversationWindow(messages) {
  return messages
    .slice(-12)
    .map((message) => ({
      role: message.author === 'stepan' ? 'user' : 'assistant',
      content: message.text,
    }))
}

async function ollamaChat(model, messages) {
  const config = getLocalLlmConfig()
  let response
  try {
    response = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages,
        options: {
          temperature: 0.55,
          num_ctx: 4096,
        },
      }),
    })
  } catch {
    throw new Error(`Cannot reach Ollama at ${config.baseUrl}. Keep 'ollama serve' running and use the local proxy URL.`)
  }

  if (!response.ok) {
    let details = `${response.status} ${response.statusText}`.trim()
    try {
      const payload = await response.json()
      details = payload.error || payload.message || details
    } catch {
      // Keep the HTTP status text when Ollama does not return JSON.
    }
    throw new Error(`Ollama request failed for ${model}: ${details}`)
  }

  const payload = await response.json()
  const content = payload?.message?.content?.trim()
  if (!content) {
    throw new Error(`Ollama returned an empty response for ${model}`)
  }

  return content
}

export async function generateDaniloReplyWithLocalModels({ threadTitle, messages, linkedProject }) {
  const config = getLocalLlmConfig()
  const projectContext = buildProjectContext(linkedProject)
  const conversation = buildConversationWindow(messages)

  const writerDraft = await ollamaChat(config.writerModel, [
    {
      role: 'system',
      content: [
        'You are Danilo, a warm but sharp local AI collaborator inside EverestOS.',
        'Reply in the same language as the user message.',
        'Stay concrete, useful, and brief.',
        'Treat ideas as mission objectives, not generic chat.',
        'Do not mention that you are a model unless asked.',
      ].join(' '),
    },
    {
      role: 'system',
      content: `Thread: ${threadTitle || 'Untitled thread'}\n${projectContext}`,
    },
    ...conversation,
  ])

  const criticReply = await ollamaChat(config.criticModel, [
    {
      role: 'system',
      content: [
        'You are a second-pass reviewer for Danilo.',
        'Rewrite the draft to be clearer, tighter, and more actionable.',
        'Preserve the same language and tone.',
        'Return only the final user-facing reply.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Thread: ${threadTitle || 'Untitled thread'}`,
        projectContext,
        'Conversation excerpt:',
        ...conversation.map((message) => `${message.role}: ${message.content}`),
        '',
        'Draft reply:',
        writerDraft,
      ].join('\n'),
    },
  ])

  return {
    text: criticReply,
    writerModel: config.writerModel,
    criticModel: config.criticModel,
  }
}
