<template>
  <div class="grafico-barras">
    <Bar :data="reactiveChartData" :options="reactiveChartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { Bar } from 'vue-chartjs'; // Importar Bar em vez de Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Importar BarElement
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';

// Registrar BarElement
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, 
  Title,
  Tooltip,
  Legend,
  Colors
);

// Props
const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({ labels: [], datasets: [{ data: [] }] }) 
  },
});

// --- LÓGICA DO TEMA ---
const theme = useTheme();

// Cores computadas para as BARRAS e Eixos
const currentBarColor = computed(() => {
  // Usar cores diferentes para claro/escuro
  return theme.global.current.value.dark ? 'rgba(121, 134, 203, 0.7)' : 'rgba(63, 81, 181, 0.7)'; // Indigo 300 (dark) / Indigo 500 (light) com transparência
});
const currentBorderColor = computed(() => {
  return theme.global.current.value.dark ? '#7986CB' : '#3F51B5'; 
});
const currentGridColor = computed(() => {
  return theme.global.current.value.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
});
const currentTickColor = computed(() => {
  return theme.global.current.value.dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
});
// --- FIM DA LÓGICA DO TEMA ---


// --- DADOS REATIVOS PARA O GRÁFICO DE BARRAS ---
const reactiveChartData = computed(() => {
  const rawData = props.chartData?.datasets?.[0]?.data || [];
  const labels = props.chartData?.labels || [];
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Clientes por Serviço',
        data: rawData,
        backgroundColor: currentBarColor.value, // Cor das barras
        borderColor: currentBorderColor.value,   // Cor da borda das barras
        borderWidth: 1
      }
    ]
  };
});
// --- FIM DOS DADOS REATIVOS ---


// --- OPÇÕES REATIVAS PARA O GRÁFICO DE BARRAS ---
const reactiveChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // <-- TORNA O GRÁFICO HORIZONTAL (opcional, remova se preferir vertical)
  plugins: {
    legend: {
      display: false // Oculta a legenda, pois o título do card já informa
    }
  },
  scales: {
    y: { // Agora é o eixo dos Serviços (labels)
      border: { color: currentGridColor.value },
      grid: { 
        display: false // Oculta linhas de grade verticais (se indexAxis: 'y')
      },
      ticks: { color: currentTickColor.value }
    },
    x: { // Agora é o eixo das Contagens (data)
       border: { color: currentGridColor.value },
      grid: { color: currentGridColor.value },
      ticks: { color: currentTickColor.value }
    }
  }
}));
// --- FIM DAS OPÇÕES REATIVAS ---

</script>

<style scoped>
.grafico-barras {
  position: relative; 
  height: 100%; 
  width: 100%;
}
</style>