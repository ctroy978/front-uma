<!-- src/views/ViewTextView.vue -->
<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading text...</p>
    </div>

    <!-- Error State -->
    <BaseAlert
      v-if="error"
      v-model="showError"
      variant="error"
      :message="error"
      dismissible
    />

    <!-- Content -->
    <div v-if="text && !isLoading" class="space-y-6">
      <!-- Header -->
      <div class="border-b border-gray-200 pb-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ text.title }}</h1>
        <div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
          <div>Grade Level: {{ text.grade_level }}</div>
          <div>Form: {{ text.form }}</div>
          <div>Type: {{ text.primary_type }}</div>
          <div>Created: {{ formatDate(text.created_at) }}</div>
        </div>

        <!-- Genres -->
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="genre in text.genres"
            :key="genre"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ genre }}
          </span>
        </div>
      </div>

      <!-- Text Content -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="prose max-w-none">
            <!-- Text Chunks -->
            <div v-for="(chunk, index) in chunks" :key="index" class="mb-8">
              <div class="text-sm text-gray-500 mb-2">Chunk {{ index + 1 }}</div>
              <div class="whitespace-pre-wrap">{{ chunk.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <BaseButton
          variant="default"
          @click="handleReturn"
        >
          {{ returnButtonText }}
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="router.push({ name: 'edit-text', params: { id } })"
        >
          Edit Text
        </BaseButton>
        <BaseButton
          variant="danger"
          @click="showDeleteDialog = true"
        >
          Delete Text
        </BaseButton>
      </div>

      <!-- Delete Dialog -->
      <DeleteTextDialog
        v-if="text"
        v-model="showDeleteDialog"
        :text="{ id: text.id, title: text.title }"
        :active-assessments="activeAssessments"
        :is-loading="isDeleting"
        :error="deleteError"
        @close="handleDeleteClose"
        @confirm="handleDeleteConfirm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import DeleteTextDialog from '@/components/teacher/DeleteTextDialog.vue'
import { useTextStore } from '@/stores/text'
import type { Text, TextChunk } from '@/types/text'
import type { ActiveAssessmentInfo } from '@/stores/text'

// Props and setup
const props = defineProps<{
id: string;
defaultReturn?: 'dashboard' | 'texts';
}>()

const router = useRouter()
const route = useRoute()
const textStore = useTextStore()

// State
const text = ref<Text | null>(null)
const chunks = ref<TextChunk[]>([])
const isLoading = ref(true)
const error = ref('')
const showError = ref(false)

// Delete state
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')
const activeAssessments = ref<ActiveAssessmentInfo | undefined>()

// Computed
const returnButtonText = computed(() => {
if (route.query.from === 'teacher-texts') {
  return 'Back to Texts'
}
return 'Back to Dashboard'
})

// Methods
const formatDate = (date: string) => {
return new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
}

const handleReturn = () => {
if (route.query.from) {
  router.push({ name: route.query.from as string })
} else {
  router.push({ 
    name: props.defaultReturn === 'texts' ? 'teacher-texts' : 'teacher-dashboard' 
  })
}
}

const fetchText = async () => {
isLoading.value = true
error.value = ''
showError.value = false

try {
  const response = await textStore.fetchText(props.id)
  text.value = response.text
  chunks.value = response.chunks
} catch (e: any) {
  error.value = e.message || 'Failed to load text'
  showError.value = true
} finally {
  isLoading.value = false
}
}

// Delete handlers
const handleDeleteClose = () => {
showDeleteDialog.value = false
deleteError.value = ''
activeAssessments.value = undefined
}

const handleDeleteConfirm = async (force: boolean) => {
if (isDeleting.value) return

try {
  isDeleting.value = true
  deleteError.value = ''

  // If not forcing, check for active assessments first
  if (!force) {
    try {
      activeAssessments.value = await textStore.checkActiveAssessments(props.id)
      if (activeAssessments.value.count > 0) {
        return // Keep dialog open to show warning
      }
    } catch (e: any) {
      deleteError.value = e.message || 'Failed to check active assessments'
      return
    }
  }

  // Proceed with deletion
  await textStore.deleteText(props.id, force)
  showDeleteDialog.value = false
  
  // Show success message and redirect
  const successMessage = `${text.value?.title} has been deleted.`
  router.push({ 
    name: 'teacher-texts',
    query: { 
      success: successMessage 
    }
  })
  
} catch (e: any) {
  if (e.count !== undefined && e.student_names !== undefined) {
    // Got active assessments response
    activeAssessments.value = e
  } else {
    deleteError.value = e.message || 'Failed to delete text'
  }
} finally {
  isDeleting.value = false
}
}

// Lifecycle
onMounted(() => {
fetchText()
})
</script>