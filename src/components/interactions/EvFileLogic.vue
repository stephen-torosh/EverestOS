<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Logic graph"
    annotation-title="Logic rules"
    annotation-placeholder="Define transitions, conditions and rule priorities..."
    facts-title="Rule blocks"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

