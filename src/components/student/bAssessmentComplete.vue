<!-- src/components/student/assessment/AssessmentComplete.vue -->
<template>
    <BaseDialog
      v-model="isOpen"
      title="Assessment Complete"
      :show-default-footer="true"
      confirm-text="Return to Dashboard"
      cancel-text="View Details"
      @confirm="$emit('close')"
      @cancel="viewDetails"
    >
      <div class="space-y-6">
        <!-- Overall Score -->
        <div class="text-center">
          <div class="text-3xl font-bold text-gray-900">
            {{ Math.round(completionData?.overallScore ?? 0) }}%
          </div>
          <p class="text-sm text-gray-500">Overall Score</p>
        </div>
  
        <!-- Category Breakdown -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">Category Breakdown</h4>
          <div class="space-y-1">
            <div 
              v-for="(rate, category) in completionData?.successRates" 
              :key="category"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-600">{{ formatCategory(category) }}</span>
              <span class="font-medium text-gray-900">{{ Math.round(rate) }}%</span>
            </div>
          </div>
        </div>
  
        <!-- Total Questions -->
        <div class="text-center py-2 border-t">
          <p class="text-sm text-gray-500">
            Total Questions Answered: {{ completionData?.totalQuestions ?? 0 }}
          </p>
        </div>
      </div>
    </BaseDialog>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseDialog from '@/components/base/BaseDialog.vue'
  
  // Props
  interface Props {
    completionData: {
      overallScore: number
      totalQuestions: number
      successRates: Record<string, number>
    } | null
  }
  
  defineProps<Props>()
  defineEmits<{
    (e: 'close'): void
  }>()
  
  const router = useRouter()
  const isOpen = ref(true)
  
  // Methods
  const formatCategory = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const viewDetails = () => {
    // Optional: Navigate to detailed results view
    // router.push({ name: 'assessment-details', params: { ... } })
  }
  </script>