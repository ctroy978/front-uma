<!-- src/components/teacher/reports/CategoryTrendsChartPlaceholder.vue -->
<template>
  <div class="placeholder-chart">
    <div class="content">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="M18.4 9.4l-4.2 4.2-2-2L8 16"></path>
        </svg>
      </div>
      <h3 class="title">Category Trends Chart Coming Soon</h3>
      <p class="message">We're currently refining the trends visualization. It will be available in the next update.</p>
      <div v-if="showDetails" class="details">
        <div class="data-summary">
          <h4>Trends Data Summary:</h4>
          <div v-if="chartData && chartData.length" class="categories">
            <div v-for="(category, index) in chartData" :key="index" class="category">
              <div class="category-header">
                <span class="category-name">{{ category.category }}</span>
                <span class="data-points">{{ category.scores.length }} tests</span>
              </div>
              <div class="trend-summary">
                <div class="trend-metric">
                  <strong>First:</strong> {{ category.scores[0]?.toFixed(1) || 'N/A' }}%
                </div>
                <div class="trend-metric">
                  <strong>Latest:</strong> {{ category.scores[category.scores.length - 1]?.toFixed(1) || 'N/A' }}%
                </div>
                <div class="trend-metric">
                  <strong>Average:</strong> {{ calculateAverage(category.scores).toFixed(1) }}%
                </div>
                <div class="trend-metric">
                  <strong>Change:</strong> 
                  <span :class="getTrendClass(category.scores)">
                    {{ calculateChange(category.scores) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            No trends data available
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

// Calculate change between first and last score
const calculateChange = (scores: number[]): string => {
  if (!scores || scores.length < 2) return 'N/A';
  
  const first = scores[0];
  const last = scores[scores.length - 1];
  const change = last - first;
  const sign = change > 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}%`;
};

// Get CSS class based on trend direction
const getTrendClass = (scores: number[]): string => {
  if (!scores || scores.length < 2) return '';
  
  const first = scores[0];
  const last = scores[scores.length - 1];
  const change = last - first;
  
  if (change > 0) return 'trend-positive';
  if (change < 0) return 'trend-negative';
  return '';
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
  gap: 12px;
}

.category {
  padding: 12px;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 600;
}

.data-points {
  font-size: 0.8rem;
  color: #6b7280;
}

.trend-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.trend-metric {
  font-size: 0.9rem;
}

.trend-positive {
  color: #10b981;
}

.trend-negative {
  color: #ef4444;
}

.no-data {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}
</style>