// src/stores/conversor.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useConversorStore = defineStore("conversor", () => {
  // Estado
  const exchangeRates = ref({});
  const baseCurrency = ref("EUR"); // La moneda base predeterminada de la API
  const lastUpdate = ref(null);
  const history = ref([]);
  const conversionParams = ref({
    fromCurrency: "EUR",
    toCurrency: "USD",
    amount: 1,
  });

  // Getters (computed)
  const availableCurrencies = computed(() => {
    return Object.keys(exchangeRates.value).sort();
  });

  const lastUpdateFormatted = computed(() => {
    if (!lastUpdate.value) return "Nunca";

    return new Date(lastUpdate.value).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  // Acciones
  async function fetchExchangeRates() {
    try {
      // En una aplicación real, aquí se haría la llamada a la API
      // Ejemplo: const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency.value}`)

      // Para fines de demostración, usamos datos simulados
      const mockResponse = {
        base: baseCurrency.value,
        date: new Date().toISOString(),
        rates: {
          EUR: 1,
          USD: 1.08,
          GBP: 0.86,
          JPY: 161.12,
          CAD: 1.47,
          AUD: 1.64,
          CHF: 0.97,
          CNY: 7.86,
          MXN: 19.87,
          BRL: 5.45,
          ARS: 947.5,
          COP: 4234.15,
          CLP: 978.42,
          PEN: 4.07,
        },
      };

      // Actualizar estado
      exchangeRates.value = mockResponse.rates;
      lastUpdate.value = new Date().toISOString();

      return mockResponse;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw error;
    }
  }

  // Obtener tipo de cambio entre dos monedas
  function getExchangeRate(from, to) {
    // Si no hay tasas de cambio, devolver null
    if (Object.keys(exchangeRates.value).length === 0) {
      return null;
    }

    // Si ambas monedas son iguales, el tipo de cambio es 1
    if (from === to) {
      return 1;
    }

    // Convertir todo a través de la moneda base (EUR en este caso)
    // Primero obtenemos cuánto vale 1 unidad de 'from' en términos de la moneda base
    const fromRate = exchangeRates.value[from];

    // Luego obtenemos cuánto vale 1 unidad de la moneda base en términos de 'to'
    const toRate = exchangeRates.value[to];

    // El tipo de cambio de from a to es:
    return toRate / fromRate;
  }

  // Agregar una conversión al historial
  function addToHistory(conversion) {
    history.value.unshift(conversion);

    // Opcional: guardar en localStorage para persistencia (en una app real sería en MongoDB)
    const localHistory = JSON.parse(
      localStorage.getItem("conversionHistory") || "[]"
    );
    localHistory.unshift(conversion);
    localStorage.setItem(
      "conversionHistory",
      JSON.stringify(localHistory.slice(0, 100))
    ); // Limitar a 100 entradas
  }

  // Cargar historial (simulado, en una app real sería desde MongoDB)
  async function fetchHistory() {
    // Simular una llamada a la API/base de datos
    return new Promise((resolve) => {
      setTimeout(() => {
        const localHistory = JSON.parse(
          localStorage.getItem("conversionHistory") || "[]"
        );
        history.value = localHistory;
        resolve(localHistory);
      }, 500); // Simular latencia de red
    });
  }

  // Establecer parámetros de conversión (útil para cuando se selecciona desde historial)
  function setConversionParams(params) {
    conversionParams.value = { ...conversionParams.value, ...params };
  }

  return {
    // Estado
    exchangeRates,
    baseCurrency,
    lastUpdate,
    history,
    conversionParams,

    // Getters
    availableCurrencies,
    lastUpdateFormatted,

    // Acciones
    fetchExchangeRates,
    getExchangeRate,
    addToHistory,
    fetchHistory,
    setConversionParams,
  };
});
