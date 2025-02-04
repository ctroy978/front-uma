<!-- src/views/UnauthorizedView.vue -->
<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <h2 class="mt-2 text-3xl font-bold text-gray-900">
              Unauthorized Access
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              You don't have permission to access this resource.
            </p>
            <div class="mt-6">
              <router-link
                :to="{ name: 'home' }"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // No setup needed for this basic view
  </script>