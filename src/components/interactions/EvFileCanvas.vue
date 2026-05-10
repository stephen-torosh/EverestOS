<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Canvas graph"
    annotation-title="Canvas note"
    annotation-placeholder="Capture structure, relationships and layout intent..."
    facts-title="Canvas blocks"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

