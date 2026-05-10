<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Type architecture graph"
    annotation-title="TypeScript notes"
    annotation-placeholder="Document interfaces, contracts, and type boundaries..."
    facts-title="Type contracts"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

