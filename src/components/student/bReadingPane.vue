<!-- src/views/components/ReadingPane.vue -->
<template>
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Reading Passage</h2>
      
      <div v-if="chunk" class="prose prose-sm max-w-none">
        <!-- Word count badge -->
        <div class="mb-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ chunk.word_count }} words
          </span>
        </div>
  
        <!-- Content -->
        <div class="text-gray-700 leading-relaxed">
          {{ chunk.content }}
        </div>
      </div>
  
      <div v-else class="text-gray-500 italic">
        No passage loaded
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { ChunkInfo } from '@/stores/assessment'
  
  defineProps<{
    chunk: ChunkInfo | null
  }>()
  </script>