<!-- src/components/student/reading/ReadingContainer.vue -->
<template>
    <div class="min-h-screen bg-gray-100">
      <!-- Top Navigation Bar -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Back Button -->
            <button 
              class="flex items-center text-gray-500 hover:text-gray-700"
              @click="$router.push({ name: 'student-dashboard' })"
            >
              <ArrowLeft class="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
  
      <!-- Main Content Area -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex gap-8">
          <!-- Reading Section -->
          <div class="w-3/5">
            <!-- Text Card -->
            <div class="bg-white shadow rounded-lg p-6 mb-6">
              <div class="prose prose-lg max-w-none">
                <h2>Sample Text Content</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </div>
            </div>
  
            <!-- Question Card -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Sample Question</h3>
                <p class="text-gray-600">What is the main idea of the passage above?</p>
              </div>
  
              <div class="mb-4">
                <label 
                  for="answer" 
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Answer
                </label>
                <textarea
                  id="answer"
                  rows="3"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                />
              </div>
  
              <div class="flex justify-between items-center">
                <button
                  class="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Answer
                </button>
                <button
                  class="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Chunk
                </button>
              </div>
            </div>
          </div>
  
          <!-- Right Side Space -->
          <div class="w-2/5">
            <!-- Reserved for future features -->
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ArrowLeft } from 'lucide-vue-next'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  // Log the textId to make sure we're receiving it
  console.log('Text ID:', route.params.textId)
  </script>
  
  <style scoped>
  .prose {
    max-width: none;
    width: 100%;
  }
  
  .prose p {
    font-size: 1.125rem;
    line-height: 1.75;
    margin-bottom: 1.5em;
  }
  </style>