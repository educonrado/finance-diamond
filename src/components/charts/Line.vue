<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js';

interface Props {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
}

const props = defineProps<Props>();
</script>

<template>
  <LineChart :chart-data="props.data" :chart-options="props.options" />
</template>