// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import InicioView from "../views/InicioView.vue";
import HistorialView from "../views/HistorialView.vue";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Importante: usar process.env
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
