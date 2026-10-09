<script setup lang="ts">
  import { ref, nextTick } from "vue";
  import { useCardSearch } from "../composables/useCardSearch";
  import CardDetailsModal from "../components/CardDetailsModal.vue";

  const {
    searchQuery,
    cards,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedCards,
    galleryElement,
    searchCards,
    nextPage,
    previousPage,
  } = useCardSearch();

  const selectedCardId = ref<number | null>(null);

  function openCard(cardId: number) {
    selectedCardId.value = cardId;
  }

  function closeCard() {
    selectedCardId.value = null;
  }

  async function changePage(direction: "next" | "previous") {
    if (direction === "next") {
      nextPage();
    } else {
      previousPage();
    }

    await nextTick();

    document.getElementById("card-gallery")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
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
      </div>

      <div class="search-info" v-if="!loading && !error">
        <span>{{ cards.length }} cards found</span>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
      </div>
    </div>

    <p v-if="loading">Loading cards...</p>

    <p v-else-if="error">{{ error }}</p>

    <p v-else-if="cards.length === 0">
      No cards found.
    </p>

    <div v-else class="results-section">
      <div class="gallery-panel" id="card-gallery">

        <div class="gallery-header">
          <h2>Card Gallery</h2>
          <span>{{ paginatedCards.length }} cards displayed</span>
        </div>

    <div class="pagination">
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

      <div class="pagination">
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
    </div>
    </div>

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
  </main>
</template>