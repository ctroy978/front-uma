<!-- src/components/teacher/MetadataForm.vue -->
<template>
    <div class="space-y-6">
      <!-- Grade Level -->
      <BaseInput
        name="gradeLevel"
        label="Grade Level"
        type="number"
        :modelValue="form.gradeLevel?.toString() ?? ''"
        @update:modelValue="val => form.gradeLevel = val ? Number(val) : null"
        :min="2"
        :max="12"
        :error="errors.gradeLevel"
        @blur="validateField('gradeLevel')"
        required
      />
  
      <!-- Form Type -->
      <div class="form-control">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Form
          <span class="text-red-500 ml-1">*</span>
        </label>
        <select
          v-model="form.form"
          @change="validateField('form')"
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.form ? 'border-red-500' : 'border-gray-300'"
        >
          <option value="">Select Form</option>
          <option v-for="formType in forms" :key="formType" :value="formType">
            {{ formType }}
          </option>
        </select>
        <p v-if="errors.form" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.form }}
        </p>
      </div>
  
      <!-- Primary Type -->
      <div class="form-control">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Primary Type
          <span class="text-red-500 ml-1">*</span>
        </label>
        <select
          v-model="form.primaryType"
          @change="validateField('primaryType')"
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.primaryType ? 'border-red-500' : 'border-gray-300'"
        >
          <option value="">Select Primary Type</option>
          <option v-for="type in primaryTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <p v-if="errors.primaryType" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.primaryType }}
        </p>
      </div>
  
      <!-- Genres -->
      <div class="form-control">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Genres
          <span class="text-red-500 ml-1">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <button
            v-for="genre in genres"
            :key="genre"
            type="button"
            @click="toggleGenre(genre)"
            class="px-3 py-2 rounded-md text-sm font-medium"
            :class="[
              form.genres.includes(genre)
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            ]"
          >
            {{ genre }}
          </button>
        </div>
        <p v-if="errors.genres" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.genres }}
        </p>
      </div>
  
      <!-- Selected Genres Display -->
      <div v-if="form.genres.length > 0" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selected Genres
        </label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="genre in form.genres"
            :key="genre"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ genre }}
            <button
              type="button"
              @click="toggleGenre(genre)"
              class="ml-1.5 hover:text-blue-900"
            >
              <XCircle class="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { XCircle } from 'lucide-vue-next'
  import BaseInput from '@/components/base/BaseInput.vue'
  
  // Props and Emits
  interface InitialData {
    gradeLevel?: number;
    form?: string;
    primaryType?: string;
    genres?: string[];
  }
  
  const props = defineProps<{
    initialData?: InitialData;
  }>()
  
  const emit = defineEmits<{
    (e: 'update:metadata', metadata: any): void
  }>()
  
  // Form options
  const forms = ['PROSE', 'POETRY', 'DRAMA', 'OTHER']
  const primaryTypes = ['NARRATIVE', 'INFORMATIONAL', 'PERSUASIVE', 'OTHER']
  const genres = [
    'FANTASY', 'MYTHOLOGY', 'REALISTIC', 'HISTORICAL',
    'TECHNICAL', 'BIOGRAPHY', 'ADVENTURE', 'MYSTERY',
    'NONFICTION', 'OTHER'
  ]
  
  // Form state
  interface FormData {
    gradeLevel: number | null;
    form: string;
    primaryType: string;
    genres: string[];
  }
  
  const form = ref<FormData>({
    gradeLevel: props.initialData?.gradeLevel || null,
    form: props.initialData?.form || '',
    primaryType: props.initialData?.primaryType || '',
    genres: props.initialData?.genres || []
  })
  
  // Error state
  const errors = ref({
    gradeLevel: '',
    form: '',
    primaryType: '',
    genres: ''
  })
  
  // Validation
  const validateField = (field: keyof typeof form.value) => {
    errors.value[field] = ''
  
    switch (field) {
      case 'gradeLevel':
        if (form.value.gradeLevel === null) {
          errors.value.gradeLevel = 'Grade level is required'
        } else if (form.value.gradeLevel < 2 || form.value.gradeLevel > 12) {
          errors.value.gradeLevel = 'Grade level must be between 2 and 12'
        }
        break
      case 'form':
        if (!form.value.form) {
          errors.value.form = 'Form is required'
        }
        break
      case 'primaryType':
        if (!form.value.primaryType) {
          errors.value.primaryType = 'Primary type is required'
        }
        break
      case 'genres':
        if (!form.value.genres.length) {
          errors.value.genres = 'At least one genre must be selected'
        }
        break
    }
  
    // Emit changes only if all fields are valid
    if (Object.values(errors.value).every(error => !error)) {
      emit('update:metadata', form.value)
    }
  }
  
  // Methods
  const toggleGenre = (genre: string) => {
    if (form.value.genres.includes(genre)) {
      form.value.genres = form.value.genres.filter(g => g !== genre)
    } else {
      form.value.genres.push(genre)
    }
    validateField('genres')
  }
  
  // Watch for changes
  watch(
    () => form.value,
    () => {
      validateField('gradeLevel')
      validateField('form')
      validateField('primaryType')
      validateField('genres')
    },
    { deep: true }
  )
  </script>