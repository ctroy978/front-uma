<!-- NEW FILE: src/components/student/reading/TextReferenceDialog.vue -->
<template>

<BaseDialog
    :model-value="props.show"
    title="Text Reference"
    class="max-w-4xl"
    cancel-text="Close"
    :show-default-footer="true"
    :show-confirm-button="false"
    @update:model-value="updateShow"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="py-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading text content...</p>
    </div>

    <!-- Error State -->
    <div 
      v-else-if="error" 
      class="py-6 px-4 text-center text-red-600 bg-red-50 rounded-md"
    >
      <AlertCircle class="h-8 w-8 mx-auto mb-2" />
      <p>{{ error }}</p>
              <BaseButton
        variant="default"
        size="sm"
        class="mt-3"
        @click="fetchTextChunks"
      >
        Retry
      </BaseButton>
    </div>

    <!-- Content -->
    <div v-else-if="chunks.length > 0" class="text-reference-content">
      <!-- Tab navigation -->
      <div class="border-b border-gray-200 overflow-x-auto">
        <nav class="flex -mb-px whitespace-nowrap">
          <button
            v-for="(chunk, index) in chunks"
            :key="chunk.id"
            @click="activeTab = index"
            class="px-4 py-2 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[
              activeTab === index
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            :aria-selected="activeTab === index ? 'true' : 'false'"
            role="tab"
            :id="`tab-${index}`"
            :aria-controls="`panel-${index}`"
          >
            Chunk {{ index + 1 }}
          </button>
        </nav>
      </div>
      
      <!-- Tab content -->
      <div 
        class="mt-4 prose max-w-none overflow-y-auto max-h-[60vh]"
        @copy.prevent="handleCopyAttempt"
        @cut.prevent="handleCopyAttempt"
        @contextmenu.prevent
      >
        <div 
          v-for="(chunk, index) in chunks" 
          :key="`content-${chunk.id}`"
          :id="`panel-${index}`"
          role="tabpanel"
          :aria-labelledby="`tab-${index}`"
          :hidden="activeTab !== index"
          class="focus:outline-none"
          tabindex="0"
        >
          <div 
            v-if="activeTab === index"
            class="text-content no-select whitespace-pre-wrap break-words font-normal text-gray-900 text-base leading-relaxed"
          >
            {{ chunk.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-6 px-4 text-center text-gray-600">
      <FileQuestion class="h-8 w-8 mx-auto mb-2" />
      <p>No text content available</p>
    </div>

    <!-- Copy Alert -->
    <div 
      v-if="showCopyAlert"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-50 flex items-center"
      role="alert"
    >
      <div class="flex-shrink-0 mr-2">
        <ShieldAlert class="h-5 w-5 text-red-500" />
      </div>
      <span>Copying text is not allowed</span>

      
      

    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import BaseDialog from '@/components/base/BaseDialog.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { AlertCircle, ShieldAlert, FileQuestion } from 'lucide-vue-next'
import api from '@/utils/axios'

interface TextChunk {
  id: string;
  content: string;
  index: number;
}

// Props
const props = defineProps<{
  show: boolean;
  completionId: string;
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>()

// State
const activeTab = ref(0)
const chunks = ref<TextChunk[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCopyAlert = ref(false)
const copyAlertTimer = ref<number | null>(null)

const showDialog = computed(() => props.show)


// Update parent component when dialog is closed
const updateShow = (value: boolean) => {
  emit('update:show', value)
}

// Reset active tab when dialog opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    activeTab.value = 0
    if (chunks.value.length === 0) {
      fetchTextChunks()
    }
  }
})

// Fetch text chunks
const fetchTextChunks = async () => {
  if (!props.completionId) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await api.get(`/completion-test/${props.completionId}/text-chunks`)
    chunks.value = response.data.chunks || []
  } catch (err: any) {
    console.error('Error fetching text chunks:', err)
    error.value = err.response?.data?.detail || 'Failed to load text content'
  } finally {
    isLoading.value = false
  }
}

// Handle copy attempt
const handleCopyAttempt = (event: Event) => {
  // Prevent the default copy action
  event.preventDefault()
  
  // Show the copy alert
  showCopyAlert.value = true
  
  // Clear any existing timer
  if (copyAlertTimer.value !== null) {
    window.clearTimeout(copyAlertTimer.value)
  }
  
  // Hide the alert after 3 seconds
  copyAlertTimer.value = window.setTimeout(() => {
    showCopyAlert.value = false
  }, 3000)
}

// Keyboard handler for copy prevention
const handleKeyDown = (event: KeyboardEvent) => {
  // Check for Ctrl+C, Ctrl+X, Command+C, Command+X
  if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'x')) {
    // Only prevent copying if selection is within our component
    if (showDialog.value) {
      event.preventDefault()
      handleCopyAttempt(event)
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  
  // Clear any pending timers
  if (copyAlertTimer.value !== null) {
    window.clearTimeout(copyAlertTimer.value)
  }
})
</script>

<style scoped>
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
}

.text-content {
  position: relative;
}

/* Add an invisible overlay to further prevent selection */
.text-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

@media (max-width: 640px) {
  .max-h-\[60vh\] {
    max-height: 50vh;
  }
}
</style>