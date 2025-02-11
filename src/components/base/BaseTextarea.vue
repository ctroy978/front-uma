<!-- BaseTextarea.vue -->
<template>
    <div class="form-control">
      <label 
        :for="textareaId"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </label>
  
      <textarea
        :id="textareaId"
        :name="name"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="maxlength"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm resize-none overflow-y-auto',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @blur="$emit('blur', $event)"
      />
  
      <div class="mt-1 flex justify-between">
        <p v-if="error" class="text-sm text-red-600" role="alert">
          {{ error }}
        </p>
        <p 
          class="text-sm"
          :class="{
            'text-gray-500': currentLength < maxlength * 0.8,
            'text-yellow-500': currentLength >= maxlength * 0.8 && currentLength < maxlength,
            'text-red-500': currentLength >= maxlength
          }"
        >
          {{ currentLength }}/{{ maxlength }} characters
        </p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue'
  
  export default defineComponent({
    name: 'BaseTextarea',
    
    props: {
      name: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      modelValue: {
        type: String,
        default: ''
      },
      error: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: ''
      },
      required: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      rows: {
        type: Number,
        default: 4
      },
      maxlength: {
        type: Number,
        default: 500
      }
    },
  
    emits: ['update:modelValue', 'blur'],
  
    setup(props) {
      const textareaId = computed(() => `${props.name}-${Math.random().toString(36).slice(2)}`)
      
      const currentLength = computed(() => props.modelValue.length)
      
      const isNearMaxLength = computed(() => {
        if (!props.maxlength) return false
        return currentLength.value >= props.maxlength * 0.9
      })
  
      return { 
        textareaId,
        currentLength,
        isNearMaxLength
      }
    }
  })
  </script>