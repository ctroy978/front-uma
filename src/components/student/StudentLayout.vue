<!-- src/components/student/StudentLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex">
      <!-- Sidebar -->
      <div class="hidden md:flex md:w-64 md:flex-col fixed h-full">
        <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <h2 class="text-lg font-semibold text-gray-900">Student Portal</h2>
          </div>

          <div class="mt-5 flex-grow flex flex-col">
            <nav class="flex-1 px-2 pb-4 space-y-1">
              <!-- Dashboard Link -->
              <router-link
                :to="{ name: 'student-dashboard' }"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="[
                  currentRoute === 'student-dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Home class="mr-3 h-5 w-5 text-gray-400" />
                <span class="truncate">Dashboard</span>
              </router-link>

              <!-- Completion Tests Link -->
              <router-link
                :to="{ name: 'student-completions' }"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="[
                  currentRoute === 'student-completions'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <ClipboardCheck class="mr-3 h-5 w-5 text-gray-400" />
                <span class="truncate">Completion Tests</span>
              </router-link>

              <!-- Teacher List Section -->
              <div class="px-2 py-4">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teachers
                </h3>
                <div class="mt-2">
                  <TeacherList 
                    :teachers="teachers"
                    :selected-teacher-id="selectedTeacherId"
                    :is-loading="isLoading"
                    @select="handleTeacherSelect"
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="md:pl-64 flex flex-col flex-1">
        <main class="flex-1">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <!-- Page header -->
              <div v-if="pageTitle" class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
              </div>
              
              <!-- Page content -->
              <div class="bg-white rounded-lg shadow">
                <router-view v-slot="{ Component }">
                  <transition
                    enter-active-class="transition-opacity duration-300"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-300"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <component :is="Component" />
                  </transition>
                </router-view>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, ClipboardCheck } from 'lucide-vue-next'
import TeacherList from './TeacherList.vue'
import { useStudentStore } from '@/stores/student'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()

// Computed properties
const currentRoute = computed(() => route.name as string)
const teachers = computed(() => studentStore.teachers)
const selectedTeacherId = computed(() => studentStore.selectedTeacherId)
const isLoading = computed(() => studentStore.isLoading)

// Page title based on route
const pageTitle = computed(() => {
  switch (route.name) {
    case 'student-dashboard':
      return 'Dashboard'
    case 'student-completions':
      return 'Completion Tests'
    case 'teacher-texts':
      return studentStore.selectedTeacher?.full_name ?? 'Teacher Texts'
    default:
      return ''
  }
})

// Methods
const handleTeacherSelect = (teacherId: string) => {
  studentStore.selectTeacher(teacherId)
  router.push({ 
    name: 'student-teacher-texts', 
    params: { id: teacherId }
  })
}

// Lifecycle
onMounted(async () => {
  try {
    await studentStore.fetchTeachers()
  } catch (error) {
    console.error('Failed to fetch teachers:', error)
  }
})
</script>