<!-- src/views/teacher/CumulativeReportView.vue -->
<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-4 text-gray-500">Loading cumulative report...</p>
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

    <!-- Not Enough Data State -->
    <div v-else-if="insufficientData" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
      <div class="flex">
        <AlertTriangle class="h-5 w-5 text-yellow-400" />
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Insufficient data for cumulative report. A minimum of 7 completed tests are required for meaningful analysis.
          </p>
          <p class="text-sm text-yellow-700 mt-1">
            Current completed tests: {{ currentTestsCount || 0 }}
          </p>
          <div class="mt-2">
            <button
              @click="goBack"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
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
              Cumulative Reading Assessment Report
            </h1>
            <p class="mt-2 text-gray-500">
              Long-term analysis for {{ report.studentName }}
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
              <dt class="text-sm font-medium text-gray-500">Grade Level</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.gradeLevel }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Report Period</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Average Score</dt>
              <dd class="mt-1 text-sm font-medium" :class="getScoreColorClass(report.averageScore)">
                {{ report.averageScore }}%
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Tests Included</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.testsCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Texts Read</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.textsCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Time Period</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ report.daysCovered }} days</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Reading Growth</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span :class="report.growth > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ report.growth > 0 ? '+' : '' }}{{ report.growth }}%
                </span>
                since first test
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Progress Over Time Chart -->
      <div v-if="report.progressionData && report.progressionData.length" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Progress Over Time</h2>
        </div>
        <div class="px-6 py-5">
          <div class="h-64">
            <ProgressionChart :chartData="report.progressionData" />
          </div>
        </div>
      </div>
      
      <!-- Category Performance Chart -->
      <div v-if="report.categoryTrends && report.categoryTrends.length" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Category Performance Trends</h2>
        </div>
        <div class="px-6 py-5">
          <div class="h-64">
            <CategoryTrendsChart :chartData="report.categoryTrends" />
          </div>
        </div>
      </div>

      <!-- Progression Analysis -->
      <div v-if="report.analysis && report.analysis.progressionAnalysis" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Progression Analysis</h2>
        </div>
        <div class="px-6 py-5 prose max-w-none">
          <p>{{ report.analysis.progressionAnalysis }}</p>
        </div>
      </div>

      <!-- Text Performance Insights -->
      <div v-if="report.analysis && report.analysis.textPerformanceInsights" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Text Performance Insights</h2>
        </div>
        <div class="px-6 py-5 prose max-w-none">
          <p>{{ report.analysis.textPerformanceInsights }}</p>
        </div>
      </div>

      <!-- Development Recommendations -->
      <div v-if="report.analysis && report.analysis.developmentRecommendations && report.analysis.developmentRecommendations.length" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Development Recommendations</h2>
        </div>
        <div class="px-6 py-5">
          <ul class="space-y-4">
            <li v-for="(recommendation, index) in report.analysis.developmentRecommendations" :key="index" class="flex items-start">
              <div class="flex-shrink-0">
                <TrendingUp class="h-5 w-5 text-blue-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-900">{{ recommendation }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Teaching Strategies -->
      <div v-if="report.analysis && report.analysis.teachingStrategies && report.analysis.teachingStrategies.length" class="bg-white shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Evidence-Based Teaching Strategies</h2>
        </div>
        <div class="px-6 py-5">
          <ul class="space-y-4">
            <li v-for="(strategy, index) in report.analysis.teachingStrategies" :key="index" class="flex items-start">
              <div class="flex-shrink-0">
                <Lightbulb class="h-5 w-5 text-yellow-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-900">{{ strategy }}</p>
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
          The report could not be loaded. Please try again or select a different student.
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
import { computed, onMounted, onUnmounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  AlertCircle, AlertTriangle, Printer, Download, 
  TrendingUp, Lightbulb, FileQuestion
} from 'lucide-vue-next';
import ProgressionChart from '@/components/teacher/reports/ProgressionChart.vue';
import CategoryTrendsChart from '@/components/teacher/reports/CategoryTrendsChart.vue';
import { useReportsStore } from '@/stores/reports';

const route = useRoute();
const router = useRouter();
const reportsStore = useReportsStore();
const currentTestsCount = ref(0);

// Get student ID and report ID from route parameters
const studentId = computed(() => route.params.studentId as string);
const reportId = computed(() => route.params.reportId as string || 'latest');

// Get report data from store
const isLoading = computed(() => reportsStore.isLoading);
const error = computed(() => reportsStore.error);
const report = computed(() => reportsStore.currentCumulativeReport);

// Check if there's not enough data for the report
const insufficientData = computed(() => {
  const errorMsg = error.value?.toLowerCase() || '';
  return errorMsg.includes('insufficient data') || errorMsg.includes('minimum');
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

const parseErrorForTestCount = (errorMessage: string | null) => {
  if (!errorMessage) return 0;
  
  // Try to extract the current test count from error message
  const match = errorMessage.match(/Current:\s*(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
};

// Fetch the report data when component mounts
onMounted(async () => {
  if (studentId.value) {
    try {
      await reportsStore.fetchCumulativeReport(studentId.value, reportId.value);
      
      // If there's an error about insufficient data, try to parse the test count
      if (error.value) {
        currentTestsCount.value = parseErrorForTestCount(error.value);
      }
    } catch (err) {
      console.error('Failed to load cumulative report:', err);
    }
  }
});

// React to changes in route params
watch([studentId, reportId], async ([newStudentId, newReportId]) => {
  if (newStudentId) {
    try {
      await reportsStore.fetchCumulativeReport(newStudentId, newReportId);
      
      // If there's an error about insufficient data, try to parse the test count
      if (error.value) {
        currentTestsCount.value = parseErrorForTestCount(error.value);
      }
    } catch (err) {
      console.error('Failed to load cumulative report:', err);
    }
  }
});

// Clean up when component unmounts
onUnmounted(() => {
  reportsStore.clearCurrentReports();
});