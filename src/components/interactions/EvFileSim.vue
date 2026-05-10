<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Simulation flow"
    annotation-title="Simulation rules"
    annotation-placeholder="Document parameters, constraints, and expected outputs..."
    facts-title="Simulation parameters"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

