<!-- src/components/teacher/TeacherLayout.vue -->
<template>
    <div class="min-h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="flex">
        <div class="hidden md:flex md:w-64 md:flex-col fixed h-full">
          <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4">
              <h2 class="text-lg font-semibold text-gray-900">Teacher Portal</h2>
            </div>
            <div class="mt-5 flex-grow flex flex-col">
              <nav class="flex-1 px-2 pb-4 space-y-1">
                <router-link
                  :to="{ name: 'teacher-dashboard' }"
                  class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  :class="[
                    currentRoute === 'teacher-dashboard'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <span class="truncate">Dashboard</span>
                </router-link>
                
                <router-link
                  :to="{ name: 'teacher-texts-list' }"
                  class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  :class="[
                    isTextRoute
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <span class="truncate">Texts</span>
                </router-link>
              </nav>
            </div>
          </div>
        </div>
  
        <!-- Main content -->
        <div class="md:pl-64 flex flex-col flex-1">
          <main class="flex-1">
            <div class="py-6">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <!-- Page header -->
                <div v-if="pageTitle" class="mb-6">
                  <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
                    <router-link
                      v-if="currentRoute === 'teacher-texts'"
                      :to="{ name: 'create-text' }"
                      class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add New Text
                    </router-link>
                  </div>
                </div>
                
                <!-- Page content -->
                <div class="bg-white rounded-lg shadow">
                  <router-view v-slot="{ Component }">
                    <transition
                      enter-active-class="transition-opacity duration-300"
                      enter-from-class="opacity-0"
                      enter-to-class="opacity-100"
                      leave-active-class="transition-opacity duration-300"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <component :is="Component" />
                    </transition>
                  </router-view>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  
  // Compute current route name for active states
  const currentRoute = computed(() => route.name as string)
  
  // Check if current route is text-related
  const isTextRoute = computed(() => {
    return ['teacher-texts', 'create-text', 'view-text', 'edit-text'].includes(currentRoute.value)
  })
  
  // Compute page title based on route
  const pageTitle = computed(() => {
    switch (route.name) {
      case 'teacher-dashboard':
        return 'Dashboard'
      case 'teacher-texts':
        return 'My Texts'
      case 'create-text':
        return 'Create New Text'
      case 'view-text':
        return 'View Text'
      case 'edit-text':
        return 'Edit Text'
      default:
        return ''
    }
  })
  </script>