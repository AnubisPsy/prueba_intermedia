<!-- src/App.vue -->
<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">
        <img src="./assets/logo.svg" alt="Logo Conversor de Monedas" />
        <h1>Conversor de Monedas en Tiempo Real</h1>
      </div>
      <nav class="nav-menu">
        <router-link to="/">Inicio</router-link>
        <router-link to="/historial">Historial</router-link>
      </nav>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>© 2025 Conversor de Monedas - Desarrollado con Vue.js</p>
    </footer>
  </div>
</template>

<script setup>
// Importaciones y lógica del componente
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f7;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo img {
  height: 40px;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>
