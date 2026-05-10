<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Module dependency graph"
    annotation-title="JavaScript notes"
    annotation-placeholder="Document APIs, side effects, and integration points..."
    facts-title="Exported modules"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

