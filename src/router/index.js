import { createRouter, createWebHistory } from 'vue-router'

import LimbusView from '../views/DashboardView.vue'
import AvailableMissionsView from '../views/AvailableMissionsView.vue'
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
      meta: { title: 'Everest OS - Dashboard' },
    },
    {
      path: '/theo-core',
      name: 'theo-core',
      component: TheoCoreView,
      meta: { title: 'Everest OS - Theo Core' },
    },
    {
      path: '/missions',
      name: 'missions',
      component: AvailableMissionsView,
      meta: { title: 'Everest OS - Missions' },
    },
    {
      path: '/advancements',
      name: 'advancements',
      component: AdvancementsView,
      meta: { title: 'Everest OS - Advancements' },
    },
    {
      path: '/stages',
      name: 'stages',
      component: StagesnWorldsView,
      meta: { title: 'Everest OS - Stages & Worlds' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Everest OS'
  next()
})

export default router
