<!-- NavBar.vue -->
<template>
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo Section -->
          <div class="flex-shrink-0 flex items-center">
            <router-link 
              :to="{ name: isAuthenticated ? 'home' : 'login' }" 
              class="text-blue-600 text-2xl font-bold"
            >
              uMa
            </router-link>
          </div>
  
          <!-- Desktop Navigation -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <!-- Navigation Links - Shown when NOT authenticated -->
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
  
            <!-- Navigation Links - Shown when authenticated -->
            <template v-else>
              <button
                @click="handleLogout"
                class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Logout
              </button>
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
          <!-- Mobile Navigation Links - Shown when NOT authenticated -->
          <template v-if="!isAuthenticated">
            <router-link 
              :to="{ name: 'login' }" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Login
            </router-link>
            <router-link 
              :to="{ name: 'register' }" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              active-class="bg-gray-100"
            >
              Register
            </router-link>
          </template>
  
          <!-- Mobile Navigation Links - Shown when authenticated -->
          <template v-else>
            <button
              @click="handleLogout"
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../../stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const isMobileMenuOpen = ref(false)
  
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  const handleLogout = async () => {
    await authStore.logout()
    isMobileMenuOpen.value = false
    router.push({ name: 'login' })
  }
  </script>