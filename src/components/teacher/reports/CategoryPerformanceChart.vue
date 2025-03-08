<!-- src/components/teacher/reports/CategoryPerformanceChart.vue -->
<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

interface CategoryData {
  category: string;
  score: number;
  benchmark: number;
}

const props = defineProps<{
  chartData: CategoryData[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: { svg: any; tooltip: any } | null = null;

// Function to create or update the chart
const renderChart = () => {
  if (!chartContainer.value || !props.chartData || props.chartData.length === 0) return;

  // Clear previous chart if it exists
  d3.select(chartContainer.value).selectAll('*').remove();

  // Set dimensions and margins
  const margin = { top: 20, right: 120, bottom: 50, left: 50 };
  const width = chartContainer.value.clientWidth - margin.left - margin.right;
  const height = chartContainer.value.clientHeight - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X scale (bar chart)
  const x = d3.scaleBand()
    .domain(props.chartData.map(d => d.category))
    .range([0, width])
    .padding(0.2);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, 100])  // Scores are percentages
    .range([height, 0]);

  // Color scale for categories
  const color = d3.scaleOrdinal()
    .domain(props.chartData.map(d => d.category))
    .range(d3.schemeCategory10);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat((d: any) => `${d}%`));

  // Add benchmark lines
  props.chartData.forEach(d => {
    if (d.benchmark) {
      svg.append('line')
        .attr('x1', x(d.category) || 0)
        .attr('x2', (x(d.category) || 0) + x.bandwidth())
        .attr('y1', y(d.benchmark))
        .attr('y2', y(d.benchmark))
        .attr('stroke', '#888')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4');
    }
  });

  // Add bars
  svg.selectAll('.bar')
    .data(props.chartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d:CategoryData) => x(d.category) || 0)
    .attr('y', (d:CategoryData) => y(d.score))
    .attr('width', x.bandwidth())
    .attr('height', (d: CategoryData) => height - y(d.score))
    .attr('fill', (d: CategoryData) => color(d.category))
    .attr('rx', 4)  // Rounded corners
    .attr('ry', 4);  // Rounded corners

  // Add X axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 5)
    .text('Category')
    .attr('fill', '#666');

  // Add Y axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2)
    .text('Score (%)')
    .attr('fill', '#666');

  // Add the benchmark legend
  svg.append('line')
    .attr('x1', width - 100)
    .attr('x2', width - 80)
    .attr('y1', 20)
    .attr('y2', 20)
    .attr('stroke', '#888')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4');

  svg.append('text')
    .attr('x', width - 75)
    .attr('y', 25)
    .text('Benchmark')
    .attr('font-size', '12px')
    .attr('fill', '#666');

  // Add tooltips
  const tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', '1px solid #ccc')
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 100);

  svg.selectAll('.bar')
    .on('mouseover', function(this: SVGRectElement, event: MouseEvent, d: CategoryData) {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(`
        <strong>${d.category}</strong><br/>
        <strong>Score:</strong> ${d.score}%<br/>
        <strong>Benchmark:</strong> ${d.benchmark}%
      `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Store chart reference
  chart = { svg, tooltip };
};

// Watch for changes in chart data or container size
watch(() => props.chartData, renderChart, { deep: true });

// Handle window resize
const handleResize = () => {
  renderChart();
};

// Setup and teardown
onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chart && chart.tooltip) {
    chart.tooltip.remove();
  }
});
</script>