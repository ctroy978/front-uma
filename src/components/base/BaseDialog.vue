<!-- src/components/base/BaseDialog.vue -->
<template>
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-25"></div>
  
        <!-- Dialog -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
            :class="className"
          >
            <!-- Title -->
            <div v-if="title" class="mb-4">
              <h3 class="text-lg font-medium leading-6 text-gray-900">
                {{ title }}
              </h3>
            </div>
  
            <!-- Content -->
            <div class="mt-2">
              <slot>{{ content }}</slot>
            </div>
  
            <!-- Footer -->
            <div v-if="$slots.footer" class="mt-6 flex justify-end space-x-3">
              <slot name="footer"></slot>
            </div>
  
            <!-- Default Footer -->
            <div v-else-if="showDefaultFooter" class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                @click="onCancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="{ 'bg-red-600 hover:bg-red-700': variant === 'danger' }"
                @click="onConfirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    name: 'BaseDialog',
  
    props: {
      modelValue: {
        type: Boolean,
        required: true
      },
      title: {
        type: String,
        default: ''
      },
      content: {
        type: String,
        default: ''
      },
      variant: {
        type: String,
        default: 'default',
        validator: (value: string) => ['default', 'danger'].includes(value)
      },
      confirmText: {
        type: String,
        default: 'Confirm'
      },
      cancelText: {
        type: String,
        default: 'Cancel'
      },
      showDefaultFooter: {
        type: Boolean,
        default: true
      },
      className: {
        type: String,
        default: ''
      }
    },
  
    emits: ['update:modelValue', 'confirm', 'cancel'],
  
    setup(props, { emit }) {
      const onConfirm = () => {
        emit('confirm')
      }
  
      const onCancel = () => {
        emit('update:modelValue', false)
        emit('cancel')
      }
  
      return {
        onConfirm,
        onCancel
      }
    }
  })
  </script>