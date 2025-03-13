// Estructura del proyecto para la aplicación Conversor de Monedas

// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import InicioView from "../views/InicioView.vue";
import HistorialView from "../views/HistorialView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "inicio",
      component: InicioView,
    },
    {
      path: "/historial",
      name: "historial",
      component: HistorialView,
    },
  ],
});

export default router;
