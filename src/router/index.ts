// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'


// Route metadata type
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    allowedRoles?: string[]
    public?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN']
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    
      path: '/verify-login/:email',
      name: 'verify-login',
      component: () => import('../views/VerifyLoginView.vue'),
      props: true,
      meta: { public: true },
      beforeEnter: (to) => {
          // Match registration's simpler verification check
          if (!localStorage.getItem('pendingVerification')) {
              return { name: 'login' }
          }
      }
  


   },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { public: true }
  },
  {
    path: '/verify/:email/:username/:fullName',
    name: 'verify',
    component: () => import('../views/VerifyView.vue'),
    props: true,
    meta: { public: true },
    beforeEnter: (to) => {
      if (!localStorage.getItem('pendingVerification')) {
        return { name: 'register' }
      }
    }
  },
  {
    path: '/admin/users',
    name: 'admin',
    component: () => import('../views/UserView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN']
    }
  },

  // New Teacher Routes

{
  path: '/teacher',
  component: () => import('../components/teacher/TeacherLayout.vue'),
  meta: {
    requiresAuth: true,
    allowedRoles: ['TEACHER', 'ADMIN']
  },
  children: [
    {
      path: '',
      name: 'teacher-dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: 'texts',
      name: 'teacher-texts',
      component: () => import('../views/TextListView.vue')
    },
    {
      path: 'texts/:id',
      name: 'view-text',
      component: () => import('../views/ViewTextView.vue'),
      props: true
    },
    {
      path: 'create',
      name: 'create-text',
      component: () => import('../views/CreateTextView.vue')
    },
    {
      path: 'texts/:id/edit',
      name: 'edit-text',
      component: () => import('@/views/EditTextView.vue'),
      props: true
    }
  ]
},


  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()
  
  // Initialize auth store if needed
  if (!authStore.isAuthenticated) {
    authStore.initialize()
  }

  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublic = to.matched.some(record => record.meta.public)
  
  // Get allowed roles for the route - filter out undefined values
  const allowedRoles = to.matched
    .filter(record => record.meta.allowedRoles)
    .map(record => record.meta.allowedRoles)
    .flat()
    .filter((role): role is string => role !== undefined)

  // Handle public routes
  if (isPublic) {
    // Only redirect from login/register if we have valid authentication
    if (authStore.isAuthenticated && authStore.tokens?.access_token && 
        (to.name === 'login' || to.name === 'register')) {
      return next({ name: 'home' })
    }
    return next()
  }

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Store intended destination
    localStorage.setItem('redirectPath', to.fullPath)
    return next({ name: 'login' })
  }

  // Check session timeout
  if (requiresAuth && !authStore.sessionActive) {
    await authStore.logout()
    return next({ name: 'login' })
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasAccess = authStore.canAccess(allowedRoles)
    if (!hasAccess) {
      return next({ name: 'unauthorized' })
    }
  }

  // Update last activity
  if (authStore.isAuthenticated) {
    authStore.updateLastActivity()
  }

  next()
})

// After navigation completes
router.afterEach(() => {
  // Scroll to top
  window.scrollTo(0, 0)
})

export default router