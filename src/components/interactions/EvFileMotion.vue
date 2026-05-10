<template>
  <EvFamilyMotionEditor
    :runtime-data="runtimeData"
    prompt-title="Motion direction"
    script-title="Animation choreography"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyMotionEditor from '@/components/interactions/EvFamilyMotionEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

