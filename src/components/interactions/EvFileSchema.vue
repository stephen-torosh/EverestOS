<template>
  <EvFamilyCanvasEditor
    :runtime-data="runtimeData"
    graph-title="Schema model graph"
    annotation-title="Schema description"
    annotation-placeholder="Describe entities, keys, constraints and validation..."
    facts-title="Schema fields"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyCanvasEditor from '@/components/interactions/EvFamilyCanvasEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

