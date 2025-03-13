<!-- src/views/HistorialView.vue -->
<template>
  <div class="history-container">
    <h2>Historial de Conversiones</h2>

    <div class="history-card">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>Cargando historial...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchHistory" class="button">Reintentar</button>
      </div>

      <div
        v-if="conversions.length === 0 && !isLoading && !error"
        class="empty-history"
      >
        <p>Aún no has realizado ninguna conversión.</p>
        <router-link to="/" class="button">Ir al Conversor</router-link>
      </div>

      <div v-else class="history-list">
        <div class="history-filters">
          <div class="form-group">
            <label for="filterCurrency">Filtrar por moneda:</label>
            <select id="filterCurrency" v-model="filterCurrency">
              <option value="">Todas las monedas</option>
              <option
                v-for="currency in availableCurrencies"
                :key="currency"
                :value="currency"
              >
                {{ currency }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="sortBy">Ordenar por:</label>
            <select id="sortBy" v-model="sortBy">
              <option value="date">Fecha (más reciente primero)</option>
              <option value="dateAsc">Fecha (más antigua primero)</option>
              <option value="amountDesc">Cantidad (mayor primero)</option>
              <option value="amountAsc">Cantidad (menor primero)</option>
            </select>
          </div>
        </div>

        <table class="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>De</th>
              <th>A</th>
              <th>Cantidad</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredAndSortedConversions"
              :key="index"
            >
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.from }}</td>
              <td>{{ item.to }}</td>
              <td>{{ formatAmount(item.amount, item.from) }}</td>
              <td>{{ formatAmount(item.result, item.to) }}</td>
              <td>
                <button
                  @click="repeatConversion(item)"
                  class="small-button"
                  title="Repetir esta conversión"
                >
                  ↻
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="stats-container">
      <h3>Estadísticas</h3>

      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total de Conversiones</h4>
          <p class="stat-value">{{ conversions.length }}</p>
        </div>

        <div class="stat-card">
          <h4>Moneda Más Usada (Origen)</h4>
          <p class="stat-value">{{ mostUsedFromCurrency || "-" }}</p>
        </div>

        <div class="stat-card">
          <h4>Moneda Más Usada (Destino)</h4>
          <p class="stat-value">{{ mostUsedToCurrency || "-" }}</p>
        </div>

        <div class="stat-card">
          <h4>Conversión Mayor</h4>
          <p class="stat-value">{{ highestConversion || "-" }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useConversorStore } from "../stores/conversor";

const router = useRouter();
const conversorStore = useConversorStore();

// Referencias reactivas
const isLoading = ref(false);
const error = ref("");
const filterCurrency = ref("");
const sortBy = ref("date");

// Obtener datos del store
const conversions = computed(() => conversorStore.history);
const availableCurrencies = computed(() => conversorStore.availableCurrencies);

// Al montar el componente
onMounted(() => {
  fetchHistory();
});

// Función para obtener el historial
async function fetchHistory() {
  isLoading.value = true;
  error.value = "";

  try {
    // Simular la carga desde una base de datos (en una implementación real)
    // Este sería el punto donde se conectaría con MongoDB
    await conversorStore.fetchHistory();
  } catch (err) {
    error.value =
      "Error al cargar el historial. Por favor, inténtalo de nuevo más tarde.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

// Función para repetir una conversión
function repeatConversion(item) {
  conversorStore.setConversionParams({
    fromCurrency: item.from,
    toCurrency: item.to,
    amount: item.amount,
  });

  router.push("/");
}

// Función para formatear la fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Función para formatear una cantidad
function formatAmount(amount, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Filtrar y ordenar conversiones
const filteredAndSortedConversions = computed(() => {
  let result = [...conversions.value];

  // Aplicar filtro
  if (filterCurrency.value) {
    result = result.filter(
      (item) =>
        item.from === filterCurrency.value || item.to === filterCurrency.value
    );
  }

  // Aplicar ordenamiento
  switch (sortBy.value) {
    case "date":
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "dateAsc":
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "amountDesc":
      result.sort((a, b) => b.amount - a.amount);
      break;
    case "amountAsc":
      result.sort((a, b) => a.amount - b.amount);
      break;
  }

  return result;
});

// Estadísticas computadas
const mostUsedFromCurrency = computed(() => {
  if (conversions.value.length === 0) return null;

  const counts = {};
  conversions.value.forEach((item) => {
    counts[item.from] = (counts[item.from] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
});

const mostUsedToCurrency = computed(() => {
  if (conversions.value.length === 0) return null;

  const counts = {};
  conversions.value.forEach((item) => {
    counts[item.to] = (counts[item.to] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
});

const highestConversion = computed(() => {
  if (conversions.value.length === 0) return null;

  const highest = [...conversions.value].sort((a, b) => b.amount - a.amount)[0];
  return `${formatAmount(highest.amount, highest.from)} → ${formatAmount(
    highest.result,
    highest.to
  )}`;
});
</script>

<style scoped>
.history-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.history-card,
.stats-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2c3e50;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-history {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.history-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 200px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.history-table th {
  background-color: #f5f5f7;
  font-weight: 600;
  color: #2c3e50;
}

.button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
  font-size: 0.9rem;
}

.button:hover {
  background-color: #2980b9;
}

.small-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.small-button:hover {
  opacity: 0.9;
}

.stats-container h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: #f5f5f7;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card h4 {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}
</style>
