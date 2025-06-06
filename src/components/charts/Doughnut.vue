<script setup lang="ts">
//import { DoughnutChart } from 'vue-chartjs';

import type { ChartData, ChartOptions } from 'chart.js';

interface Props {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
}

const props = defineProps<Props>();
</script>

<template>
  <DoughnutChart :chart-data="props.data" :chart-options="props.options" />
</template>