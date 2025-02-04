<!-- src/components/student/assessment/AssessmentProgress.vue -->
<template>
    <div class="bg-white shadow rounded-lg p-6">
      <div class="space-y-6">
        <!-- Current Level -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Current Level</h3>
            <div class="mt-1 flex space-x-2">
              <span 
                v-if="currentCategory"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="categoryClasses[currentCategory]"
              >
                {{ formatCategory(currentCategory) }}
              </span>
              <span 
                v-if="currentDifficulty"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ formatDifficulty(currentDifficulty) }}
              </span>
            </div>
          </div>
  
          <!-- Streak Counter -->
          <div v-if="metrics" class="text-center">
            <span class="text-sm text-gray-500">Current Streak</span>
            <div class="mt-1 text-2xl font-semibold text-gray-900">
              {{ metrics.consecutive_correct }}
            </div>
          </div>
        </div>
  
        <!-- Progress Metrics -->
        <div v-if="metrics" class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700">Category Progress</h4>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Progress cards for each category -->
            <div 
              v-for="(metrics, category) in categoryMetrics" 
              :key="category"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="categoryClasses[category as QuestionCategory]"
                >
                  {{ formatCategory(category) }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ metrics.attempts }} attempts
                </span>
              </div>
              
              <!-- Progress bar -->
              <div class="mt-3">
                <div class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span class="text-xs font-semibold inline-block text-gray-600">
                        Success Rate
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-semibold inline-block text-gray-600">
                        {{ Math.round(metrics.success_rate) }}%
                      </span>
                    </div>
                  </div>
                  <div class="flex h-2 mb-4 overflow-hidden rounded bg-gray-200">
                    <div
                      :style="{ width: `${metrics.success_rate}%` }"
                      class="flex flex-col justify-center rounded bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Advancement Criteria -->
        <div v-if="metrics && currentCategory" class="border-t pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Advancement Criteria</h4>
          <ul class="space-y-2">
            <li class="flex items-center text-sm">
              <CheckCircle 
                v-if="metrics.consecutive_correct >= 3"
                class="h-4 w-4 text-green-500 mr-2"
              />
              <XCircle 
                v-else
                class="h-4 w-4 text-gray-300 mr-2"
              />
              <span :class="metrics.consecutive_correct >= 3 ? 'text-gray-900' : 'text-gray-500'">
                3 consecutive correct answers
                ({{ metrics.consecutive_correct }}/3)
              </span>
            </li>
            <li class="flex items-center text-sm">
              <CheckCircle 
                v-if="currentCategoryMetrics?.success_rate && currentCategoryMetrics.success_rate  >= 75"
                class="h-4 w-4 text-green-500 mr-2"
              />
              <XCircle 
                v-else
                class="h-4 w-4 text-gray-300 mr-2"
              />
              <span :class="currentCategoryMetrics && currentCategoryMetrics.success_rate >= 75 ? 'text-gray-900' : 'text-gray-500'">
                75% success rate 
                ({{ Math.round(currentCategoryMetrics?.success_rate ?? 0) }}%)
              </span>
            </li>
            <li class="flex items-center text-sm">
              <CheckCircle 
                v-if="(currentCategoryMetrics?.attempts ?? 0) >= 5"
                class="h-4 w-4 text-green-500 mr-2"
              />
              <XCircle 
                v-else
                class="h-4 w-4 text-gray-300 mr-2"
              />
              <span :class="(currentCategoryMetrics?.attempts ?? 0) >= 5 ? 'text-gray-900' : 'text-gray-500'">
                Minimum 5 attempts
                ({{ currentCategoryMetrics?.attempts ?? 0 }}/5)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { CheckCircle, XCircle } from 'lucide-vue-next'
  import type { 
    QuestionCategory, 
    QuestionDifficulty,
    AssessmentMetrics,
    CategoryMetrics 
  } from '@/stores/assessment'
  
  // Props
  interface Props {
    metrics: AssessmentMetrics | null
    currentCategory: QuestionCategory | null
    currentDifficulty: QuestionDifficulty | null
  }
  
  const props = defineProps<Props>()
  
  // Category styling
  const categoryClasses: Record<QuestionCategory, string> = {
    'literal_basic': 'bg-green-100 text-green-800',
    'literal_detailed': 'bg-blue-100 text-blue-800',
    'vocabulary_context': 'bg-purple-100 text-purple-800',
    'inferential_simple': 'bg-yellow-100 text-yellow-800',
    'inferential_complex': 'bg-orange-100 text-orange-800',
    'structural_basic': 'bg-pink-100 text-pink-800',
    'structural_advanced': 'bg-red-100 text-red-800'
  }
  
  // Computed
  const categoryMetrics = computed(() => {
    if (!props.metrics) return {}
    
    const metrics: Record<string, CategoryMetrics> = {}
    for (const [key, value] of Object.entries(props.metrics)) {
      if (key.endsWith('_success') && typeof value === 'object') {
        const category = key.replace('_success', '')
        metrics[category] = value
      }
    }
    return metrics
  })
  
  const currentCategoryMetrics = computed(() => {
    if (!props.currentCategory || !props.metrics) return null
    return categoryMetrics.value[props.currentCategory]
  })
  
  // Methods
  const formatCategory = (category: string): string => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  const formatDifficulty = (difficulty: QuestionDifficulty): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }
  </script>