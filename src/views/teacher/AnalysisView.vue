<!-- src/views/teacher/AnalysisView.vue -->
<template>
  <div class="p-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
      <!-- Available Reports Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <FileText class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Available Reports
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ isLoading ? '-' : filteredReports.length }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Students with Reports
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ isLoading ? '-' : uniqueStudentCount }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Filter Section -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Student Filter -->
        <div>
          <label for="student-filter" class="block text-sm font-medium text-gray-700">Student</label>
          <select
            id="student-filter"
            v-model="filters.studentId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Students</option>
            <option v-for="student in uniqueStudents" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>

        <!-- Text Title Filter -->
        <div>
          <label for="text-filter" class="block text-sm font-medium text-gray-700">Text Title</label>
          <select
            id="text-filter"
            v-model="filters.textTitle"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Texts</option>
            <option v-for="text in availableTexts" :key="text.id" :value="text.title">
              {{ text.title }}
            </option>
          </select>
        </div>

        <!-- Grade Level Filter -->
        <div>
          <label for="grade-filter" class="block text-sm font-medium text-gray-700">Grade Level</label>
          <select
            id="grade-filter"
            v-model="filters.gradeLevel"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option :value="null">All Grades</option>
            <option v-for="grade in availableGradeLevels" :key="grade" :value="grade">
              Grade {{ grade }}
            </option>
          </select>
        </div>

        <!-- Date Range Filter -->
        <div>
          <label for="date-filter" class="block text-sm font-medium text-gray-700">Date Range</label>
          <select
            id="date-filter"
            v-model="filters.dateRange"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
        
        <!-- Sort By -->
        <div>
          <label for="sort-by" class="block text-sm font-medium text-gray-700">Sort By</label>
          <select
            id="sort-by"
            v-model="filters.sortBy"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="date">Completion Date</option>
            <option value="studentName">Student Name</option>
            <option value="textTitle">Text Title</option>
            <option value="score">Score</option>
            <option value="gradeLevel">Grade Level</option>
          </select>
        </div>
        
        <!-- Sort Order -->
        <div>
          <label for="sort-order" class="block text-sm font-medium text-gray-700">Sort Order</label>
          <select
            id="sort-order"
            v-model="filters.sortOrder"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="(filter, index) in activeFilters"
          :key="index"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ filter.label }}: {{ filter.value }}
          <button 
            type="button" 
            @click="clearFilter(filter.key)" 
            class="ml-1.5 inline-flex text-blue-500 hover:text-blue-700"
            aria-label="Remove filter"
          >
            <XCircle class="h-4 w-4" />
          </button>
        </span>
      </div>
    </div>

    <!-- Reports Table -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Reading Assessment Reports</h2>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="px-6 py-12 text-center">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-4 text-gray-500">Loading reports...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="px-6 py-12 text-center">
        <AlertCircle class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Error loading reports</h3>
        <p class="mt-1 text-sm text-red-500">{{ error }}</p>
        <button
          @click="fetchReports"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredReports.length === 0" class="px-6 py-12 text-center">
        <FileQuestion class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ hasActiveFilters ? 'Try adjusting your filters or wait for more assessments to be completed.' : 'Students have not completed any assessments yet.' }}
        </p>
      </div>

      <!-- Reports Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="updateSort('studentName')">
                Student
                <span v-if="filters.sortBy === 'studentName'" class="ml-1">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="updateSort('textTitle')">
                Text
                <span v-if="filters.sortBy === 'textTitle'" class="ml-1">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="updateSort('gradeLevel')">
                Grade
                <span v-if="filters.sortBy === 'gradeLevel'" class="ml-1">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="updateSort('date')">
                Date
                <span v-if="filters.sortBy === 'date'" class="ml-1">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="updateSort('score')">
                Score
                <span v-if="filters.sortBy === 'score'" class="ml-1">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="report in filteredReports" :key="report.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                    <User class="h-6 w-6 text-blue-600" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ report.studentName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ report.textTitle }}</div>
                <div class="text-sm text-gray-500">{{ report.textType }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Grade {{ report.gradeLevel }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(report.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div 
                  class="text-sm font-medium"
                  :class="getScoreColorClass(report.score)"  
                >
                  {{ report.score }}%
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link 
                  :to="{ 
                    name: 'single-report', 
                    params: { 
                      studentId: report.studentId, 
                      reportId: report.id 
                    }
                  }"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  View
                </router-link>
                <button
                  @click="downloadReport(report)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Download
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { FileText, Users, XCircle, FileQuestion, User, AlertCircle } from 'lucide-vue-next';
import { useReportsStore } from '@/stores/reports';
import type { ReportListItem } from '@/stores/reports';

// Define the store
const reportsStore = useReportsStore();
const isLoading = ref(true);
const error = ref('');

// Define the filter state type
interface FilterState {
  studentId: string;
  dateRange: string;
  textTitle: string;
  gradeLevel: number | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initialize filter state
const filters = ref<FilterState>({
  studentId: '',
  dateRange: '',
  textTitle: '',
  gradeLevel: null,
  sortBy: 'date',
  sortOrder: 'desc'
});

// Get store data
const uniqueStudents = computed(() => reportsStore.uniqueStudents);
const availableTexts = computed(() => reportsStore.availableTexts);
const availableGradeLevels = computed(() => reportsStore.availableGradeLevels);
const uniqueStudentCount = computed(() => uniqueStudents.value.length);

// Check if there are any active filters
const hasActiveFilters = computed(() => 
  filters.value.studentId !== '' || 
  filters.value.dateRange !== '' ||
  filters.value.textTitle !== '' ||
  filters.value.gradeLevel !== null
);

// Define the active filter type
interface ActiveFilter {
  key: keyof FilterState;
  label: string;
  value: string;
}

// Get active filters as an array
const activeFilters = computed<ActiveFilter[]>(() => {
  const result: ActiveFilter[] = [];
  
  if (filters.value.studentId) {
    const student = uniqueStudents.value.find(s => s.id === filters.value.studentId);
    result.push({
      key: 'studentId',
      label: 'Student',
      value: student ? student.name : filters.value.studentId
    });
  }
  
  if (filters.value.textTitle) {
    result.push({
      key: 'textTitle',
      label: 'Text',
      value: filters.value.textTitle
    });
  }
  
  if (filters.value.gradeLevel !== null) {
    result.push({
      key: 'gradeLevel',
      label: 'Grade',
      value: `Grade ${filters.value.gradeLevel}`
    });
  }
  
  if (filters.value.dateRange) {
    result.push({
      key: 'dateRange',
      label: 'Date Range',
      value: `Last ${filters.value.dateRange} days`
    });
  }
  
  return result;
});

// Get filtered reports based on current filters
const filteredReports = computed(() => {
  return reportsStore.reports.filter(report => {
    // Apply student filter
    if (filters.value.studentId && report.studentId !== filters.value.studentId) {
      return false;
    }
    
    // Apply text title filter
    if (filters.value.textTitle && 
        (!report.textTitle || !report.textTitle.toLowerCase().includes(filters.value.textTitle.toLowerCase()))) {
      return false;
    }
    
    // Apply grade level filter
    if (filters.value.gradeLevel !== null && report.gradeLevel !== filters.value.gradeLevel) {
      return false;
    }
    
    // Apply date range filter
    if (filters.value.dateRange) {
      const daysAgo = parseInt(filters.value.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      const reportDate = new Date(report.date);
      if (reportDate < cutoffDate) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    let valueA: any, valueB: any;
    
    switch (filters.value.sortBy) {
      case 'studentName':
        valueA = a.studentName || '';
        valueB = b.studentName || '';
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return filters.value.sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        break;
      case 'textTitle':
        valueA = a.textTitle || '';
        valueB = b.textTitle || '';
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return filters.value.sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        break;
      case 'score':
        valueA = a.score || 0;
        valueB = b.score || 0;
        return filters.value.sortOrder === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      case 'gradeLevel':
        valueA = a.gradeLevel || 0;
        valueB = b.gradeLevel || 0;
        return filters.value.sortOrder === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      case 'date':
      default:
        valueA = new Date(a.date || 0).getTime();
        valueB = new Date(b.date || 0).getTime();
        return filters.value.sortOrder === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
    }
    
    // Default fallback
    return 0;
  });
});

// Methods
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

const getScoreColorClass = (score: number): string => {
  if (!score && score !== 0) return 'text-gray-500';
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const clearFilter = (key: keyof FilterState): void => {
  if (key === 'gradeLevel') {
    filters.value.gradeLevel = null;
  } else if (key === 'sortOrder') {
    filters.value.sortOrder = 'desc';
  } else {
    filters.value[key] = '';
  }
};

const updateSort = (field: string): void => {
  if (filters.value.sortBy === field) {
    // Toggle sort order if clicking the same field
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort field and default to descending
    filters.value.sortBy = field;
    filters.value.sortOrder = 'desc';
  }
};

const downloadReport = (report: ReportListItem): void => {
  // This is a placeholder for the actual download functionality
  console.log(`Downloading report: ${report.id}`);
  alert(`Report download functionality will be implemented here.`);
};

const fetchReports = async (): Promise<void> => {
  isLoading.value = true;
  error.value = '';
  
  try {
    // Fetch reports (backend automatically filters by teacher_id)
    await reportsStore.fetchReports();
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch reports';
    console.error('Error loading reports:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for filter changes and log them for debugging
watch(filters, () => {
  console.log('Filters changed:', filters.value);
}, { deep: true });

// Fetch reports when component mounts
onMounted(async () => {
  await fetchReports();
});
</script>