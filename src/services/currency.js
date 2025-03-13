// src/services/currency.js
import axios from "axios";

// Tu API key
const API_KEY = "36ff3414b020d51c1f75625f";
const BASE_URL = "https://v6.exchangerate-api.com/v6/";

const apiClient = axios.create({
  baseURL: BASE_URL + API_KEY,
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  // Obtener todos los tipos de cambio disponibles
  getExchangeRates() {
    return apiClient.get("/latest/USD");
  },

  // Convertir una cantidad de una moneda a otra
  convertCurrency(amount, fromCurrency, toCurrency) {
    return apiClient.get(`/pair/${fromCurrency}/${toCurrency}/${amount}`);
  },

  // Obtener todas las monedas disponibles
  getSupportedCurrencies() {
    return apiClient.get("/codes");
  },
};
