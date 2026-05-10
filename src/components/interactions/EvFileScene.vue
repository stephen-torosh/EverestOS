<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Scene graph"
    annotation-title="Scene description"
    annotation-placeholder="Describe camera, objects, lighting and atmosphere..."
    facts-title="Scene entities"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

