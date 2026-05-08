import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // 1. СТАН: Всі вузли знань у системі
  const nodes = ref([
    // Рівень 1: Основи
    { id: 'html', label: 'HTML5 Semantic', type: 'core', status: 'mastered', dependsOn: [], xp: 100 },
    { id: 'css', label: 'CSS3 Basics', type: 'core', status: 'mastered', dependsOn: [], xp: 100 },
    
    // Рівень 2: Стилізація та JS
    { id: 'flex', label: 'Flexbox & Grid', type: 'tool', status: 'mastered', dependsOn: ['css'], xp: 200 },
    { id: 'js-base', label: 'JavaScript ES6+', type: 'core', status: 'available', dependsOn: ['html'], xp: 300 },
    
    // Рівень 3: Просунуті технології
    { id: 'animations', label: 'CSS Animations', type: 'design', status: 'available', dependsOn: ['flex'], xp: 150 },
    { id: 'dom', label: 'DOM Manipulation', type: 'core', status: 'locked', dependsOn: ['js-base'], xp: 250 },
    { id: 'async', label: 'Async/Await', type: 'core', status: 'locked', dependsOn: ['js-base'], xp: 400 },
    
    // Рівень 4: Фреймворки та Інструменти
    { id: 'vue-core', label: 'Vue.js Options API', type: 'framework', status: 'locked', dependsOn: ['dom'], xp: 500 },
    { id: 'git', label: 'Git & GitHub', type: 'tool', status: 'available', dependsOn: ['html'], xp: 200 },
    
    // Рівень 5: Архітектура
    { id: 'pinia', label: 'State Management (Pinia)', type: 'framework', status: 'locked', dependsOn: ['vue-core'], xp: 350 },
    { id: 'vite', label: 'Build Tools (Vite)', type: 'tool', status: 'locked', dependsOn: ['vue-core', 'git'], xp: 250 },
    { id: 'deploy', label: 'Deployment (Vercel)', type: 'tool', status: 'locked', dependsOn: ['vite'], xp: 300 }
  ])

  // 2. ГЕТЕРИ (Computed)
  
  // Повертає дерево для конкретного світу (локальне)
  const getWorldNodes = computed(() => (worldId) => {
    return nodes.value.filter(node => node.worldId === worldId)
  })

  // Загальний прогрес учня (у відсотках)
  const totalProgress = computed(() => {
    const mastered = nodes.value.filter(n => n.status === 'mastered').length
    return Math.round((mastered / nodes.value.length) * 100)
  })

  // Профіль за типами (наприклад, скільки core, скільки tools)
  const skillProfile = computed(() => {
    return nodes.value.reduce((acc, node) => {
      if (node.status === 'mastered') {
        acc[node.type] = (acc[node.type] || 0) + node.xp
      }
      return acc
    }, {})
  })

  // 3. ДІЇ (Actions)

  // Оновити статус вузла (наприклад, після завершення місії)
  function completeNode(nodeId) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) {
      console.error(`Knowledge node not found: ${nodeId}`)
      return
    }
    if (node.status === 'mastered') return

    node.status = 'mastered'
    useUserStore().recordKnowledgeMastered(node)
    unlockNextNodes(nodeId)
  }

  // Логіка розблокування наступних кроків
  function unlockNextNodes(completedId) {
    nodes.value.forEach(node => {
      if (node.dependsOn.includes(completedId)) {
        // Якщо всі залежності виконані — робимо вузол доступним
        const allDepsDone = node.dependsOn.every(depId => 
          nodes.value.find(n => n.id === depId)?.status === 'mastered'
        )
        if (allDepsDone && node.status === 'locked') {
          node.status = 'available'
          useUserStore().recordKnowledgeUnlocked(node)
        }
      }
    })
  }

  return { 
    nodes, 
    getWorldNodes, 
    totalProgress, 
    skillProfile, 
    completeNode 
  }
})
