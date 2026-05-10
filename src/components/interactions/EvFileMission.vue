<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Mission state machine"
    annotation-title="Mission objective logic"
    annotation-placeholder="Describe objective flow, fail states and win conditions..."
    facts-title="Mission checkpoints"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

