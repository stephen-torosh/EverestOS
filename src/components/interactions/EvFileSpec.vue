<template>
  <EvFamilyForgeEditor
    :runtime-data="runtimeData"
    blueprint-title="Specification scope"
    blueprint-placeholder="Describe interfaces, limits, and measurable targets..."
    plan-title="Implementation spec"
    plan-placeholder="List modules, contracts, and acceptance gates..."
    todo-title="Spec checklist"
    requirements-title="Spec requirements"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyForgeEditor from '@/components/interactions/EvFamilyForgeEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

