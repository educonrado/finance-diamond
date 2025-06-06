<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js';

interface Props {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const props = defineProps<Props>();
</script>

<template>
  <BarChart :chart-data="props.data" :chart-options="props.options" />
</template>