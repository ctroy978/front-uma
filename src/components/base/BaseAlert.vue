<!-- BaseAlert.vue -->
<template>
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        :class="[
          'border rounded-lg p-4',
          variants[variant].containerClass,
          className
        ]"
        role="alert"
      >
        <div class="flex">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <component 
              :is="variants[variant].icon" 
              :class="['h-5 w-5', variants[variant].iconClass]"
            />
          </div>
          
          <!-- Content -->
          <div class="ml-3 flex-grow">
            <h3 
              v-if="title"
              :class="['text-sm font-medium', variants[variant].textClass]"
            >
              {{ title }}
            </h3>
            <div 
              :class="[
                'text-sm',
                variants[variant].textClass,
                { 'mt-2': title }
              ]"
            >
              <slot>{{ message }}</slot>
            </div>
          </div>
  
          <!-- Dismiss Button -->
          <div v-if="dismissible" class="ml-auto pl-3">
            <button
              type="button"
              :class="[
                'inline-flex rounded-md p-1.5',
                variants[variant].iconClass,
                'hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2',
                `focus:ring-${variant}-500`
              ]"
              @click="$emit('update:modelValue', false)"
            >
              <span class="sr-only">Dismiss</span>
              <!-- X icon -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script lang="ts">
  import { defineComponent, h } from 'vue'
  
  // Icons as render functions
  const icons = {
    success: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      class: 'h-5 w-5'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    error: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      class: 'h-5 w-5'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    info: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      class: 'h-5 w-5'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    warning: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      class: 'h-5 w-5'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      })
    ])
  }
  
  const variants = {
    success: {
      containerClass: 'bg-green-50 border-green-200',
      iconClass: 'text-green-600',
      textClass: 'text-green-800',
      icon: icons.success
    },
    error: {
      containerClass: 'bg-red-50 border-red-200',
      iconClass: 'text-red-600',
      textClass: 'text-red-800',
      icon: icons.error
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-200',
      iconClass: 'text-blue-600',
      textClass: 'text-blue-800',
      icon: icons.info
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-200',
      iconClass: 'text-yellow-600',
      textClass: 'text-yellow-800',
      icon: icons.warning
    }
  } as const
  
  export default defineComponent({
    name: 'BaseAlert',
  
    props: {
      modelValue: {
        type: Boolean,
        required: true
      },
      variant: {
        type: String as () => keyof typeof variants,
        default: 'info',
        validator: (value: string) => Object.keys(variants).includes(value)
      },
      title: {
        type: String,
        default: ''
      },
      message: {
        type: String,
        default: ''
      },
      dismissible: {
        type: Boolean,
        default: false
      },
      className: {
        type: String,
        default: ''
      }
    },
  
    emits: ['update:modelValue'],
  
    setup() {
      return {
        variants
      }
    }
  })
  </script>