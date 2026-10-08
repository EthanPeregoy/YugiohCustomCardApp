<script setup lang="ts">
  import { RouterLink } from "vue-router";
  import { useCardSearch } from "../composables/useCardSearch";

  const {
    searchQuery,
    cards,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedCards,
    searchCards,
    nextPage,
    previousPage,
  } = useCardSearch();
</script>

<template>
  <main class="container">
    <h1>Card Search</h1>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a card..."
        @keyup.enter="searchCards(searchQuery)"
      />

      <button @click="searchCards(searchQuery)">
        Search
      </button>

      <button
        @click="previousPage"
        :disabled="currentPage === 1"
      >
        Previous
      </button>

      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
      >
        Next
      </button>
    </div>

    <RouterLink to="/home" class="nav-button">
      Home
    </RouterLink>

    <p v-if="loading">Loading cards...</p>

    <p v-else-if="error">{{ error }}</p>

    <p v-else-if="cards.length === 0">
      No cards found.
    </p>

    <div v-else>
      <p>
        Found {{ cards.length }} cards.
        Showing page {{ currentPage }} of {{ totalPages }}.
      </p>

      <div class="card-results">
        <div
          v-for="card in paginatedCards"
          :key="card.id"
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
  </main>
</template>