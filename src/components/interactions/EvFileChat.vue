<template>
  <EvFamilyChatEditor
    :runtime-data="runtimeData"
    notes-title="Chat lane directive"
    notes-placeholder="Define the conversation target, expected output and constraints..."
    channels-title="Conversation tracks"
    @patch="$emit('patch', $event)"
    @action="$emit('action', $event)"
  />
</template>
<script setup>
import EvFamilyChatEditor from '@/components/interactions/EvFamilyChatEditor.vue'
defineProps({ runtimeData: { type: Object, default: () => ({}) } })
defineEmits(['patch', 'action'])
</script>

