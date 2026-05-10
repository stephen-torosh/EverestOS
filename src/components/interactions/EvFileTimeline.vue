<template>
  <EvFamilyMotionEditor
    :runtime-data="runtimeData"
    prompt-title="Timeline intent"
    script-title="Beat sequence"
    script-placeholder="00:00 Intro beat&#10;00:06 Transition beat"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyMotionEditor from '@/components/interactions/EvFamilyMotionEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

