<!-- src/views/InicioView.vue -->
<template>
  <div class="converter-container">
    <h2>Conversor de Divisas</h2>

    <div class="converter-card">
      <!-- Estado de carga de la API -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>Cargando tipos de cambio...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchRates" class="button">Reintentar</button>
      </div>

      <!-- Última actualización -->
      <div class="update-info">
        <span>Última actualización: {{ lastUpdateFormatted }}</span>
        <button
          @click="fetchRates"
          class="refresh-button"
          title="Actualizar tipos de cambio"
        >
          ↻
        </button>
      </div>

      <!-- Formulario de conversión -->
      <form @submit.prevent="convertCurrency" class="converter-form">
        <div class="form-row">
          <div class="form-group">
            <label for="amount">Cantidad</label>
            <input
              type="number"
              id="amount"
              v-model="amount"
              step="0.01"
              min="0.01"
              required
              @input="handleAmountInput"
            />
          </div>

          <div class="form-group">
            <label for="fromCurrency">De</label>
            <select
              id="fromCurrency"
              v-model="fromCurrency"
              required
              @change="handleCurrencyChange"
            >
              <option
                v-for="currency in availableCurrencies"
                :key="`from-${currency}`"
                :value="currency"
              >
                {{ currency }}
              </option>
            </select>
          </div>

          <button
            type="button"
            @click="swapCurrencies"
            class="swap-button"
            title="Intercambiar monedas"
          >
            ⇄
          </button>

          <div class="form-group">
            <label for="toCurrency">A</label>
            <select
              id="toCurrency"
              v-model="toCurrency"
              required
              @change="handleCurrencyChange"
            >
              <option
                v-for="currency in availableCurrencies"
                :key="`to-${currency}`"
                :value="currency"
              >
                {{ currency }}
              </option>
            </select>
          </div>
        </div>

        <button type="submit" class="convert-button" :disabled="isLoading">
          Convertir
        </button>
      </form>

      <!-- Resultado de la conversión -->
      <div v-if="result" class="conversion-result">
        <h3>{{ formatAmount(amount, fromCurrency) }} =</h3>
        <div class="result-value">{{ formatAmount(result, toCurrency) }}</div>
        <p class="rate-info">
          1 {{ fromCurrency }} = {{ formatNumber(exchangeRate) }}
          {{ toCurrency }}
        </p>
      </div>

      <!-- Monedas favoritas (funcionalidad opcional) -->
      <div class="favorites-section">
        <h4>Conversiones rápidas</h4>
        <div class="favorites-container">
          <div
            v-for="(favorite, index) in favorites"
            :key="index"
            class="favorite-item"
            @click="applyFavorite(favorite)"
          >
            {{ favorite.from }} → {{ favorite.to }}
          </div>
          <button
            v-if="canSaveAsFavorite"
            @click="saveFavorite"
            class="add-favorite"
            title="Guardar como favorita"
          >
            + Guardar actual
          </button>
        </div>
      </div>
    </div>

    <!-- Gráfico de variación (componente externo) -->
    <GraficoTasaCambio
      v-if="result && exchangeRate"
      :fromCurrency="fromCurrency"
      :toCurrency="toCurrency"
      :currentRate="exchangeRate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useConversorStore } from "../stores/conversor";
import GraficoTasaCambio from "../components/GraficoTasaCambio.vue";

// Store de Pinia
const conversorStore = useConversorStore();

// Referencias reactivas
const isLoading = ref(false);
const error = ref("");
const amount = ref(1);
const fromCurrency = ref("EUR");
const toCurrency = ref("USD");
const result = ref(null);
const exchangeRate = ref(null);
const favorites = ref([]);

// Computed properties
const availableCurrencies = computed(() => conversorStore.availableCurrencies);
const lastUpdateFormatted = computed(() => conversorStore.lastUpdateFormatted);
const canSaveAsFavorite = computed(() => {
  // Verificar si ya existe esta combinación en favoritos
  return !favorites.value.some(
    (fav) => fav.from === fromCurrency.value && fav.to === toCurrency.value
  );
});

// Al montar el componente
onMounted(async () => {
  // Obtener parámetros de conversión del store
  const params = conversorStore.conversionParams;
  fromCurrency.value = params.fromCurrency;
  toCurrency.value = params.toCurrency;
  amount.value = params.amount;

  // Cargar favoritos desde localStorage (en una implementación real sería desde MongoDB)
  const savedFavorites = localStorage.getItem("favoriteConversions");
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites);
  }

  // Cargar tasas de cambio
  await fetchRates();

  // Si ya hay parámetros definidos, realizar la conversión automáticamente
  if (params.amount > 0) {
    convertCurrency();
  }
});

// Watch para sincronizar los cambios con el store
watch([fromCurrency, toCurrency, amount], ([newFrom, newTo, newAmount]) => {
  conversorStore.setConversionParams({
    fromCurrency: newFrom,
    toCurrency: newTo,
    amount: newAmount,
  });
});

// Función para obtener las tasas de cambio
async function fetchRates() {
  isLoading.value = true;
  error.value = "";

  try {
    await conversorStore.fetchExchangeRates();
    // Actualizar el tipo de cambio actual
    updateExchangeRate();
  } catch (err) {
    error.value =
      "Error al obtener los tipos de cambio. Por favor, inténtalo de nuevo más tarde.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

// Función para convertir moneda
function convertCurrency() {
  if (!fromCurrency.value || !toCurrency.value || !amount.value) {
    return;
  }

  // Calcular el resultado
  if (exchangeRate.value !== null) {
    result.value = amount.value * exchangeRate.value;

    // Agregar al historial
    const conversion = {
      from: fromCurrency.value,
      to: toCurrency.value,
      amount: amount.value,
      result: result.value,
      rate: exchangeRate.value,
      date: new Date().toISOString(),
    };

    conversorStore.addToHistory(conversion);
  }
}

// Función para formatear la cantidad con símbolo de moneda
function formatAmount(value, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(value);
}

// Función para formatear números sin símbolo de moneda
function formatNumber(value) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

// Función para intercambiar monedas
function swapCurrencies() {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  // Actualizar tipo de cambio y resultado
  updateExchangeRate();
  if (result.value) {
    convertCurrency();
  }
}

// Función para actualizar el tipo de cambio actual
function updateExchangeRate() {
  exchangeRate.value = conversorStore.getExchangeRate(
    fromCurrency.value,
    toCurrency.value
  );
}

// Manejadores de eventos de cambio
function handleCurrencyChange() {
  updateExchangeRate();
  if (result.value) {
    convertCurrency();
  }
}

function handleAmountInput() {
  // Asegurarse de que amount sea numérico
  if (isNaN(amount.value) || amount.value <= 0) {
    amount.value = 1;
  }

  if (result.value) {
    convertCurrency();
  }
}

// Funciones para favoritos
function saveFavorite() {
  if (canSaveAsFavorite.value) {
    const newFavorite = {
      from: fromCurrency.value,
      to: toCurrency.value,
    };

    favorites.value.push(newFavorite);

    // Guardar en localStorage (en una app real sería en MongoDB)
    localStorage.setItem(
      "favoriteConversions",
      JSON.stringify(favorites.value)
    );
  }
}

function applyFavorite(favorite) {
  fromCurrency.value = favorite.from;
  toCurrency.value = favorite.to;

  // Actualizar tipo de cambio y convertir
  updateExchangeRate();
  convertCurrency();
}
</script>

<style scoped>
.converter-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.converter-card {
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

.update-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.refresh-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #3498db;
  cursor: pointer;
}

.converter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.swap-button {
  background-color: #f5f5f7;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  align-self: flex-end;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.convert-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.convert-button:hover {
  background-color: #2980b9;
}

.convert-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.conversion-result {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f5f5f7;
  border-radius: 8px;
  text-align: center;
}

.conversion-result h3 {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.rate-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.favorites-section {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.favorites-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.favorites-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.favorite-item {
  background-color: #f5f5f7;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.favorite-item:hover {
  background-color: #e9e9e9;
}

.add-favorite {
  background-color: #ecf0f1;
  border: 1px dashed #bdc3c7;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  cursor: pointer;
}

.add-favorite:hover {
  background-color: #e9e9e9;
}
</style>
