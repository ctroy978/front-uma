<!-- src/components/teacher/reports/CategoryTrendsChart.vue -->
<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
  chartData: {
    category: string;
    dates: string[];
    scores: number[];
  }[];
}>();

const chartContainer = ref<HTMLElement | null>(null);

interface Chart {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
}

// Function to create or update the chart
const renderChart = () => {
  if (!chartContainer.value || !props.chartData || props.chartData.length === 0) return;

  // Clear previous chart if it exists
  d3.select(chartContainer.value).select('svg').remove();
  d3.select(chartContainer.value).select(".tooltip").remove();


  // Set dimensions and margins
  const margin = { top: 20, right: 120, bottom: 50, left: 50 };
  const width = chartContainer.value.clientWidth - margin.left - margin.right;
  const height = chartContainer.value.clientHeight - margin.top - margin.bottom;

  // Create SVG
  const svg: d3.Selection<SVGGElement, unknown, null, undefined> = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Determine the maximum number of data points across all categories
  const maxDataPoints = Math.max(...props.chartData.map(d => d.scores.length));
  
  // Create a common x-axis domain
  const xDomain = Array.from({ length: maxDataPoints }, (_, i) => i);
  
  // X scale - using index positions to ensure alignment
  const x = d3.scaleLinear()
    .domain([0, maxDataPoints - 1])
    .range([0, width]);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, 100]) // Scores are percentages
    .range([height, 0]);

  // Color scale for categories
  const color = d3.scaleOrdinal()
    .domain(props.chartData.map(d => d.category))
    .range(d3.schemeCategory10);

  // Add X axis with date labels if available
  const formatXAxis = (i: number) => {
    // Find first category with enough dates
    for (const category of props.chartData) {
      if (category.dates && category.dates.length > i) {
        return category.dates[i];
      }
    }
    return `Test ${i+1}`;
  };

  // Show fewer ticks if there are many data points
  const tickCount = maxDataPoints <= 8 ? maxDataPoints : Math.min(8, maxDataPoints);
  const tickValues = Array.from({ length: tickCount }, (_, i) => 
    Math.floor(i * (maxDataPoints - 1) / (tickCount - 1))
  );

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .tickValues(tickValues)
      .tickFormat(i => formatXAxis(Number(i)))
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

  // Create line generator
  const line = d3.line<number>()
    .x((_, i) => x(i))
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  // Add the lines
  props.chartData.forEach(category => {
    svg.append('path')
      .datum(category.scores)
      .attr('fill', 'none')
      .attr('stroke', color(category.category) as string)
      .attr('stroke-width', 2)
      .attr('d', line);
  });

  // Add dots
  props.chartData.forEach(category => {
    const dots = category.scores.map((score, i) => ({
      category: category.category,
      score: score,
      date: i < category.dates.length ? category.dates[i] : `Test ${i+1}`,
      index: i
    }));
    svg.selectAll(`.dots-${category.category.replace(/\s+/g, '-')}`)
      .data(dots)
      .enter()
      .append('circle')
      .attr('class', `dots-${category.category.replace(/\s+/g, '-')}`)
      .attr('cx', d => x(d.index))
      .attr('cy', d => y(d.score))
      .attr('r', 4)
      .attr('fill', color(category.category) as string)
      .attr('data-category', (d) => d.category)
      .attr('data-date', (d) => d.date)
      .attr('data-score', (d) => d.score)
      ;
  });

  // Add X axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 5)
    .text('Test Timeline')
    .attr('fill', '#666');

  // Add Y axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2)
    .text('Score (%)')
    .attr('fill', '#666');

  // Add legend
  const legend = svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'start')
    .selectAll('g')
    .data(props.chartData)
    .enter().append('g')
    .attr('transform', (_, i) => `translate(${width + 10},${i * 20})`);

  legend.append('rect')
    .attr('x', 0)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => color(d.category) as string);

  legend.append('text')
    .attr('x', 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d.category);

  // Add tooltips
  const tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined> = d3.select(chartContainer.value)
    .append('div')
    .attr("class", "tooltip")
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', '1px solid #ccc')
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 100);

  // Add hover interactions for each category
  props.chartData.forEach(category => {
    const categoryClass = `.dots-${category.category.replace(/\s+/g, '-')}`;
    
    svg.selectAll(categoryClass)
      .on('mouseover', (event) => {
        const target = event.target as HTMLElement;
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${target.dataset.category}</strong><br/>
          <strong>Date:</strong> ${target.dataset.date}<br/>
          <strong>Score:</strong> ${target.dataset.score}%
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  });

  // Store chart reference
  const chart: Chart = { svg, tooltip };
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
  d3.select(chartContainer.value).select(".tooltip").remove();
});
</script>
