<!-- src/views/student/TeacherTextsView.vue -->
<template>
    <div class="p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading texts...</p>
      </div>
  
      <!-- Error State -->
       <BaseAlert
        v-if="error"
        v-model="showError"
        variant="error"
        :message="error"
        dismissible
     ></BaseAlert>
  
      <!-- Content -->
      <div v-if="!isLoading" class="space-y-6">
        <!-- Teacher Stats -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center space-x-6">
            <div class="flex-shrink-0">
              <User class="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedTeacher?.full_name }}</h2>
              <p class="mt-1 text-sm text-gray-500">
                {{ selectedTeacher?.text_count }} texts available
              </p>
            </div>
          </div>
        </div>
  
        <!-- Filters -->
        <div class="bg-white shadow rounded-lg p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Search -->
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="search"
                id="search"
                v-model="filters.search"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search texts..."
              />
            </div>
  
            <!-- Grade Level -->
            <div>
              <label for="grade" class="block text-sm font-medium text-gray-700">Grade Level</label>
              <select
                id="grade"
                v-model="filters.gradeLevel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Grades</option>
                <option v-for="grade in gradeRange" :key="grade" :value="grade">
                  Grade {{ grade }}
                </option>
              </select>
            </div>
  
            <!-- Sort By -->
            <div>
              <label for="sort" class="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                id="sort"
                v-model="sorting.field"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="title" selected>Title</option>
                <option value="grade_level">Grade Level</option>
                <option value="created_at">Date Added</option>
              </select>
            </div>
  
            <!-- Sort Direction -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Direction</label>
              <div class="mt-1">
                <button
                  type="button"
                  @click="toggleSortDirection"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowUpDown v-if="sorting.direction === 'asc'" class="h-4 w-4 mr-2" />
                  <ArrowDownUp v-else class="h-4 w-4 mr-2" />
                  {{ sorting.direction === 'asc' ? 'Ascending' : 'Descending' }}
                </button>
              </div>
            </div>
          </div>
  
          <!-- Active Filters -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span
              v-if="filters.search"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Search: "{{ filters.search }}"
              <button
                type="button"
                class="ml-1 inline-flex"
                @click="filters.search = ''"
              >
                <X class="h-4 w-4" />
              </button>
            </span>
  
            <span
              v-if="filters.gradeLevel"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Grade {{ filters.gradeLevel }}
              <button
                type="button"
                class="ml-1 inline-flex"
                @click="filters.gradeLevel = ''"
              >
                <X class="h-4 w-4" />
              </button>
            </span>
          </div>
        </div>
  
        <!-- Text Grid -->
        <div 
          v-if="filteredTexts.length" 
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="text in filteredTexts"
            :key="text.id"
            class="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 truncate">{{ text.title }}</h3>
              <div class="mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Grade {{ text.grade_level }}
                </span>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="genre in text.genres"
                  :key="genre"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ genre }}
                </span>
              </div>
              <div class="mt-4">
                <button
                  type="button"
                  @click="startReading(text.id)"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Reading
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div
          v-else-if="!isLoading"
          class="text-center py-12 bg-white rounded-lg shadow"
        >
          <BookOpen class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No texts found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ hasActiveFilters ? 'Try adjusting your filters.' : 'This teacher hasn\'t published any texts yet.' }}
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { User, BookOpen, ArrowUpDown, ArrowDownUp, X } from 'lucide-vue-next'
  import { useStudentStore } from '@/stores/student'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  import type { Text } from '@/types/text'
  
  const props = defineProps<{
    id: string
  }>()
  
  const router = useRouter()
  const route = useRoute()
  const studentStore = useStudentStore()
  
  // State
  const error = ref('')
  const showError = ref(false)
  const texts = ref<Text[]>([])
  const isLoading = ref(true)
  
  const filters = ref({
    search: '',
    gradeLevel: ''
  })
  
  // Define valid sort fields
  type SortableField = 'title' | 'grade_level' | 'created_at';
  
  const sorting = ref({
    field: 'created_at' as SortableField,
    direction: 'desc' as 'asc' | 'desc'
  })
  
  // Grade range for filter
  const gradeRange = Array.from({ length: 11 }, (_, i) => i + 2)
  
  // Computed
  const selectedTeacher = computed(() => studentStore.selectedTeacher)
  
  const hasActiveFilters = computed(() => 
    filters.value.search || filters.value.gradeLevel
  )
  
  const filteredTexts = computed(() => {
    let result = [...texts.value]
  
    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      result = result.filter(text => 
        text.title.toLowerCase().includes(searchTerm)
      )
    }
  
    // Apply grade level filter
    if (filters.value.gradeLevel) {
      result = result.filter(text => 
        text.grade_level === parseInt(filters.value.gradeLevel)
      )
    }
  
    // Apply sorting
    result.sort((a, b) => {
      const modifier = sorting.value.direction === 'asc' ? 1 : -1
      const field = sorting.value.field
      
      // Type-safe comparison based on field
      switch (field) {
        case 'title':
          return a.title.localeCompare(b.title) * modifier
        case 'grade_level':
          return (a.grade_level - b.grade_level) * modifier
        case 'created_at':
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier
        default:
          return 0
      }
    })
  
    return result
  })
  
  // Methods
  const fetchTexts = async () => {
    isLoading.value = true
    error.value = ''
    showError.value = false
  
    try {
      const response = await studentStore.fetchTeacherTexts(props.id)
      texts.value = response.texts
    } catch (e: any) {
      error.value = e.message || 'Failed to load texts'
      showError.value = true
    } finally {
      isLoading.value = false
    }
  }
  
  const toggleSortDirection = () => {
    sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  }
  
  const startReading = (textId: string) => {
    router.push({ 
      name: 'student-assessment',
      params: { textId }
    })
  }
  
  // Lifecycle
  onMounted(async () => {
    if (!studentStore.selectedTeacher) {
      studentStore.selectTeacher(props.id)
    }
    await fetchTexts()
  })
  
  // Watch for teacher change
  watch(() => props.id, async (newId) => {
    if (newId) {
      await fetchTexts()
    }
  })
  </script>