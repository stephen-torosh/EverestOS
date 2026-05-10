<template>
  <div class="interaction-window" :class="`is-kind-${resolvedKind}`">
    <component
      :is="activeEditorComponent"
      :runtime-data="runtime"
      @patch="forwardPatch"
      @action="forwardAction"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { workspaceFileEditors } from '@/components/interactions/workspaceFileEditors'
import { resolveInteractionKind } from '@/utils/interactionEngine'

const props = defineProps({
  runtimeData: {
    type: Object,
    default: () => ({}),
  },
  kind: {
    type: String,
    default: 'chat',
  },
})

const emit = defineEmits(['patch', 'action'])

const runtime = computed(() => props.runtimeData || {})
const kindId = computed(() => String(props.kind || 'chat').replace('.', '').toLowerCase())
const resolvedKind = computed(() => resolveInteractionKind(kindId.value))

const activeEditorComponent = computed(() =>
  workspaceFileEditors[kindId.value]
  || workspaceFileEditors[resolvedKind.value]
  || workspaceFileEditors.chat
)

function forwardPatch(patch) {
  emit('patch', patch)
}

function forwardAction(actionId) {
  emit('action', actionId)
}
</script>

<style scoped>
.interaction-window {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.is-kind-motion {
  --dash-accent: #7ad4ff;
}

.is-kind-canvas {
  --dash-accent: #bb9bff;
}

.is-kind-log {
  --dash-accent: #ffd978;
}

.is-kind-forge {
  --dash-accent: #ff8f6e;
}

.is-kind-chat {
  --dash-accent: #4dffb0;
}

.interaction-window :deep(.ev-card) {
  border-color: color-mix(in srgb, var(--dash-accent, var(--accent-color)) 24%, var(--border-color));
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--dash-accent, var(--accent-color)) 12%, transparent),
    color-mix(in srgb, var(--bg-main) 94%, transparent) 38%
  );
}
</style>
