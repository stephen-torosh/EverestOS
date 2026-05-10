<template>
  <EvFamilyLogEditor
    :runtime-data="runtimeData"
    summary-title="Research synthesis"
    summary-placeholder="Summarize findings, hypotheses and confidence..."
    references-title="Sources"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyLogEditor from '@/components/interactions/EvFamilyLogEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

