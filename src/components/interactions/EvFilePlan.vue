<template>
  <EvFamilyForgeEditor
    :runtime-data="runtimeData"
    blueprint-title="Plan objective"
    blueprint-placeholder="Define planned outcome, scope and key result..."
    plan-title="Phase breakdown"
    plan-placeholder="Phase 1..., Phase 2..."
    todo-title="Plan tasks"
    requirements-title="Plan constraints"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyForgeEditor from '@/components/interactions/EvFamilyForgeEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

