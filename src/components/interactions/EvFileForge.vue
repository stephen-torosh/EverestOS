<template>
  <EvFamilyForgeEditor
    :runtime-data="runtimeData"
    blueprint-title="Forge blueprint"
    plan-title="Production rollout"
    todo-title="Execution TODO"
    requirements-title="Hard requirements"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyForgeEditor from '@/components/interactions/EvFamilyForgeEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

