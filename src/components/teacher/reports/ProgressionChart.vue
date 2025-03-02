<!-- src/components/teacher/reports/ProgressionChart.vue -->
<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
  chartData: {
    date: string;
    score: number;
    textType: string;
  }[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: any = null;

// Function to create or update the chart
const renderChart = () => {
  if (!chartContainer.value || !props.chartData || props.chartData.length === 0) return;

  // Clear previous chart if it exists
  d3.select(chartContainer.value).selectAll('*').remove();

  // Set dimensions and margins
  const margin = { top: 20, right: 30, bottom: 50, left: 40 };
  const width = chartContainer.value.clientWidth - margin.left - margin.right;
  const height = chartContainer.value.clientHeight - margin.top - margin.bottom;

  // Parse dates and prepare data
  const data = props.chartData.map(d => ({
    date: new Date(d.date),
    score: d.score,
    textType: d.textType
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create SVG
  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X scale
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date) as [Date, Date])
    .range([0, width]);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  // Color scale for text types
  const textTypes = Array.from(new Set(data.map(d => d.textType)));
  const color = d3.scaleOrdinal()
    .domain(textTypes)
    .range(d3.schemeCategory10);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(Math.min(data.length, 5)));

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

  // Add X axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .text('Date')
    .attr('fill', '#666');

  // Add Y axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 10)
    .attr('x', -height / 2)
    .text('Score (%)')
    .attr('fill', '#666');

  // Add the line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.score))
    );

  // Add the points
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.date))
    .attr('cy', d => y(d.score))
    .attr('r', 5)
    .attr('fill', d => color(d.textType) as string)
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5);

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

  svg.selectAll('circle')
    .on('mouseover', (event, d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(`
        <strong>Date:</strong> ${d.date.toLocaleDateString()}<br/>
        <strong>Score:</strong> ${d.score}%<br/>
        <strong>Text Type:</strong> ${d.textType}
      `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Add legend
  const legend = svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(textTypes)
    .enter().append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  legend.append('rect')
    .attr('x', width - 19)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => color(d) as string);

  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d);

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