<script setup lang="ts">
  import { ref } from "vue";
  import { useCardSearch } from "./composables/useCardSearch.ts";
  import CardFilterModal from "@/global/components/CardFilterModal.vue";
  import CardDetailsModal from "@/global/components/CardDetailsModal.vue";
  import Pagination from "@/global/components/Pagination.vue";
  
  import "./styles/card-search.css";
  
  const {
    searchQuery,
    cardFilters,
    filteredCards,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedCards,
    galleryElement,
    selectedCardId,
    searchCards,
    openCard,
    closeCard,
    changePage
  } = useCardSearch();

  const showFilters = ref(false);
</script>

<template>
  <main class="container">
    <h1>Card Search</h1>

    <div class="search-panel">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search for a card..."
          @keyup.enter="searchCards(searchQuery)"
        />

        <button
          class="search-button"
          @click="searchCards(searchQuery)"
        >
          Search
        </button>
        <button
          type="button"
          class="search-button"
          @click="showFilters = true"
        >
          Filters
        </button>
      </div>

      <div class="search-info" v-if="!loading && !error">
        <span>{{ filteredCards.length }} cards found</span>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
      </div>
    </div>

    <p v-if="loading">Loading cards...</p>

    <p v-else-if="error">{{ error }}</p>

    <p v-else-if="filteredCards.length === 0">
      No cards found.
    </p>

    <div v-else class="results-section">
      <div class="gallery-panel" id="card-gallery">

        <div class="gallery-header">
          <h2>Card Gallery</h2>
          <span>{{ paginatedCards.length }} cards displayed</span>
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />

      <div ref="galleryElement" class="card-results">
        <div
          v-for="card in paginatedCards"
          :key="card.id"
          class="card-result"
        >
          <button
            type="button"
            class="card-result-link card-select-button"
            @click="openCard(card.id)"
          >
            <img
              :src="card.image_path"
              :alt="card.cardname"
              class="card-image"
            />
          </button>
        </div>
      </div>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="changePage"
      />
    </div>
    </div>

    <CardFilterModal
      v-model:open="showFilters"
      v-model="cardFilters"
      mode="search"
    />

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
  </main>
</template>