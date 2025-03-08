<!-- src/components/teacher/reports/PlaceholderChart.vue -->
<template>
  <div class="placeholder-chart">
    <div class="content">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </div>
      <h3 class="title">Chart Coming Soon</h3>
      <p class="message">We're currently working on improving this chart visualization. It will be available in the next update.</p>
      <div v-if="showDetails" class="details">
        <div class="data-summary">
          <h4>Data Summary:</h4>
          <div v-if="chartData && chartData.length" class="categories">
            <div v-for="(category, index) in chartData" :key="index" class="category">
              <span class="category-name">{{ category.category }}</span>
              <span class="category-points">{{ category.scores.length }} data points</span>
              <span class="category-average">
                Avg: {{ calculateAverage(category.scores).toFixed(1) }}%
              </span>
            </div>
          </div>
          <div v-else class="no-data">
            No data available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps<{
  chartData?: {
    category: string;
    dates: string[];
    scores: number[];
  }[];
  showDetails?: boolean;
}>();

// Default props
const showDetails = computed(() => props.showDetails ?? true);

// Calculate average of scores
const calculateAverage = (scores: number[]): number => {
  if (!scores || scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};
</script>

<style scoped>
.placeholder-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
}

.content {
  max-width: 500px;
  text-align: center;
}

.icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.message {
  color: #6b7280;
  margin-bottom: 20px;
}

.details {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  text-align: left;
}

.data-summary h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #4b5563;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.category-name {
  font-weight: 500;
  flex: 2;
}

.category-points {
  flex: 1;
  color: #6b7280;
}

.category-average {
  flex: 1;
  font-weight: 500;
}

.no-data {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}
</style>