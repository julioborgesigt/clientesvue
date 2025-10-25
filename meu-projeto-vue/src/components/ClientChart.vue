<template>
  <div class="grafico">
    <Line :data="reactiveChartData" :options="reactiveChartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'; 
import { useTheme } from 'vuetify'; 
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
  Colors 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors 
);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({ labels: [], datasets: [{ data: [] }] }) 
  },
});

// --- LÓGICA DO TEMA ---
const theme = useTheme(); 

// Cores computadas baseadas no tema
const currentLineColor = computed(() => {
  // MODO ESCURO: Mantém o Indigo 300 (#7986CB)
  // MODO CLARO: Muda para Blue Grey 400 (#90A4AE) - um cinza azulado mais suave
  return theme.global.current.value.dark ? '#7986CB' : '#90A4AE'; // <-- MUDANÇA AQUI
});
const currentGridColor = computed(() => {
  return theme.global.current.value.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
});
const currentTickColor = computed(() => {
  return theme.global.current.value.dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
});
// --- FIM DA LÓGICA DO TEMA ---


// --- DADOS REATIVOS PARA O GRÁFICO ---
const reactiveChartData = computed(() => {
  const rawData = props.chartData?.datasets?.[0]?.data || [];
  const labels = props.chartData?.labels || [];
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Previsão de Pagamentos',
        data: rawData,
        fill: false,
        borderColor: currentLineColor.value, 
        pointBackgroundColor: currentLineColor.value, 
        tension: 0.1
      }
    ]
  };
});
// --- FIM DOS DADOS REATIVOS ---


// --- OPÇÕES REATIVAS PARA O GRÁFICO ---
const reactiveChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: currentTickColor.value 
      }
    }
  },
  scales: {
    y: { 
      border: { color: currentGridColor.value },
      grid: { color: currentGridColor.value },
      ticks: { color: currentTickColor.value }
    },
    x: { 
       border: { color: currentGridColor.value },
      grid: { color: currentGridColor.value },
      ticks: { color: currentTickColor.value }
    }
  }
}));
// --- FIM DAS OPÇÕES REATIVAS ---

</script>

<style scoped>
.grafico {
  position: relative; 
  height: 100%; 
  width: 100%;
}
</style>