<!-- src/components/student/TeacherList.vue -->
<template>
    <div>
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div 
          v-for="n in 5" 
          :key="n"
          class="animate-pulse flex items-center px-2 py-2"
        >
          <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div class="ml-3 flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="mt-1 h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
  
      <!-- Empty State -->
      <div 
        v-else-if="!teachers.length" 
        class="px-2 py-4 text-center"
      >
        <div class="flex flex-col items-center">
          <User class="h-8 w-8 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            No teachers
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            No teachers have published any texts yet.
          </p>
        </div>
      </div>
  
      <!-- Teacher List -->
      <div v-else class="space-y-1">
        <button
          v-for="teacher in teachers"
          :key="teacher.id"
          @click="$emit('select', teacher.id)"
          class="w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-50"
          :class="[
            selectedTeacherId === teacher.id
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600'
          ]"
        >
          <div class="flex items-center flex-1 min-w-0">
            <div class="flex-shrink-0">
              <User class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-left truncate">
                {{ teacher.full_name }}
              </p>
              <p class="text-xs text-gray-500 text-left">
                {{ teacher.text_count }} {{ teacher.text_count === 1 ? 'text' : 'texts' }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { User } from 'lucide-vue-next'
  
  interface Teacher {
    id: string
    full_name: string
    text_count: number
  }
  
  defineProps<{
    teachers: Teacher[]
    selectedTeacherId: string | null
    isLoading: boolean
  }>()
  
  defineEmits<{
    (e: 'select', teacherId: string): void
  }>()
  </script>