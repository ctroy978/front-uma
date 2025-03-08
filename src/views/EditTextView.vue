<!-- src/views/EditTextView.vue -->
<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading text...</p>
    </div>

    <!-- Error Alert -->
    <BaseAlert
      v-if="error"
      v-model="showError"
      variant="error"
      :message="error"
      dismissible
    />

    <!-- Success Alert -->
    <BaseAlert
      v-if="showSuccess"
      v-model="showSuccess"
      variant="success"
      message="Text updated successfully!"
      dismissible
    />

    <!-- Edit Form -->
    <div v-if="!isLoading" class="bg-white shadow rounded-lg">
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Metadata Display Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Text Information</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <!-- Grade Level -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Grade Level</label>
                <div class="mt-1 text-sm text-gray-900">{{ metadata.gradeLevel }}</div>
              </div>

              <!-- Form -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Form</label>
                <div class="mt-1 text-sm text-gray-900">{{ metadata.form }}</div>
              </div>

              <!-- Primary Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Primary Type</label>
                <div class="mt-1 text-sm text-gray-900">{{ metadata.primaryType }}</div>
              </div>

              <!-- Genres -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Genres</label>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span
                    v-for="genre in metadata.genres"
                    :key="genre"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200" />

          <!-- Content Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Text Content</h3>
            <TextContentEditor
              :show-preview="true"
              :initial-content="contentData"
              @update:content="handleContentUpdate"
            />
          </div>

          <!-- Form Actions -->
          <div class="border-t border-gray-200 pt-6 flex justify-end space-x-4">
            <BaseButton
              type="button"
              variant="default"
              :disabled="isSubmitting"
              @click="handleCancel"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="!isContentValid || isSubmitting"
            >
              Save Changes
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Active Assessment Warning Dialog -->
    <ActiveAssessmentWarning
      v-model:isOpen="showWarning"
      :assessment-count="activeAssessments.count"
      :student-names="activeAssessments.student_names"
      @confirm="confirmUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import TextContentEditor from '@/components/teacher/TextContentEditor.vue'
import ActiveAssessmentWarning from '@/components/teacher/ActiveAssessmentWarning.vue'
import { useTextStore } from '@/stores/text'
import type { TextChunk } from '@/types/text'

interface MetadataForm {
  gradeLevel: number;
  form: string;
  primaryType: string;
  genres: string[];
}

interface ContentData {
  title: string;
  content: string;
}

interface ActiveAssessmentData {
  count: number;
  student_names: string[];
}

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const textStore = useTextStore()

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)
const showWarning = ref(false)

const activeAssessments = ref<ActiveAssessmentData>({
  count: 0,
  student_names: []
})

const metadata = ref<MetadataForm>({
  gradeLevel: 0,
  form: '',
  primaryType: '',
  genres: []
})

const contentData = ref<ContentData>({
  title: '',
  content: ''
})

const isContentValid = ref(false)

// Methods
const loadText = async () => {
  try {
    const response = await textStore.fetchText(props.id)
    
    // Set metadata (display only)
    metadata.value = {
      gradeLevel: response.text.grade_level,
      form: response.text.form,
      primaryType: response.text.primary_type,
      genres: response.text.genres
    }

    // Set content
    contentData.value = {
      title: response.text.title,
      content: response.chunks.map((chunk: TextChunk) => 
        `<chunk>${chunk.content}</chunk>`
      ).join('\n\n')
    }

    isContentValid.value = true
  } catch (e: any) {
    error.value = e.message || 'Failed to load text'
    showError.value = true
  } finally {
    isLoading.value = false
  }
}

const handleContentUpdate = (data: ContentData & { isValid: boolean }) => {
  contentData.value = {
    title: data.title,
    content: data.content
  }
  isContentValid.value = data.isValid
}

const handleCancel = () => {
  router.push({ name: 'view-text', params: { id: props.id }})
}

const checkActiveAssessments = async (): Promise<boolean> => {
  try {
    const result = await textStore.checkActiveAssessments(props.id)
    activeAssessments.value = result
    return result.count > 0
  } catch (e: any) {
    error.value = e.message || 'Failed to check active assessments'
    showError.value = true
    return false
  }
}

const updateText = async (force: boolean = false) => {
  isSubmitting.value = true
  error.value = ''
  showError.value = false

  try {
    // Format the content with XML tags
    const formattedContent = `<title>${contentData.value.title}</title>\n${contentData.value.content}`

    await textStore.updateText(props.id, formattedContent, force)

    showSuccess.value = true
    
    // Wait for success message to be seen
    setTimeout(() => {
      router.push({ 
        name: 'view-text', 
        params: { id: props.id }
      })
    }, 1500)

  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Failed to update text'
    showError.value = true
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
    showWarning.value = false
  }
}

const handleSubmit = async () => {
  if (!isContentValid.value || isSubmitting.value) return

  // First check for active assessments
  const hasActive = await checkActiveAssessments()
  if (hasActive) {
    showWarning.value = true
    return
  }

  // If no active assessments, proceed with update
  await updateText(false)
}

const confirmUpdate = async () => {
  // User confirmed to proceed despite active assessments
  await updateText(true)
}

// Load initial data
onMounted(() => {
  loadText()
})
</script>