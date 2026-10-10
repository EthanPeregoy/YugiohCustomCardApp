<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useCollection } from "../composables/useCollection";
import CardDetailsModal from "../components/CardDetailsModal.vue";

import "../styles/collection.css";

const {
  collection,
  selectedCardId,
  filteredCollection,
  paginatedCollection,
  searchQuery,
  loading,
  error,
  currentPage,
  totalPages,
  galleryElement,
  openCard,
  closeCard,
  changePage
} = useCollection();

</script>

<template>
  <main class="container collection-page">
    <h1>My Collection</h1>

    <!-- Search Panel -->
    <div class="search-panel">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search your collection..."
        />
      </div>

      <div
        v-if="!loading && !error"
        class="search-info"
      >
        <span>
          {{ filteredCollection.length }} collection entries found
        </span>

        <span>
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <span>
          {{ collection.reduce((total, card) => total + card.quantity, 0) }}
          total cards owned
        </span>
      </div>
    </div>

    <!-- Loading -->
    <p v-if="loading" class="collection-message">
      Loading collection...
    </p>

    <!-- Error -->
    <p v-else-if="error" class="collection-message">
      {{ error }}
    </p>

    <!-- Empty Collection -->
    <p
      v-else-if="collection.length === 0"
      class="collection-message"
    >
      Your collection is empty.
    </p>

    <!-- Card Gallery -->
    <div v-else class="results-section">
      <div class="gallery-panel" id="collection-gallery">

        <div class="gallery-header">
          <h2>Card Gallery</h2>

          <span>
            {{ paginatedCollection.length }} cards displayed
          </span>
        </div>
        <div v-if="filteredCollection.length > 0" class="pagination">
          <button
            class="pagination-button"
            @click="changePage('previous')"
            :disabled="currentPage === 1"
          >
            ← Previous
          </button>

          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            class="pagination-button"
            @click="changePage('next')"
            :disabled="currentPage >= totalPages"
          >
            Next →
          </button>
        </div>

        <p
          v-if="filteredCollection.length === 0"
          class="collection-message"
        >
          No cards match your search.
        </p>

        <div v-else ref="galleryElement" class="card-results">
          <div
            v-for="card in paginatedCollection"
            :key="card.id"
            class="card-result collection-result"
          >
            <button
              type="button"
              class="card-select-button"
              :aria-label="`View ${card.card_name} details`"
              @click="openCard(card.card_id)"
            >
              <img
                :src="card.image_path || undefined"
                :alt="card.card_name"
                class="card-image"
              />
            </button>

            <div class="collection-card-info">
              <h3>{{ card.card_name }}</h3>

              <p class="collection-card-rarity">
                {{ card.rarity }}
              </p>

              <p class="collection-card-quantity">
                Owned: {{ card.quantity }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Card Details Modal -->
    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
  </main>
</template>