<!-- BaseButton.vue -->
<template>
    <button
      :type="type"
      :class="[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
      ]"
      :disabled="disabled || loading"
      @click="$emit('click', $event)"
    >
      <!-- Loading Spinner -->
      <span v-if="loading" class="mr-2">
        <svg 
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          />
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
      <slot></slot>
    </button>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  // Define variants and sizes as constants
  const variants = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  } as const
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  } as const
  
  export default defineComponent({
    name: 'BaseButton',
    
    props: {
      variant: {
        type: String as () => keyof typeof variants,
        default: 'default',
        validator: (value: string) => Object.keys(variants).includes(value)
      },
      size: {
        type: String as () => keyof typeof sizes,
        default: 'md',
        validator: (value: string) => Object.keys(sizes).includes(value)
      },
      type: {
        type: String as () => 'button' | 'submit' | 'reset',
        default: 'button'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      loading: {
        type: Boolean,
        default: false
      },
      fullWidth: {
        type: Boolean,
        default: false
      },
      className: {
        type: String,
        default: ''
      }
    },
  
    emits: ['click'],
  
    setup() {
      return {
        variants,
        sizes
      }
    }
  })
  </script>