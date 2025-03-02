<!-- src/views/teacher/SingleReportView.vue -->
<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-4 text-gray-500">Loading report...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
      <div class="flex">
        <AlertCircle class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error }}
          </p>
          <div class="mt-2">
            <button
              @click="goBack"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="report">
      <!-- Report Header -->
      <div class="mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Reading Assessment Report
            </h1>
            <p class="mt-2 text-gray-500">
              Single test report for {{ report.studentName }}
            </p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="printReport"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer class="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              @click="downloadPDF"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download class="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Report Overview -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Report Overview</h2>
        </div>
        <div class="px-6 py-5">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Student</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.studentName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Text Title</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.textTitle }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Completion Date</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(report.completionDate) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Overall Score</dt>
              <dd class="mt-1 text-sm font-medium" :class="getScoreColorClass(report.overallScore)">
                {{ report.overallScore }}%
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Duration</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDuration(report.duration) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Text Type</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.textType }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Grade Level</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.gradeLevel }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Questions</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.totalQuestions }} ({{ report.correctAnswers }} correct)</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Performance Chart -->
      <div v-if="report.categoryPerformance && report.categoryPerformance.length" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Performance by Category</h2>
        </div>
        <div class="px-6 py-5">
          <div class="h-64">
            <CategoryPerformanceChart :chartData="report.categoryPerformance" />
          </div>
        </div>
      </div>

      <!-- Reading Level Analysis -->
      <div v-if="report.analysis && report.analysis.readingLevelAnalysis" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Reading Level Analysis</h2>
        </div>
        <div class="px-6 py-5 prose max-w-none">
          <p>{{ report.analysis.readingLevelAnalysis }}</p>
        </div>
      </div>

      <!-- Text-Specific Insights -->
      <div v-if="report.analysis && report.analysis.textSpecificInsights" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Text-Specific Insights</h2>
        </div>
        <div class="px-6 py-5 prose max-w-none">
          <p>{{ report.analysis.textSpecificInsights }}</p>
        </div>
      </div>

      <!-- Recommended Activities -->
      <div v-if="report.analysis && report.analysis.recommendedActivities && report.analysis.recommendedActivities.length" class="bg-white shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Recommended Activities</h2>
        </div>
        <div class="px-6 py-5">
          <ul class="space-y-4">
            <li v-for="(activity, index) in report.analysis.recommendedActivities" :key="index" class="flex items-start">
              <div class="flex-shrink-0">
                <CheckCircle class="h-5 w-5 text-green-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-900">{{ activity }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <div v-else-if="!isLoading && !error" class="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
      <div class="flex flex-col items-center">
        <FileQuestion class="h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-lg font-medium text-gray-900">No report data available</h3>
        <p class="mt-1 text-sm text-gray-500">
          The report could not be loaded. Please try again or select a different report.
        </p>
        <button
          @click="goBack"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  AlertCircle, Printer, Download, CheckCircle, FileQuestion
} from 'lucide-vue-next';
import CategoryPerformanceChart from '@/components/teacher/reports/CategoryPerformanceChart.vue';
import { useReportsStore } from '@/stores/reports';

const route = useRoute();
const router = useRouter();
const reportsStore = useReportsStore();

// Get student ID and report ID from route parameters
const studentId = computed(() => route.params.studentId as string);
const reportId = computed(() => route.params.reportId as string);

// Get report data from store
const isLoading = computed(() => reportsStore.isLoading);
const error = computed(() => reportsStore.error);
const report = computed(() => reportsStore.currentSingleReport);

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

const formatDuration = (seconds: number) => {
  if (!seconds) return 'N/A';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

const getScoreColorClass = (score: number) => {
  if (!score && score !== 0) return 'text-gray-500';
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const printReport = () => {
  window.print();
};

const downloadPDF = () => {
  // This is a placeholder for the actual PDF download functionality
  alert('PDF download functionality will be implemented here.');
};

const goBack = () => {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push('/teacher/reports');
  }
};

// Fetch the report data when component mounts
onMounted(async () => {
  if (studentId.value && reportId.value) {
    try {
      await reportsStore.fetchSingleReport(studentId.value, reportId.value);
    } catch (err) {
      console.error('Failed to load single report:', err);
    }
  }
});

// React to changes in route params
watch([studentId, reportId], async ([newStudentId, newReportId]) => {
  if (newStudentId && newReportId) {
    try {
      await reportsStore.fetchSingleReport(newStudentId, newReportId);
    } catch (err) {
      console.error('Failed to load single report:', err);
    }
  }
});

// Clean up when component unmounts
onUnmounted(() => {
  reportsStore.clearCurrentReports();
});
</script>