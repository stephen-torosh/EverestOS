<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Entity relationship map"
    annotation-title="Entity profile"
    annotation-placeholder="Describe capabilities, states, and interactions..."
    facts-title="Entity attributes"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

