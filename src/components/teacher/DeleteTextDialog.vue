<!-- src/components/teacher/DeleteTextDialog.vue -->
<template>
    <BaseDialog
      v-model="isOpen"
      :title="hasActiveAssessments ? 'Active Assessments Found' : 'Delete Text'"
      :variant="hasActiveAssessments ? 'danger' : 'default'"
      :confirm-text="hasActiveAssessments ? 'Delete Anyway' : 'Delete Text'"
      :cancel-text="'Cancel'"
      :show-default-footer="true"
      :class="className"
      @update:modelValue="updateOpen"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <div class="space-y-4">
        <!-- Error Alert -->
        <BaseAlert
          v-if="error"
          v-model="showError"
          variant="error"
          :message="error"
          dismissible
        />
  
        <!-- Initial Confirmation -->
        <p v-if="!hasActiveAssessments" class="text-sm text-gray-500">
          Are you sure you want to delete "{{ text?.title }}"? This action cannot be
          undone.
        </p>
  
        <!-- Active Assessments Warning -->
        <template v-if="hasActiveAssessments">
          <p class="text-sm text-gray-500">
            There {{ assessmentCount === 1 ? 'is' : 'are' }}
            <span class="font-medium text-gray-900">{{ assessmentCount }}</span>
            active {{ assessmentCount === 1 ? 'assessment' : 'assessments' }} for this text.
          </p>
          
          <div v-if="studentNames.length">
            <p class="text-sm text-gray-500 mb-2">Students affected:</p>
            <ul class="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li v-for="name in studentNames" :key="name">
                {{ name }}
              </li>
            </ul>
          </div>
  
          <BaseAlert
            :model-value="true"
            variant="error"
            :dismissible="false"
          >
            Deleting this text will cancel these in-progress assessments and students will need to restart.
          </BaseAlert>
        </template>
      </div>
    </BaseDialog>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import BaseDialog from '@/components/base/BaseDialog.vue'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  
  interface Props {
    modelValue: boolean;
    text: {
      id: string;
      title: string;
    } | null;
    activeAssessments?: {
      count: number;
      student_names: string[];
    };
    isLoading?: boolean;
    error?: string;
    className?: string;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: '',
    className: ''
  })
  
  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'close': [];
    'confirm': [force: boolean];
  }>()
  
  // Computed
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })
  
  const showError = computed({
    get: () => !!props.error,
    set: () => {} // No-op as error is controlled by parent
  })
  
  const hasActiveAssessments = computed(() => 
    props.activeAssessments && props.activeAssessments.count > 0
  )
  
  const assessmentCount = computed(() => 
    props.activeAssessments?.count ?? 0
  )
  
  const studentNames = computed(() => 
    props.activeAssessments?.student_names ?? []
  )
  
  // Methods
  const handleConfirm = () => {
    emit('confirm', hasActiveAssessments.value)
  }
  
  const handleCancel = () => {
    emit('close')
  }
  
  const updateOpen = (value: boolean) => {
    emit('update:modelValue', value)
  }
  </script>