<template>
  <EvFamilyForgeEditor
    :runtime-data="runtimeData"
    blueprint-title="System architecture"
    blueprint-placeholder="Describe system boundaries, core modules and responsibilities..."
    plan-title="Integration plan"
    plan-placeholder="Define integration order and compatibility checkpoints..."
    todo-title="System tasks"
    requirements-title="System contracts"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyForgeEditor from '@/components/interactions/EvFamilyForgeEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

