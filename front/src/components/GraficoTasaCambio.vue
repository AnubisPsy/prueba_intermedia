<!-- src/components/GraficoTasaCambio.vue -->
<template>
  <div class="chart-wrapper">
    <h3>Variación de Tipo de Cambio (Últimos 7 días)</h3>
    <div v-if="isLoading" class="chart-loading">
      <div class="loader"></div>
      <p>Cargando datos...</p>
    </div>
    <canvas ref="chartCanvas" v-else></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  fromCurrency: {
    type: String,
    required: true,
  },
  toCurrency: {
    type: String,
    required: true,
  },
  currentRate: {
    type: Number,
    required: true,
  },
});

const chartCanvas = ref(null);
const isLoading = ref(true);
let chart = null;

// Simular datos históricos para los últimos 7 días
function generateHistoricalData() {
  const data = [];
  const baseRate = props.currentRate;
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Variación aleatoria ±3%
    const variation = baseRate * (1 + (Math.random() * 0.06 - 0.03));

    data.push({
      date: date.toISOString().split("T")[0],
      rate: parseFloat(variation.toFixed(4)),
    });
  }

  return data;
}

// Crear o actualizar el gráfico
function renderChart() {
  if (!chartCanvas.value) return;

  isLoading.value = true;

  // Generar datos históricos simulados
  const historicalData = generateHistoricalData();

  // Configuración del gráfico
  const ctx = chartCanvas.value.getContext("2d");

  // Destruir el gráfico anterior si existe
  if (chart) {
    chart.destroy();
  }

  // Crear nuevo gráfico
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: historicalData.map((item) => {
        // Formatear fecha como dd/mm
        const [year, month, day] = item.date.split("-");
        return `${day}/${month}`;
      }),
      datasets: [
        {
          label: `1 ${props.fromCurrency} a ${props.toCurrency}`,
          data: historicalData.map((item) => item.rate),
          fill: false,
          borderColor: "#3498db",
          tension: 0.1,
          pointBackgroundColor: "#3498db",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.formattedValue}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return value.toFixed(4);
            },
          },
        },
      },
    },
  });

  isLoading.value = false;
}

// Renderizar el gráfico al montar el componente
onMounted(() => {
  renderChart();
});

// Actualizar el gráfico cuando cambian las monedas o el tipo
watch(
  [() => props.fromCurrency, () => props.toCurrency, () => props.currentRate],
  () => {
    renderChart();
  }
);

// Limpiar el gráfico al desmontar el componente
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

<style scoped>
.chart-wrapper {
  margin-top: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #7f8c8d;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
  