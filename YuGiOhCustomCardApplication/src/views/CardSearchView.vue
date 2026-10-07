<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
const searchQuery = ref("");

const cards = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

async function getCards() {
  try {
    const response = await fetch("http://localhost:3000/api/cards");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    cards.value = await response.json();

    console.log(cards.value);
  } catch (err) {
    console.error(err);
    error.value = "Could not load cards.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getCards();
});

async function searchCards(query: string) {
  loading.value = true;
  error.value = "";

  try {
    if (!query) {
        const response = await fetch("http://localhost:3000/api/cards");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        cards.value = await response.json();
        loading.value = false;
        return;
    }

    const response = await fetch(`http://localhost:3000/api/cards/name/${query}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    cards.value = await response.json();

    console.log(cards.value);
  } catch (err) {
    console.error(err);
    error.value = "Could not load cards.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="container">
    <h1>Card Search</h1>

    <div class="search-bar">
        <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a card..."
        />

        <button @click="searchCards(searchQuery)">
        Search
    </button>
    </div>

    <p v-if="loading">Loading cards...</p>

    <div v-if="cards.length > 0">
      <p>Found {{ cards.length }} cards.</p>
      <div class="card-results">
        <div
          v-for="card in cards"
          :key="card.id"
          :to="`/cards/${card.id}`"
          class="card-result"
        >
          <RouterLink :to="`/cards/${card.id}`" class="card-result-link">
          <img
            :src="card.image_path"
            :alt="card.cardname"
            class="card-image"
          />
          </RouterLink>
        </div>
      </div>
    </div>
    <p v-else-if="!loading && cards.length === 0 && !error">
      No cards found.
    </p>
    <p v-else-if="!loading && cards.length === 0 && error">
      Could not load cards.
    </p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <div v-else>
      <p>Found {{ cards.length }} cards.</p>
    </div>
  </main>
</template>