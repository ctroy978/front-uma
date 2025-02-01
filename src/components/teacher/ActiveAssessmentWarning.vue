<!-- src/components/teacher/ActiveAssessmentWarning.vue -->
<template>
  <BaseDialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    title="Active Assessments Found"
    variant="danger"
    confirm-text="Continue Anyway"
    @confirm="onConfirm"
    @cancel="onClose"
  >
    <div class="space-y-4">
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
        Editing this text will cancel these in-progress assessments and students will need to restart.
      </BaseAlert>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@/components/base/BaseDialog.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'

defineProps<{
  isOpen: boolean;
  assessmentCount: number;
  studentNames: string[];
}>()

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
  (e: 'update:isOpen', value: boolean): void;
}>()

const onClose = () => {
  emit('close')
  emit('update:isOpen', false)
}

const onConfirm = () => {
  emit('confirm')
}
</script>