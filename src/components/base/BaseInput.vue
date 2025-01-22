# src/components/base/BaseInput.vue
<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useField } from 'vee-validate'

export default defineComponent({
  name: 'BaseInput',
  
  props: {
    name: {
      type: String,
      required: true
    },
    rules: {
      type: [String, Object],
      default: undefined
    },
    validateOnInput: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text',
      validator: (value: string) => {
        return ['text', 'email', 'password', 'number'].includes(value)
      }
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
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
      type: Number,
      default: undefined
    }
  },

  emits: ['update:modelValue'],

  setup(props) {
    const {
      value: inputValue,
      errorMessage,
      handleBlur,
      handleChange,
      meta
    } = useField(props.name, props.rules, {
      initialValue: props.modelValue,
      validateOnValueUpdate: props.validateOnInput
    })

    const inputId = computed(() => `${props.name}-${Math.random().toString(36).slice(2)}`)
    
    const inputClasses = computed(() => [
      'w-full px-3 py-2 border rounded-md shadow-sm',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      {
        'border-red-500 focus:border-red-500': meta.touched && (errorMessage.value || inputValue.value === '' || (props.type === 'email' && !emailRegex.test(inputValue.value))),
        'border-gray-300 focus:border-blue-500': !meta.touched || (!errorMessage.value && !inputValue.value),
        'border-green-500': showSuccessIndicator.value,
        'bg-gray-100 cursor-not-allowed': props.disabled,
        'bg-white': !props.disabled
      }
    ])

    // Email validation regex
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

    // Compute when to show success indicator
    const showSuccessIndicator = computed(() => {
      // Basic validation checks
      const basicChecks = meta.touched && 
        meta.valid && 
        !errorMessage.value && 
        inputValue.value !== '' && 
        inputValue.value !== undefined

      // For email type, add additional validation
      if (props.type === 'email') {
        return basicChecks && emailRegex.test(inputValue.value)
      }

      return basicChecks
    })

    return {
      inputId,
      inputValue,
      errorMessage,
      handleBlur,
      handleChange,
      meta,
      inputClasses,
      showSuccessIndicator
    }
  }
})
</script>

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
      :value="inputValue"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :maxlength="maxlength"
      :class="inputClasses"
      @input="handleChange"
      @blur="handleBlur"
    />

    <p 
      v-if="meta.touched && errorMessage" 
      class="mt-1 text-sm text-red-600"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <span 
      v-if="showSuccessIndicator" 
      class="text-green-600 text-sm mt-1"
    >
      ✓
    </span>
  </div>
</template>