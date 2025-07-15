<template>
    <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } from 'chart.js'
  import type { Account } from '@/types/Account'
  
  // CategoryScale no es necesario para gráficos de dona
  ChartJS.register(Title, Tooltip, Legend, ArcElement)
  
  const props = defineProps<{
    accounts: Account[]
  }>()
  
  // Detectar modo oscuro/claro de forma reactiva
const isDark = ref(false)

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mq.matches
  mq.addEventListener('change', e => {
    isDark.value = e.matches
  })
})

function getAccessibleTextColor(bgColor: string) {
  // Algoritmo simple de contraste (YIQ)
  if (!bgColor) return '#222';
  let color = bgColor.replace('#', '')
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const r = parseInt(color.substr(0,2),16)
  const g = parseInt(color.substr(2,2),16)
  const b = parseInt(color.substr(4,2),16)
  const yiq = ((r*299)+(g*587)+(b*114))/1000
  return yiq >= 128 ? '#222' : '#fff'
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#4B5563',
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem: any) => {
          const label = tooltipItem.label || ''
          const value = tooltipItem.raw || 0
          const total = tooltipItem.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: $${value.toLocaleString('es-EC', {
            minimumFractionDigits: 2,
          })} (${percentage}%)`
        },
      },
    },
  },
  cutout: '70%',
}

import { Chart } from 'chart.js'


const chartData = computed(() => {
  if (!props.accounts?.length) return null
  // Solo las 5 cuentas con mayor balance, solo las incluidas en total
  const validAccounts = props.accounts.filter(acc => (acc.includeInTotal !== false) && acc.balance > 0)
  const sortedAccounts = [...validAccounts].sort((a, b) => b.balance - a.balance)
  const topAccounts = sortedAccounts.slice(0, 5)
  const total = topAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  if (total === 0) return null
  const labels = topAccounts.map(acc => acc.name)
  const data = topAccounts.map(acc => acc.balance)
  const backgroundColor = topAccounts.map(acc => acc.color || '#6B7280')
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverBorderWidth: 3,
      },
    ],
  }
})
  </script>