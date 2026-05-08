<template>
    <h1>{{ systemStore.t('menu.dashboard') }}</h1>
</template>

<script setup>
import { useSystemStore } from '@/stores/systemStore'
const systemStore = useSystemStore()
</script>