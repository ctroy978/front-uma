<!-- src/components/student/reading/DictionaryPanel.vue -->
<template>
    <div class="bg-white shadow rounded-lg p-4 mt-4">
      <!-- Title and Description -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-medium text-gray-900">Dictionary</h3>
          <p class="text-xs text-gray-500">Double-click any word in the text to see its definition</p>
        </div>
        <button 
          v-if="selectedWord"
          @click="clearWord"
          class="text-xs text-gray-400 hover:text-gray-600"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
  
      <!-- Empty State -->
      <div v-if="!selectedWord && !isLoading" class="text-center py-6 text-gray-500">
        <BookOpen class="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p class="text-sm">Double-click any word to see its definition</p>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
        <p class="mt-2 text-sm text-gray-500">Looking up "{{ selectedWord }}"</p>
      </div>
  
      <!-- Error State -->
      <div v-if="error && !isLoading" class="p-4 rounded-md bg-red-50 text-red-700 text-sm">
        <p>{{ error }}</p>
        <button 
          @click="retryLookup"
          class="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          Try again
        </button>
      </div>
  
      <!-- Word Definition -->
      <div v-if="wordData && !isLoading && !error" class="space-y-4">
        <!-- Word and Pronunciation -->
        <div>
          <div class="flex items-center">
            <h3 class="text-xl font-semibold text-gray-900">{{ wordData.word }}</h3>
            <span v-if="wordData.phonetic" class="ml-2 text-sm text-gray-500">
              {{ wordData.phonetic }}
            </span>
          </div>
          
          <!-- Audio Player (if available) -->
          <div v-if="audioUrl" class="mt-2">
            <button 
              @click="playAudio"
              class="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <Volume2 class="h-3 w-3 mr-1" />
              Listen
            </button>
          </div>
        </div>
  
        <!-- Definitions -->
        <div v-if="wordData.meanings && wordData.meanings.length > 0" class="space-y-3">
          <div 
            v-for="(meaning, meaningIndex) in wordData.meanings.slice(0, 3)" 
            :key="meaningIndex" 
            class="border-b border-gray-100 pb-2"
          >
            <span class="text-xs font-medium text-gray-500 mb-1 block">
              {{ meaning.partOfSpeech }}
            </span>
            
            <div 
              v-for="(def, defIndex) in meaning.definitions.slice(0, 2)" 
              :key="defIndex"
              class="mb-2"
            >
              <p class="text-sm text-gray-800">{{ def.definition }}</p>
              
              <!-- Example (if available) -->
              <p v-if="def.example" class="text-xs italic text-gray-600 mt-1">
                "{{ def.example }}"
              </p>
            </div>
            
            <!-- Synonyms -->
            <div 
              v-if="meaning.synonyms && meaning.synonyms.length > 0" 
              class="mt-1"
            >
              <span class="text-xs text-gray-500">Synonyms: </span>
              <span class="text-xs text-blue-600">
                {{ meaning.synonyms.slice(0, 5).join(', ') }}
              </span>
            </div>
          </div>
        </div>
  
        <!-- Source -->
        <div v-if="wordData.sourceUrls && wordData.sourceUrls.length > 0" class="text-xs text-gray-500">
          <a 
            :href="wordData.sourceUrls[0]" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
          >
            Source: {{ getHostname(wordData.sourceUrls[0]) }}
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { BookOpen, X, Volume2 } from 'lucide-vue-next'
  
  // Props
  const props = defineProps<{
    selectedWord: string | null
    isLoading: boolean
    error: string | null
    wordData: any | null
  }>()
  
  // Emit events to parent
  const emit = defineEmits<{
    (e: 'clear'): void
    (e: 'retry'): void
  }>()
  
  // Methods
  const clearWord = () => {
    emit('clear')
  }
  
  const retryLookup = () => {
    emit('retry')
  }
  
  // Get audio URL from phonetics if available
  const audioUrl = computed(() => {
    if (!props.wordData || !props.wordData.phonetics) return null
    
    // Find the first phonetic entry with a non-empty audio URL
    const phonetic = props.wordData.phonetics.find((p: {audio?: string}) => p.audio && p.audio.trim() !== '')
    return phonetic ? phonetic.audio : null
  })
  
  // Play audio pronunciation
  const playAudio = () => {
    if (audioUrl.value) {
      const audio = new Audio(audioUrl.value)
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
      })
    }
  }
  
  // Extract hostname from URL string
  const getHostname = (urlString: string): string => {
    try {
      // Using window.URL to avoid TypeScript issues
      return new window.URL(urlString).hostname
    } catch (error) {
      // Return the URL as-is if it's not a valid URL
      return 'source'
    }
  }
  </script>