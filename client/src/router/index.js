import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/PageTable.vue')
    },
    {
      path: '/package',
      name: 'package',
      component: () => import('@/pages/PagePackage.vue')
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/pages/PageSchedule.vue')
    },
    {
      path: '/document',
      name: 'document',
      component: () => import('@/pages/PageDocument.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/pages/404.vue')
    },
  ]
})

export default router
