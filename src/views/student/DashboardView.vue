<!-- src/views/student/DashboardView.vue -->
<template>
    <div class="p-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Total Teachers Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Users class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Available Teachers
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ isLoading ? '-' : teachers.length }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Total Texts Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BookOpen class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Available Texts
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ isLoading ? '-' : totalTexts }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Most Active Teacher Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BookOpen class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                     Your reading assistant
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      uMa<!--{{ isLoading ? '-' : mostActiveTeacher?.full_name || 'None' }}-->
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Featured Teachers Section -->
      <div class="mt-8">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h2 class="text-xl font-semibold text-gray-900">Featured Teachers</h2>
            <p class="mt-2 text-sm text-gray-700">
              Teachers with the most available reading materials.
            </p>
          </div>
        </div>
  
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="teacher in topTeachers"
            :key="teacher.id"
            class="relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <User class="h-10 w-10 text-gray-400" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ teacher.full_name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ teacher.text_count }} texts available
                </p>
              </div>
            </div>
            <div class="mt-4">
              <button
                type="button"
                @click="viewTeacher(teacher.id)"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Texts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Users, BookOpen, Trophy, User } from 'lucide-vue-next'
  import { useStudentStore } from '@/stores/student'
  
  const router = useRouter()
  const studentStore = useStudentStore()
  
  // Computed properties
  const isLoading = computed(() => studentStore.isLoading)
  const teachers = computed(() => studentStore.teachers)
  
  const totalTexts = computed(() => 
    teachers.value.reduce((sum, teacher) => sum + teacher.text_count, 0)
  )
  
  const mostActiveTeacher = computed(() => 
    [...teachers.value].sort((a, b) => b.text_count - a.text_count)[0]
  )
  
  const topTeachers = computed(() => 
    [...teachers.value]
      .sort((a, b) => b.text_count - a.text_count)
      .slice(0, 6)
  )
  
  // Methods
  const viewTeacher = (teacherId: string) => {
    studentStore.selectTeacher(teacherId)
    router.push({ 
      name: 'teacher-texts',
      params: { id: teacherId }
    })
  }
  </script>