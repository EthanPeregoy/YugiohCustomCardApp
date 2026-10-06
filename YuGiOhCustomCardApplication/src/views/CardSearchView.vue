<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";

const searchQuery = ref("");

function searchCards() {
  console.log("Searching for:", searchQuery.value);
}
</script>

<template>
  <main class="container">
    <h1>Card Search</h1>

    <form class="row" @submit.prevent="searchCards">
      <input
        id="card-search-input"
        v-model="searchQuery"
        placeholder="Search for a card..."
      />
      <button type="submit">Search</button>
    </form>

    <p></p>

    <RouterLink to="/" class="nav-button">
      Home
    </RouterLink>
  </main>
</template>