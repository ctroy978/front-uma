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
                Save Changes
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Active Assessment Warning Dialog -->
      <ActiveAssessmentWarning
        :is-open="showWarning"
        :assessment-count="activeAssessments.count"
        :student-names="activeAssessments.student_names"
        @close="showWarning = false"
        @confirm="confirmUpdate"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import TextMetadataForm from '@/components/teacher/TextMetadataForm.vue'
  import TextContentEditor from '@/components/teacher/TextContentEditor.vue'
  import ActiveAssessmentWarning from '@/components/teacher/ActiveAssessmentWarning.vue'
  import { useTextStore } from '@/stores/text'
  import type { TextForm, PrimaryType, Genre, Text, TextChunk } from '@/types/text'
  
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
  const route = useRoute()
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
  
  const isMetadataValid = ref(false)
  const isContentValid = ref(false)
  
  // Computed
  const isFormValid = computed(() => 
    isMetadataValid.value && 
    isContentValid.value
  )
  
  // Methods
  const loadText = async () => {
    try {
      const response = await textStore.fetchText(props.id)
      
      // Set metadata
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
  
      isMetadataValid.value = true
      isContentValid.value = true
    } catch (e: any) {
      error.value = e.message || 'Failed to load text'
      showError.value = true
    } finally {
      isLoading.value = false
    }
  }
  
  const handleMetadataUpdate = (data: MetadataForm) => {
    metadata.value = data
    isMetadataValid.value = true
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
  
      await textStore.updateText(
        props.id,
        {
          metadata: {
            grade_level: metadata.value.gradeLevel,
            form: metadata.value.form as TextForm,
            primary_type: metadata.value.primaryType as PrimaryType,
            genres: new Set(metadata.value.genres) as Set<Genre>
          },
          content: formattedContent
        },
        force
      )
  
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
    if (!isFormValid.value || isSubmitting.value) return
  
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