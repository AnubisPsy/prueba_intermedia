// src/stores/conversor-updated.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

// API URLs
const API_BASE_URL = "http://localhost:3000/api"; // URL del backend
const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/";

export const useConversorStore = defineStore("conversor", () => {
  // Estado
  const exchangeRates = ref({});
  const baseCurrency = ref("EUR");
  const lastUpdate = ref(null);
  const history = ref([]);
  const favorites = ref([]);
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
      // Llamar a la API de tipos de cambio real
      const response = await axios.get(
        `${EXCHANGE_RATE_API_URL}${baseCurrency.value}`
      );

      // Actualizar estado
      exchangeRates.value = response.data.rates;
      lastUpdate.value = new Date().toISOString();

      return response.data;
    } catch (error) {
      console.error("Error obteniendo tipos de cambio:", error);
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

  // Cargar historial desde el backend (MongoDB)
  async function fetchHistory() {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      history.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      throw error;
    }
  }

  // Agregar una conversión al historial
  async function addToHistory(conversion) {
    try {
      // Guardar en el backend (MongoDB)
      await axios.post(`${API_BASE_URL}/history`, conversion);

      // Actualizar estado local
      history.value.unshift(conversion);

      return conversion;
    } catch (error) {
      console.error("Error guardando conversión en el historial:", error);
      throw error;
    }
  }

  // Cargar favoritos desde el backend (MongoDB)
  async function fetchFavorites() {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`);
      favorites.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Error obteniendo favoritos:", error);
      throw error;
    }
  }

  // Agregar favorito
  async function addFavorite(favorite) {
    try {
      const response = await axios.post(`${API_BASE_URL}/favorites`, favorite);

      // Agregar a la lista local con el ID asignado por MongoDB
      const newFavorite = { ...favorite, _id: response.data.insertedId };
      favorites.value.push(newFavorite);

      return newFavorite;
    } catch (error) {
      console.error("Error guardando favorito:", error);
      throw error;
    }
  }

  // Eliminar favorito
  async function removeFavorite(id) {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/${id}`);

      // Actualizar estado local
      favorites.value = favorites.value.filter((fav) => fav._id !== id);

      return true;
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      throw error;
    }
  }

  // Establecer parámetros de conversión
  function setConversionParams(params) {
    conversionParams.value = { ...conversionParams.value, ...params };
  }

  return {
    // Estado
    exchangeRates,
    baseCurrency,
    lastUpdate,
    history,
    favorites,
    conversionParams,

    // Getters
    availableCurrencies,
    lastUpdateFormatted,

    // Acciones
    fetchExchangeRates,
    getExchangeRate,
    fetchHistory,
    addToHistory,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    setConversionParams,
  };
});
  