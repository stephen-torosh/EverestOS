<template>
  <EvFamilyLogEditor
    :runtime-data="runtimeData"
    summary-title="Task brief"
    summary-placeholder="Write objective, constraints, deliverable and acceptance..."
    references-title="Support links"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyLogEditor from '@/components/interactions/EvFamilyLogEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

