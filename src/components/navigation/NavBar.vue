<!-- NavBar.vue -->
<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo Section -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link 
              :to="{ name: isAuthenticated ? 'home' : 'login' }" 
              class="text-blue-600 text-2xl font-bold"
            >
              uMa
            </router-link>
          </div>

          <!-- Desktop Navigation Links - Shown when authenticated -->
          <div v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <router-link
              v-if="canAccessStudent"
              :to="{ name: 'student-dashboard' }"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Student Portal
            </router-link>

            <router-link
              v-if="canAccessTeacher"
              :to="{ name: 'teacher-dashboard' }"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Teacher Portal
            </router-link>

            <router-link
              v-if="canAccessAdmin"
              :to="{ name: 'admin' }"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Admin Portal
            </router-link>

            <!-- Admin Links - Dropdown with better hover handling -->
            <div v-if="canAccessAdmin" class="relative inline-block text-left">
              <button 
                @mouseenter="showAdminDropdown = true"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
              >
                Admin Tools
                <svg class="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div 
                v-if="showAdminDropdown" 
                @mouseleave="showAdminDropdown = false"
                @mouseenter="showAdminDropdown = true"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <div class="py-1">
                  <router-link
                    :to="{ name: 'admin-whitelist' }"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Email Whitelist
                  </router-link>
                  <router-link
                    :to="{ name: 'admin-database' }"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Database Management
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Right Side Menu -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Auth Links -->
          <template v-if="!isAuthenticated">
            <router-link 
              :to="{ name: 'login' }" 
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Login
            </router-link>
            <router-link 
              :to="{ name: 'register' }" 
              class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Register
            </router-link>
          </template>

          <template v-else>
            <!-- User Info & Logout -->
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">{{ userRole }}</span>
              <button
                @click="handleLogout"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <span class="sr-only">Open main menu</span>
            <svg 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                v-if="!isMobileMenuOpen" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path 
                v-else 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div 
      v-if="isMobileMenuOpen" 
      class="sm:hidden"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <!-- Mobile Navigation Links - Shown when authenticated -->
        <template v-if="isAuthenticated">
          <router-link
            v-if="canAccessStudent"
            :to="{ name: 'student-dashboard' }"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            active-class="bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            Student Portal
          </router-link>

          <router-link
            v-if="canAccessTeacher"
            :to="{ name: 'teacher-dashboard' }"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            active-class="bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            Teacher Portal
          </router-link>

          <router-link
            v-if="canAccessAdmin"
            :to="{ name: 'admin' }"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            active-class="bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            Admin Portal
          </router-link>

          <!-- Admin Tools Section in Mobile -->
          <div v-if="canAccessAdmin" class="pt-2 pb-1">
            <div class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Tools
            </div>
            <router-link
              :to="{ name: 'admin-whitelist' }"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
              @click="isMobileMenuOpen = false"
            >
              Email Whitelist
            </router-link>
            <router-link
              :to="{ name: 'admin-database' }"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
              @click="isMobileMenuOpen = false"
            >
              Database Management
            </router-link>
          </div>

          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Logout
          </button>
        </template>

        <!-- Mobile Auth Links - Shown when NOT authenticated -->
        <template v-else>
          <router-link 
            :to="{ name: 'login' }" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            active-class="bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            Login
          </router-link>
          <router-link 
            :to="{ name: 'register' }" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            active-class="bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            Register
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const showAdminDropdown = ref(false)

// Authentication state
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Role-based access computed properties
const canAccessStudent = computed(() => 
  authStore.canAccess(['STUDENT', 'TEACHER', 'ADMIN'])
)

const canAccessTeacher = computed(() => 
  authStore.canAccess(['TEACHER', 'ADMIN'])
)

const canAccessAdmin = computed(() => 
  authStore.canAccess(['ADMIN'])
)

// User role display
const userRole = computed(() => {
  if (!authStore.currentUser?.role) return ''
  return authStore.currentUser.role.charAt(0) + authStore.currentUser.role.slice(1).toLowerCase()
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    isMobileMenuOpen.value = false
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>