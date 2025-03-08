<!-- src/views/teacher/CumulativeReportView.vue -->
<template>
  <div class="p-6">
    <!-- Simplified Placeholder Content -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-6 py-5 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Cumulative Reading Assessment Report
          </h1>
          <button
            @click="goBack"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
      </div>
      <div class="px-6 py-5">
        <div class="flex items-center justify-center p-8">
          <div class="text-center">
            <FileQuestion class="h-16 w-16 text-gray-400 mx-auto" />
            <h3 class="mt-4 text-lg font-medium text-gray-900">Cumulative Reports Coming Soon</h3>
            <p class="mt-2 text-base text-gray-500">
              We're currently working on enhancing our cumulative reporting feature. 
              Please check back later for detailed student progress analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Placeholder card for upcoming features -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-6 py-5 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Upcoming Features</h2>
      </div>
      <div class="px-6 py-5">
        <ul class="space-y-4">
          <li v-for="(feature, index) in upcomingFeatures" :key="index" class="flex items-start">
            <div class="flex-shrink-0">
              <Clock class="h-5 w-5 text-blue-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-900">{{ feature }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, FileQuestion, Clock } from 'lucide-vue-next';

const router = useRouter();

// Placeholder data
const upcomingFeatures = ref([
  "Progress tracking over time with interactive charts",
  "Category performance analysis across multiple assessments",
  "Personalized development recommendations based on reading patterns",
  "Text type performance insights and comparative metrics",
  "Evidence-based teaching strategies tailored to student needs"
]);

// Navigation
const goBack = () => {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push('/teacher/analysis');
  }
};
</script>