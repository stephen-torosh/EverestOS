<template>
  <div class="achievements-page">
    <!-- Контейнер для графа -->
    <div class="graph-wrapper">
      <KnowledgeGraph :nodesData="knowledgeStore.nodes" />
    </div>
  </div>
</template>

<script setup>
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'

const knowledgeStore = useKnowledgeStore()
</script>

<style scoped>
.achievements-page {
  /* Сторінка займає всю висоту в’юпорту */
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* Відступ зліва, щоб не перекривати сайдбар */
  box-sizing: border-box;
  overflow: hidden; /* Щоб сама сторінка не скролилась, тільки граф */
}

.graph-wrapper {
  /* Це змушує контейнер зайняти весь вільний простір знизу */
  flex-grow: 1;
  width: 100%;
  background: var(--bg-sidebar);
  overflow: hidden;
  position: relative;
}
</style>