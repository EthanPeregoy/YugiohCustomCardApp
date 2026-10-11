<script setup lang="ts">
import { ref } from "vue";
import { useCollection } from "../composables/useCollection";
import CardDetailsModal from "../components/CardDetailsModal.vue";
import CardFilterModal from "../components/CardFilterModal.vue";
import SellCardModal from "../components/SellCardModal.vue";
import type { CollectionCard, CardSaleResult } from "../services/collectionService";

import "../styles/collection.css";

const {
  collection,
  cardFilters,
  availableRarities,
  availableTags,
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
  changePage,
  loadCollection
} = useCollection();

const showSellModal = ref(false);
const selectedSaleCard = ref<CollectionCard | null>(null);

const saleMessage = ref("");
const affectedDeckNames = ref<string[]>([]);

function canSellAutomatically(rarity: string) {
  return [
    "Common",
    "Rare",
    "Super Rare"
  ].includes(rarity);
}

function openSellModal(card: CollectionCard) {
  selectedSaleCard.value = card;
  showSellModal.value = true;
}

async function handleSale(result: CardSaleResult) {
  saleMessage.value =
    `Sold ${result.quantitySold} × ${result.cardName} ` +
    `(${result.rarity}) for ${result.earnedDP} DP. ` +
    `Balance: ${result.remainingDuelPoints} DP.`;

  affectedDeckNames.value = result.affectedDecks.map(
    deck => deck.name
  );

  selectedSaleCard.value = null;

  await loadCollection(false);
}

const showFilters = ref(false);

</script>

<template>
  <main class="container collection-page">
    <h1>My Collection</h1>

    <div
      v-if="saleMessage"
      class="collection-sale-feedback"
      role="status"
    >
      <p>{{ saleMessage }}</p>

      <p v-if="affectedDeckNames.length > 0">
        Marked invalid after removing excess copies:
        {{ affectedDeckNames.join(", ") }}.
      </p>

      <button
        type="button"
        class="collection-sell-button"
        @click="
          saleMessage = '';
          affectedDeckNames = [];
        "
      >
        Dismiss
      </button>
    </div>

    <!-- Search Panel -->
    <div class="search-panel">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search your collection..."
        />

        <button
          type="button"
          class="search-button"
          @click="showFilters = true"
        >
          Filters
        </button>
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

              <button
                v-if="canSellAutomatically(card.rarity)"
                type="button"
                class="collection-sell-button"
                @click="openSellModal(card)"
              >
                Sell
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <CardFilterModal
      v-model:open="showFilters"
      v-model="cardFilters"
      mode="collection"
      :available-rarities="availableRarities"
      :available-tags="availableTags"
    />

    <SellCardModal
      v-model:open="showSellModal"
      :card="selectedSaleCard"
      @sold="handleSale"
    />

    <!-- Card Details Modal -->
    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
  </main>
</template>