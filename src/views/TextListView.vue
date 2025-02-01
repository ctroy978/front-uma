<!-- src/views/TextListView.vue -->
<template>
    <div class="p-6">
      <!-- Filters Section -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <!-- Grade Level Filter -->
          <div>
            <label for="grade-filter" class="block text-sm font-medium text-gray-700">Grade Level</label>
            <select
              id="grade-filter"
              v-model="filters.grade_level"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Grades</option>
              <option v-for="grade in gradeRange" :key="grade" :value="grade">
                Grade {{ grade }}
              </option>
            </select>
          </div>
  
          <!-- Form Filter -->
          <div>
            <label for="form-filter" class="block text-sm font-medium text-gray-700">Form</label>
            <select
              id="form-filter"
              v-model="filters.form"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Forms</option>
              <option v-for="form in TextForm" :key="form" :value="form">
                {{ form }}
              </option>
            </select>
          </div>
  
          <!-- Type Filter -->
          <div>
            <label for="type-filter" class="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type-filter"
              v-model="filters.type"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option v-for="type in PrimaryType" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
  
          <!-- Genre Filter -->
          <div>
            <label for="genre-filter" class="block text-sm font-medium text-gray-700">Genre</label>
            <select
              id="genre-filter"
              v-model="filters.genre"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Genres</option>
              <option v-for="genre in Genre" :key="genre" :value="genre">
                {{ genre }}
              </option>
            </select>
          </div>
        </div>
  
        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="(value, key) in activeFilters"
            :key="key"
            @click="clearFilter(key)"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ formatFilterLabel(key, value) }}
            <XCircle class="ml-1.5 h-4 w-4" />
          </button>
        </div>
      </div>
  
      <!-- Texts Table -->
      <div class="bg-white shadow-sm rounded-lg">
        <div class="mb-4 px-6 py-4 border-b border-gray-200">
          <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
              <h2 class="text-xl font-semibold text-gray-900">Your Texts</h2>
              <p class="mt-2 text-sm text-gray-700">
                A list of all your reading texts including their grade level, type, and creation date.
              </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <router-link
                :to="{ name: 'create-text' }"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Add New Text
              </router-link>
            </div>
          </div>
        </div>
  
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.field"
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                <div 
                  class="group inline-flex items-center cursor-pointer"
                  @click="handleSort(column.field)"
                >
                  {{ column.label }}
                  <span v-if="column.sortable" class="ml-2 flex-none rounded text-gray-400">
                    <template v-if="sort.field === column.field">
                      <ChevronUp v-if="sort.direction === 'asc'" :size="16" />
                      <ChevronDown v-else :size="16" />
                    </template>
                    <ChevronsUpDown v-else :size="16"  />
                  </span>
                </div>
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="isLoading">
              <td colspan="6" class="px-3 py-4 text-sm text-gray-500 text-center">
                Loading texts...
              </td>
            </tr>
            <tr v-else-if="!filteredTexts.length">
              <td colspan="6" class="px-3 py-4 text-sm text-gray-500 text-center">
                No texts found. Create your first text to get started.
              </td>
            </tr>
            <tr v-for="text in filteredTexts" :key="text.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {{ text.title }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                Grade {{ text.grade_level }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ text.form }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ text.primary_type }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="genre in text.genres"
                    :key="genre"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ genre }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ formatDate(text.created_at) }}
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                <router-link
                  :to="{ 
                    name: 'view-text', 
                    params: { id: text.id },
                    query: { from: 'teacher-texts' }
                  }"
                  class="text-blue-600 hover:text-blue-900"
                >
                  View
                </router-link>
                <router-link
                  :to="{ name: 'edit-text', params: { id: text.id }}"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  //import { ChevronUp, ChevronDown, ChevronsUpDown, XCircle } from 'lucide-react'
  import { ChevronUp, ChevronDown, ChevronsUpDown, XCircle } from 'lucide-vue-next'
  import { useTextStore } from '../stores/text'
  import { TextForm, PrimaryType, Genre } from '../types/text'
  import type { Text } from '../types/text'
  
  const textStore = useTextStore()
  const isLoading = ref(true)
  
  // Table columns configuration
  const columns = [
    { field: 'title', label: 'Title', sortable: true },
    { field: 'grade_level', label: 'Grade Level', sortable: true },
    { field: 'form', label: 'Form', sortable: true },
    { field: 'primary_type', label: 'Type', sortable: true },
    { field: 'genres', label: 'Genres', sortable: false },
    { field: 'created_at', label: 'Created', sortable: true }
  ] as const
  
  // Sorting
  const sort = ref({
    field: 'created_at' as keyof Text,
    direction: 'desc' as 'asc' | 'desc'
  })
  
  // Filters
  const filters = ref({
    grade_level: '',
    form: '',
    type: '',
    genre: ''
  })
  
  // Grade range for filter
  const gradeRange = Array.from({ length: 11 }, (_, i) => i + 2)
  
  // Computed
  const hasActiveFilters = computed(() => 
    Object.values(filters.value).some(value => value !== '')
  )
  
  const activeFilters = computed(() => {
    return Object.entries(filters.value)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => {
        acc[key as FilterKey] = value
        return acc
      }, {} as Record<FilterKey, string>)
  })
  
  const filteredTexts = computed(() => {
    let result = [...textStore.texts]
  
    // Apply filters
    if (filters.value.grade_level) {
      result = result.filter(text => 
        text.grade_level === parseInt(filters.value.grade_level)
      )
    }
    if (filters.value.form) {
      result = result.filter(text => 
        text.form === filters.value.form
      )
    }
    if (filters.value.type) {
      result = result.filter(text => 
        text.primary_type === filters.value.type
      )
    }
    if (filters.value.genre) {
      result = result.filter(text => 
        text.genres.includes(filters.value.genre as Genre)
      )
    }
  
    // Apply sorting
    return result.sort((a, b) => {
      const aValue = a[sort.value.field]
      const bValue = b[sort.value.field]
      const modifier = sort.value.direction === 'asc' ? 1 : -1
  
      if (aValue < bValue) return -1 * modifier
      if (aValue > bValue) return 1 * modifier
      return 0
    })
  })
  
  // Methods
  const handleSort = (field: keyof Text) => {
    if (sort.value.field === field) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.field = field
      sort.value.direction = 'asc'
    }
  }
  
  type FilterKey = keyof typeof filters.value
  
  const clearFilter = (key: FilterKey) => {
    filters.value[key] = ''
  }
  
  const formatFilterLabel = (key: FilterKey, value: string) => {
    switch (key) {
      case 'grade_level':
        return `Grade: ${value}`
      case 'form':
        return `Form: ${value}`
      case 'type':
        return `Type: ${value}`
      case 'genre':
        return `Genre: ${value}`
      default:
        return `${key}: ${value}`
    }
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Lifecycle
  onMounted(async () => {
    try {
      await textStore.fetchTexts()
    } catch (error) {
      console.error('Error loading texts:', error)
    } finally {
      isLoading.value = false
    }
  })
  </script>