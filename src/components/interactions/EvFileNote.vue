<template>
  <EvFamilyLogEditor
    :runtime-data="runtimeData"
    summary-title="Quick note"
    summary-placeholder="Write the idea, insight, or immediate action..."
    references-title="Attached refs"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyLogEditor from '@/components/interactions/EvFamilyLogEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

