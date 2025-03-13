// src/stores/conversor.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import currencyService from "../services/currency";

export const useConversorStore = defineStore("conversor", () => {
  // Estado
  const exchangeRates = ref({});
  const baseCurrency = ref("USD"); // Cambiado a USD para coincidir con el API
  const lastUpdate = ref(null);
  const history = ref([]);
  const favorites = ref([]);
  const conversionParams = ref({
    fromCurrency: "USD",
    toCurrency: "EUR",
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
      // Usar el servicio para obtener tipos de cambio
      const response = await currencyService.getExchangeRates();

      // Actualizar estado
      exchangeRates.value = response.data.conversion_rates;
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

    // Convertir usando las tasas disponibles (todo está en base USD)
    const fromRateInUSD = from === "USD" ? 1 : exchangeRates.value[from];
    const toRateInUSD = to === "USD" ? 1 : exchangeRates.value[to];

    // Calcular el tipo de cambio directo
    return toRateInUSD / fromRateInUSD;
  }

  // Usar localStorage para historial
  async function fetchHistory() {
    const saved = localStorage.getItem("conversionHistory");
    history.value = saved ? JSON.parse(saved) : [];
    return history.value;
  }

  // Guardar en localStorage
  async function addToHistory(conversion) {
    // Agregar al inicio del historial
    history.value.unshift(conversion);

    // Guardar en localStorage
    localStorage.setItem("conversionHistory", JSON.stringify(history.value));

    return conversion;
  }

  // Obtener favoritos desde localStorage
  async function fetchFavorites() {
    const saved = localStorage.getItem("favoriteConversions");
    favorites.value = saved ? JSON.parse(saved) : [];
    return favorites.value;
  }

  // Agregar favorito a localStorage
  async function addFavorite(favorite) {
    // Generar ID único si no tiene
    const newFavorite = {
      ...favorite,
      _id: favorite._id || Date.now().toString(),
    };

    favorites.value.push(newFavorite);
    localStorage.setItem(
      "favoriteConversions",
      JSON.stringify(favorites.value)
    );

    return newFavorite;
  }

  // Eliminar favorito
  async function removeFavorite(id) {
    favorites.value = favorites.value.filter((fav) => fav._id !== id);
    localStorage.setItem(
      "favoriteConversions",
      JSON.stringify(favorites.value)
    );
    return true;
  }

  // Establecer parámetros de conversión
  function setConversionParams(params) {
    conversionParams.value = { ...conversionParams.value, ...params };
  }

  // Hacer conversión directa usando el servicio
  async function convertCurrency(from, to, amount) {
    try {
      const response = await currencyService.convertCurrency(amount, from, to);
      return response.data.conversion_result;
    } catch (error) {
      console.error("Error en la conversión:", error);
      // Si falla la API, intentamos calcular localmente
      const rate = getExchangeRate(from, to);
      return rate ? amount * rate : null;
    }
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
    convertCurrency,
  };
});
