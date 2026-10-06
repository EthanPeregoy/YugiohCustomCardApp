<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
/* =========================
   Global Styles
   ========================= */

:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  width: 100%;
  min-height: 100%;
  margin: 0;
}


/* =========================
   Main Page Layout
   ========================= */

main {
  min-height: 100vh;

  background-image: url("./assets/DarkHole.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  background-size: cover;
}

.container {
  margin: 0;

  display: flex;
  flex-direction: column;
}

.row {
  margin-top: 2vh;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 5px;
}

.card-search-input {
  width: 300px;
}


/* =========================
   Headings
   ========================= */

h1 {
  padding-top: 10vh;

  position: sticky;
  text-align: center;
}


/* =========================
   Links & Navigation
   ========================= */

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

.nav-button {
  align-self: center;

  padding: 0.6em 1.2em;

  border: 1px solid transparent;
  border-radius: 8px;

  font-family: inherit;
  font-size: 1em;
  font-weight: 500;

  color: #ffffff;
  background-color: #000000;

  text-decoration: none;
  cursor: pointer;

  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

.nav-button:hover {
  border-color: #396cd8;
}


/* =========================
   Inputs & Buttons
   ========================= */

input,
button {
  padding: 0.6em 1.2em;

  border: 1px solid transparent;
  border-radius: 8px;
  outline: none;

  font-family: inherit;
  font-size: 1em;
  font-weight: 500;

  color: #0f0f0f;
  background-color: #ffffff;

  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}

button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

#greet-input {
  margin-right: 5px;
}


/* =========================
   Dark Mode
   ========================= */

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }

  button:active {
    background-color: #0f0f0f69;
  }
}
</style>