<!-- src/components/student/reading/TextSimplifier.vue -->
<template>
    <div class="bg-white shadow rounded-lg p-4">
      <!-- Title and Description -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-medium text-gray-900">Reading Help</h3>
          <p class="text-xs text-gray-500">Get a simplified version of this text</p>
        </div>
      </div>
  
      <!-- Simplify Controls -->
      <div class="flex items-center justify-between">
        <button
          @click="handleSimplify"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="simplifyLoading || !!simplifyError"
        >
          <BookOpen class="h-4 w-4 mr-2" />
          Simplify Text
        </button>
  
        <!-- Loading Spinner -->
        <div v-if="simplifyLoading" class="flex items-center text-sm text-gray-500">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
          Simplifying...
        </div>
      </div>
  
      <!-- Error Message -->
      <div v-if="simplifyError" class="mt-2">
        <p class="text-sm text-red-600">{{ simplifyError }}</p>
        <button
          @click="retrySimplify"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
  
      <!-- Dialog for simplified text -->
      <BaseDialog
        v-model="showDialog"
        :title="`Simplified Text (Grade ${targetGradeLevel || ''})`"
        :show-default-footer="true"
        class-name="max-w-3xl w-full"
        confirm-text="Close"
        @confirm="closeDialog"
        @cancel="closeDialog"
      >
        <div v-if="simplifiedText" class="prose max-w-none">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Original: Grade {{ originalGradeLevel }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Simplified: Grade {{ targetGradeLevel }}
              </span>
              <span v-if="isTextCached" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Zap class="h-3 w-3 mr-1" />
                Fast Load
              </span>
            </div>
          </div>
          <div class="whitespace-pre-wrap break-words font-normal text-gray-900 text-lg leading-relaxed">
            {{ simplifiedText }}
          </div>
        </div>
      </BaseDialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { BookOpen, Zap } from 'lucide-vue-next'
  import { useReadingStore } from '@/stores/reading'
  import BaseDialog from '@/components/base/BaseDialog.vue'
  
  // Props
  const props = defineProps<{
    chunkContent: string
  }>()
  
  // Store
  const readingStore = useReadingStore()
  const { 
    simplifiedText, 
    simplifyLoading, 
    simplifyError, 
    originalGradeLevel, 
    targetGradeLevel,
    isTextCached
  } = storeToRefs(readingStore)
  
  // Local state
  const showDialog = ref(false)
  
  // Debug the dialog visibility
  watch(() => showDialog.value, (newValue) => {
    console.log('Dialog visibility changed:', newValue);
    if (newValue) {
      console.log('Dialog opened with text:', simplifiedText.value);
      console.log('Original grade level:', originalGradeLevel.value);
      console.log('Target grade level:', targetGradeLevel.value);
      console.log('Is cached:', isTextCached.value);
    }
  });
  
  // Methods
  const handleSimplify = async () => {
    console.log('Attempting to simplify text...');
    
    // If we already have simplified text, just show the dialog
    if (simplifiedText.value) {
      console.log('Using cached simplified text');
      showDialog.value = true;
      return;
    }
  
    try {
      console.log('Making API call to simplify text');
      const result = await readingStore.simplifyCurrentChunk();
      console.log('API response:', result);
      
      // Explicitly check if we got a response with text
      if (simplifiedText.value) {
        console.log('Showing dialog with simplified text');
        showDialog.value = true;
      } else {
        console.error('Simplified text is empty or null');
      }
    } catch (error) {
      console.error('Failed to simplify text:', error);
    }
  }
  
  const retrySimplify = () => {
    readingStore.clearSimplifiedText();
    handleSimplify();
  }
  
  const closeDialog = () => {
    console.log('Closing dialog');
    showDialog.value = false;
  }
  
  // Watch for chunk content changes
  watch(() => props.chunkContent, () => {
    // Clear simplified text when the chunk changes
    readingStore.clearSimplifiedText();
  })
  </script>