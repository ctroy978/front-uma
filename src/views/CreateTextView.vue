import { TextForm, PrimaryType, Genre } from '../types/text'<!-- src/views/CreateTextView.vue -->
<template>
  <div class="p-6">
    <!-- Form Card -->
    <div class="bg-white shadow rounded-lg">
      <div class="p-6">
        <!-- Alert Messages -->
        <BaseAlert
          v-if="error"
          v-model="showError"
          variant="error"
          :message="error"
          dismissible
        />

        <BaseAlert
          v-if="showSuccess"
          v-model="showSuccess"
          variant="success"
          message="Text created successfully!"
          dismissible
        />

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Metadata Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Text Information</h3>
            <TextMetadataForm
              :initial-data="metadata"
              @update:metadata="handleMetadataUpdate"
            />
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
              :disabled="!isFormValid || isSubmitting"
            >
              Create Text
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import TextMetadataForm from '@/components/teacher/TextMetadataForm.vue'
import TextContentEditor from '@/components/teacher/TextContentEditor.vue'
import { useTextStore } from '@/stores/text'
import { TextForm, PrimaryType, Genre } from '../types/text'


const router = useRouter()
const textStore = useTextStore()

// Form state
interface FormMetadata {
  gradeLevel: number;  // Required number
  form: string;
  primaryType: string;
  genres: string[];
}

const metadata = ref<FormMetadata>({
  gradeLevel: 2,  // Default to minimum grade level
  form: '',
  primaryType: '',
  genres: []
})

const contentData = ref({
  title: '',
  content: ''
})

const isMetadataValid = ref(false)
const isContentValid = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)

// Computed
const isFormValid = computed(() => 
  isMetadataValid.value && 
  isContentValid.value
)

// Event Handlers
const handleMetadataUpdate = (data: any) => {
  metadata.value = data
  isMetadataValid.value = true
}

const handleContentUpdate = (data: any) => {
  contentData.value = {
    title: data.title,
    content: data.content
  }
  isContentValid.value = data.isValid
}

const handleCancel = () => {
  router.push({ name: 'teacher-texts' })
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  error.value = ''
  showError.value = false

  try {
    // Format the content with XML tags
    const formattedContent = `<title>${contentData.value.title}</title>\n${contentData.value.content}`

    await textStore.createText({
      metadata: {
        grade_level: metadata.value.gradeLevel,
        form: metadata.value.form as TextForm,
        primary_type: metadata.value.primaryType as PrimaryType,
        genres: new Set(metadata.value.genres) as Set<Genre>
      },
      content: formattedContent
    })

    showSuccess.value = true
    
    // Wait for success message to be seen
    setTimeout(() => {
      router.push({ name: 'teacher-texts' })
    }, 1500)

  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Failed to create text'
    showError.value = true
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>