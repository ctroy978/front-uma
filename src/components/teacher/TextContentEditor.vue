<!-- src/components/teacher/TextContentEditor.vue -->
<template>
    <div class="space-y-6">
      <!-- Title Input -->
      <BaseInput
        name="title"
        label="Title"
        v-model="title"
        :error="errors.title"
        @blur="validateTitle"
        required
      />
  
      <!-- Content Editor -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label for="content" class="block text-sm font-medium text-gray-700">
            Content
            <span class="text-red-500 ml-1">*</span>
          </label>
          <!-- Word Count Display -->
          <div class="text-sm text-gray-500 flex gap-4">
            <span :class="{ 'text-red-600': isOverWordLimit }">
              {{ totalWordCount }} / 10,000 words
            </span>
            <span :class="{ 'text-red-600': isOverSizeLimit }">
              {{ (contentSize / 1024).toFixed(1) }}KB / 100KB
            </span>
          </div>
        </div>
  
        <!-- Editor Area -->
        <div class="relative">
          <textarea
            id="content"
            v-model="content"
            rows="15"
            class="block w-full rounded-md shadow-sm text-gray-900 font-mono whitespace-pre border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'border-red-300': errors.content }"
            @input="handleContentChange"
            placeholder="Enter your text here. Use <chunk> tags to separate content."
          ></textarea>
  
          <!-- Warning Messages -->
          <div v-if="isOverWordLimit || isOverSizeLimit" class="absolute right-0 mt-2">
            <div class="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">
              <p v-if="isOverWordLimit">
                Content exceeds 10,000 word limit
              </p>
              <p v-if="isOverSizeLimit">
                Content exceeds 100KB size limit
              </p>
            </div>
          </div>
        </div>
  
        <!-- Validation Error -->
        <p v-if="errors.content" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.content }}
        </p>
  
        <!-- Helper Text -->
        <div class="mt-4 rounded-md bg-blue-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Info class="h-5 w-5 text-blue-400" />
            </div>
            <div class="ml-3 flex-1 md:flex md:justify-between">
              <p class="text-sm text-blue-700">
                Wrap sections of text in &lt;chunk&gt; tags. Example:<br />
                &lt;chunk&gt;<br />
                Your text content here...<br />
                &lt;/chunk&gt;
              </p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Preview Panel -->
      <div v-if="showPreview && !hasChunkErrors" class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Content Preview</h3>
        <div class="space-y-4">
          <div v-for="(chunk, index) in parsedChunks" :key="index" class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-sm font-medium text-gray-500 mb-2">Chunk {{ index + 1 }}</h4>
            <div class="whitespace-pre-wrap text-gray-900">{{ chunk }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Info } from 'lucide-vue-next'
  import BaseInput from '@/components/base/BaseInput.vue'
  
  interface Errors {
    title: string;
    content: string;
  }
  
  interface ContentData {
    title: string;
    content: string;
    isValid: boolean;
  }
  
  // Props and emits
  const props = defineProps<{
    showPreview?: boolean;
    initialContent?: {
      title?: string;
      content?: string;
    };
  }>()
  
  const emit = defineEmits<{
    (e: 'update:content', data: ContentData): void;
  }>()
  
  // State
  const title = ref(props.initialContent?.title || '')
  const content = ref(props.initialContent?.content || '')
  const errors = ref<Errors>({
    title: '',
    content: ''
  })
  
  // Computed properties
  const contentSize = computed(() => new Blob([content.value]).size)
  const isOverSizeLimit = computed(() => contentSize.value > 102400) // 100KB in bytes
  
  const totalWordCount = computed(() => {
    const text = content.value.replace(/<\/?chunk>/g, ' ')
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  })
  
  const isOverWordLimit = computed(() => totalWordCount.value > 10000)
  
  const parsedChunks = computed(() => {
    const chunkRegex = /<chunk>([\s\S]*?)<\/chunk>/g
    const chunks: string[] = []
    let match
  
    while ((match = chunkRegex.exec(content.value)) !== null) {
      chunks.push(match[1].trim())
    }
  
    return chunks
  })
  
  const hasChunkErrors = computed(() => {
    const openTags = (content.value.match(/<chunk>/g) || []).length
    const closeTags = (content.value.match(/<\/chunk>/g) || []).length
    return openTags !== closeTags || openTags === 0
  })
  
  // Methods
  const validateTitle = () => {
    errors.value.title = ''
    if (!title.value.trim()) {
      errors.value.title = 'Title is required'
    }
  }
  
  const validateContent = () => {
    errors.value.content = ''
    
    if (!content.value.trim()) {
      errors.value.content = 'Content is required'
      return
    }
  
    if (hasChunkErrors.value) {
      errors.value.content = 'Content must be properly wrapped in <chunk> tags'
      return
    }
  
    if (isOverWordLimit.value) {
      errors.value.content = 'Content exceeds maximum word limit'
      return
    }
  
    if (isOverSizeLimit.value) {
      errors.value.content = 'Content exceeds maximum size limit'
      return
    }
  }
  
  const handleContentChange = () => {
    validateContent()
    emitUpdate()
  }
  
  const emitUpdate = () => {
    const isValid = !errors.value.title && !errors.value.content
    emit('update:content', {
      title: title.value,
      content: content.value,
      isValid
    })
  }
  
  // Watchers
  watch(title, () => {
    validateTitle()
    emitUpdate()
  })
  
  // Initialize validation
  validateTitle()
  validateContent()
  </script>