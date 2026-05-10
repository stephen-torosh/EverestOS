<template>
  <EvFamilyLogEditor
    :runtime-data="runtimeData"
    summary-title="Journal entry"
    summary-placeholder="Capture what happened, what changed, and what is next..."
    references-title="Artifacts"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyLogEditor from '@/components/interactions/EvFamilyLogEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

