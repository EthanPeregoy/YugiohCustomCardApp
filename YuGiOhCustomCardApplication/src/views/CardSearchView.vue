<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const searchQuery = ref(
  typeof route.query.search === "string"
    ? route.query.search
    : ""
);
const cards = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

const currentPage = ref(
  Number(route.query.page) || 1
);const cardsPerPage = 30;

const totalPages = computed(() =>
  Math.ceil(cards.value.length / cardsPerPage)
);

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage;
  const end = start + cardsPerPage;

  return cards.value.slice(start, end);
});

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updateSearchURL();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    updateSearchURL();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateSearchURL() {
  router.replace({
    path: "/cards",
    query: {
      search: searchQuery.value || undefined,
      page: currentPage.value
    }
  });
}

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
  if (searchQuery.value) {
    searchCards(searchQuery.value, false);
  } else {
    getCards();
  }
});

async function searchCards(query: string, resetPage = true) {
  loading.value = true;
  error.value = "";

  try {
    if (!query) {
      const response = await fetch("http://localhost:3000/api/cards");

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      cards.value = await response.json();

      if (resetPage) {
        currentPage.value = 1;
      }
      updateSearchURL();

      loading.value = false;
      return;
    }

    const response = await fetch(`http://localhost:3000/api/cards/name/${query}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    cards.value = await response.json();
    if (resetPage) {
      currentPage.value = 1;
    }
    updateSearchURL();

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
        <button @click="previousPage" :disabled="currentPage === 1">
        Previous
        </button>
        <button @click="nextPage" :disabled="currentPage === totalPages">
        Next
        </button>
    </div>

    <RouterLink to="/" class="nav-button">
      Home
    </RouterLink>

    <p v-if="loading">Loading cards...</p>

    <div v-if="cards.length > 0">
      <p>Found {{ cards.length }} cards. Showing page {{ currentPage }} of {{ totalPages }}.</p>
      <div class="card-results">
        <div
          v-for="card in paginatedCards"
          :key="card.id"
          :to="`/cards/${card.id}`"
          class="card-result"
        >
          <RouterLink
            :to="{
              path: `/cards/${card.id}`,
              query: {
                search: searchQuery || undefined,
                page: currentPage
              }
            }"
            class="card-result-link"
          >
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
      <p>Found {{ cards.length }} cards. Showing page {{ currentPage }} of {{ totalPages }}.</p>
    </div>
  </main>
</template>