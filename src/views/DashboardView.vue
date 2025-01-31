<!-- src/views/DashboardView.vue -->
<template>
  <div class="p-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Total Texts Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BookOpen class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Texts
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ isLoading ? '-' : textStats.totalTexts }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Text by Type Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Files class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Most Common Type
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ isLoading ? '-' : textStats.mostCommonType || 'None' }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Average Grade Level Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <GraduationCap class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Average Grade Level
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ isLoading ? '-' : textStats.avgGradeLevel.toFixed(1) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Texts Table -->
    <div class="mt-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h2 class="text-xl font-semibold text-gray-900">Recent Texts</h2>
          <p class="mt-2 text-sm text-gray-700">
            A list of your most recently added texts.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <router-link
            :to="{ name: 'create-text' }"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Text
          </router-link>
        </div>
      </div>

      <div class="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Title
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Grade Level
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Created
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="isLoading">
              <td colspan="5" class="p-4 text-center text-sm text-gray-500">
                Loading recent texts...
              </td>
            </tr>
            <tr v-else-if="!recentTexts.length">
              <td colspan="5" class="p-4 text-center text-sm text-gray-500">
                No texts found. Create your first text to get started.
              </td>
            </tr>
            <tr v-for="text in recentTexts" :key="text.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {{ text.title }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ text.primary_type }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ text.grade_level }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ formatDate(text.created_at) }}
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                <router-link
                  :to="{ name: 'view-text', params: { id: text.id }}"
                  class="text-blue-600 hover:text-blue-900"
                >
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpen, Files, GraduationCap } from 'lucide-vue-next'
import { useTextStore } from '../stores/text'
import type { Text } from '../types/text'

const textStore = useTextStore()
const isLoading = ref(true)
const recentTexts = ref<Text[]>([])
const textStats = ref({
  totalTexts: 0,
  mostCommonType: '',
  avgGradeLevel: 0
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    await textStore.fetchTexts()
    const texts = textStore.texts

    // Get recent texts (last 5)
    recentTexts.value = texts.slice(0, 5)

    // Calculate stats
    textStats.value = {
      totalTexts: texts.length,
      mostCommonType: calculateMostCommonType(texts),
      avgGradeLevel: calculateAverageGradeLevel(texts)
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})

const calculateMostCommonType = (texts: Text[]): string => {
  if (!texts.length) return ''
  
  const typeCounts = texts.reduce((acc, text) => {
    acc[text.primary_type] = (acc[text.primary_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0][0]
}

const calculateAverageGradeLevel = (texts: Text[]): number => {
  if (!texts.length) return 0
  
  const sum = texts.reduce((acc, text) => acc + text.grade_level, 0)
  return sum / texts.length
}
</script>