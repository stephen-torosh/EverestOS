import { createRouter, createWebHistory } from 'vue-router'

import LimbusView from '../views/DashboardView.vue'
import AvailableMissionsView from '../views/MissionsView.vue'
import TheoCoreView from '../views/TheoCoreView.vue' // TEO Core
import AdvancementsView from '../views/AdvancementsView.vue'
import StagesnWorldsView from '../views/Stages&WorldsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'limbus',
      component: LimbusView,
      meta: { title: 'menu.dashboard' },
    },
    {
      path: '/theo-core',
      name: 'theo-core',
      component: TheoCoreView,
      meta: { title: 'menu.operations' },
    },
    {
      path: '/missions',
      name: 'missions',
      component: AvailableMissionsView,
      meta: { title: 'menu.missions' },
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: AdvancementsView,
      meta: { title: 'menu.advancements' },
    },
    {
      path: '/stages',
      name: 'stages',
      component: StagesnWorldsView,
      meta: { title: 'menu.stages' },
    },
  ],
})

import { useSystemStore } from '@/stores/systemStore'

router.beforeEach((to, from, next) => {
  const systemStore = useSystemStore()
  const titleKey = to.meta?.title
  if (titleKey) document.title = `Everest OS - ${systemStore.t(titleKey)}`
  else document.title = 'Everest OS'
  next()
})

export default router
