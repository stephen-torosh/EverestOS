<template>
  <EvFamilyMotionEditor
    :runtime-data="runtimeData"
    prompt-title="Storyboard concept"
    script-title="Shot list"
    script-placeholder="Shot 1: ...&#10;Shot 2: ..."
    svg-title="Frame board (SVG)"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyMotionEditor from '@/components/interactions/EvFamilyMotionEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

