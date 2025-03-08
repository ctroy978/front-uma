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
                    {{ isLoading ? '-' : reportsStore.reports.length }}
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

    <!-- Filter Section -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="(filter, index) in activeFilters"
          :key="index"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ filter.label }}: {{ filter.value }}
          <button type="button" @click="clearFilter(filter.key)" class="ml-1.5 inline-flex text-blue-500 hover:text-blue-700">
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
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
      <table v-else class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
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
                  <div class="text-sm text-gray-500">Grade {{ report.gradeLevel }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ report.textTitle }}</div>
              <div class="text-sm text-gray-500">{{ report.textType }}</div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { FileText, Users, XCircle, FileQuestion, User, AlertCircle } from 'lucide-vue-next';
import { useReportsStore } from '@/stores/reports';
import type { ReportListItem } from '@/stores/reports';

// State
const reportsStore = useReportsStore();
const isLoading = ref(true);
const error = ref('');

const filters = ref({
  studentId: '',
  dateRange: ''
});

// Computed properties
const uniqueStudents = computed(() => reportsStore.uniqueStudents);

const uniqueStudentCount = computed(() => uniqueStudents.value.length);

const hasActiveFilters = computed(() => 
  filters.value.studentId !== '' || 
  filters.value.dateRange !== ''
);

const activeFilters = computed(() => {
  const result = [];
  
  if (filters.value.studentId) {
    const student = uniqueStudents.value.find(s => s.id === filters.value.studentId);
    result.push({
      key: 'studentId',
      label: 'Student',
      value: student ? student.name : filters.value.studentId
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

const filteredReports = computed(() => {
  // Use the store's filterReports method with our filters
  return reportsStore.filterReports(
    filters.value.studentId, 
    'single', // Always filter for single reports
    filters.value.dateRange
  );
});

// Methods
const formatDate = (dateString: string) => {
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

const getScoreColorClass = (score: number) => {
  if (!score && score !== 0) return 'text-gray-500';
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const clearFilter = (key: string) => {
  (filters.value as any)[key] = '';
};

const downloadReport = (report: ReportListItem) => {
  // This is a placeholder for the actual download functionality
  console.log(`Downloading report: ${report.id}`);
  alert(`Report download functionality will be implemented here.`);
};

const fetchReports = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await reportsStore.fetchReports();
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch reports';
    console.error('Error loading reports:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for filter changes
watch(filters, () => {
  console.log('Filters changed:', filters.value);
}, { deep: true });

// Lifecycle
onMounted(async () => {
  await fetchReports();
});
</script>