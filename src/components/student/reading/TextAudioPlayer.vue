<template>
  <div class="bg-white shadow rounded-lg p-4 mt-6">
    <!-- Title and Description -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-medium text-gray-900">Audio Playback</h3>
        <p class="text-xs text-gray-500">Listen to the text being read aloud</p>
      </div>
    </div>

    <!-- Audio Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="handlePlayPause"
          class="inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="isLoading || !!error"
        >
          <Play v-if="!isPlaying" class="h-5 w-5" />
          <Pause v-else class="h-5 w-5" />
          <span class="sr-only">{{ isPlaying ? 'Pause' : 'Play' }}</span>
        </button>

        <button
          @click="handleStop"
          class="inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="isLoading || !audioUrl || !!error"
        >
          <Square class="h-5 w-5" />
          <span class="sr-only">Stop</span>
        </button>
      </div>

      <!-- Loading Spinner -->
      <div v-if="isLoading" class="flex items-center text-sm text-gray-500">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
        Loading audio...
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2">
      <p class="text-sm text-red-600">{{ error }}</p>
      <button
        @click="retryAudio"
        class="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Try again
      </button>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioPlayer"
      :src="audioUrl || undefined"
      preload="auto"
      @ended="handleEnded"
      @error="handleAudioError"
      @canplay="handleCanPlay"
      class="hidden"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Play, Pause, Square } from 'lucide-vue-next'

const props = defineProps<{
  chunkId: string // The unique database ID of the text chunk
}>()

// State
const audioUrl = ref<string | undefined>(undefined)
const isLoading = ref(false)
const isPlaying = ref(false)
const error = ref<string | undefined>(undefined)
const audioPlayer = ref<HTMLAudioElement | null>(null)
let currentRequest: AbortController | null = null

// Clean up function for audio resources
const cleanup = () => {
  if (currentRequest) {
    currentRequest.abort()
    currentRequest = null
  }
  
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = undefined
  }
  
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  
  isPlaying.value = false
}

// Stream audio by chunk ID
const streamAudio = async () => {
  if (!props.chunkId) return
  
  // Clean up any existing request
  cleanup()
  
  isLoading.value = true
  error.value = undefined
  
  // Create new abort controller for this request
  currentRequest = new AbortController()


  
  try {
    const response = await fetch(`https://umaread.org/tts/stream_audio/${encodeURIComponent(props.chunkId)}`, {

      method: 'GET',
      headers: {
        'x-api-key': import.meta.env.VITE_AUD_KEY
      },
      signal: currentRequest.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    audioUrl.value = URL.createObjectURL(blob)
    
    // Don't automatically play - wait for canplay event
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Ignore abort errors
      return
    }
    console.error('Audio streaming error:', err)
    error.value = 'Error streaming audio. Please try again.'
  } finally {
    isLoading.value = false
    currentRequest = null
  }
}

// Handle successful audio load
const handleCanPlay = () => {
  if (audioPlayer.value && isPlaying.value) {
    audioPlayer.value.play()
  }
}

// Playback controls
const handlePlayPause = () => {
  if (!audioPlayer.value) return
  
  if (audioUrl.value) {
    if (isPlaying.value) {
      audioPlayer.value.pause()
      isPlaying.value = false
    } else {
      audioPlayer.value.play()
      isPlaying.value = true
    }
  } else {
    isPlaying.value = true // Set this first so audio plays when ready
    streamAudio()
  }
}

const handleStop = () => {
  if (!audioPlayer.value) return
  audioPlayer.value.pause()
  audioPlayer.value.currentTime = 0
  isPlaying.value = false
}

const handleEnded = () => {
  isPlaying.value = false
}

const handleAudioError = (e: Event) => {
  console.error('Audio playback error:', e)
  error.value = 'Error playing audio. Please try again.'
  isPlaying.value = false
}

const retryAudio = () => {
  error.value = undefined
  streamAudio()
}

// Watch for chunk ID changes
watch(() => props.chunkId, () => {
  cleanup()
}, { immediate: true })

// Clean up on component unmount
onBeforeUnmount(() => {
  cleanup()
})
</script>