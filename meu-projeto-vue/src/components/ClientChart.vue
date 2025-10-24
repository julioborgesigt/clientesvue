<template>
  <div class="grafico">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Recebe os dados do gráfico do DashboardView
defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

// Opções do gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>