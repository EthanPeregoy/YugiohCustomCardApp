<script setup lang="ts">
import { ref, onMounted } from "vue";

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
</script>

<template>
  <main class="container">
    <h1>Card Search</h1>

    <p v-if="loading">Loading cards...</p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <div v-else>
      <p>Found {{ cards.length }} cards.</p>
    </div>
  </main>
</template>