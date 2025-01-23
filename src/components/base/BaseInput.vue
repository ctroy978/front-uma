<!-- BaseInput.vue -->
<template>
  <div class="form-control">
    <label 
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <input
      :id="inputId"
      :name="name"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :maxlength="maxlength"
      :class="[
        'w-full px-3 py-2 border rounded-md shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        error ? 'border-red-500' : 'border-gray-300',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
    />

    <p v-if="error" class="mt-1 text-sm text-red-600" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'BaseInput',
  
  props: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
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
    autocomplete: {
      type: String,
      default: 'off'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minlength: {
      type: Number,
      default: undefined
    },
    maxlength: {
      type: [String, Number],
      default: undefined
    }
  },

  emits: ['update:modelValue', 'blur'],

  setup(props) {
    const inputId = computed(() => `${props.name}-${Math.random().toString(36).slice(2)}`)
    return { inputId }
  }
})
</script>