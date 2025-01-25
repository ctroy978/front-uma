// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/verify/:email/:username/:fullName',  // Add fullName param
    name: 'verify',
    component: () => import('../views/VerifyView.vue'),
    props: true,
    beforeEnter: (from) => {
      if (from.name !== 'register' && !localStorage.getItem('pendingVerification')) {
        return { name: 'register' }
      }
    }
},
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = localStorage.getItem('token')
  if (isAuthenticated && (to.name === 'register' || to.name === 'verify')) {
    return { name: 'home' }
  }
})

export default router