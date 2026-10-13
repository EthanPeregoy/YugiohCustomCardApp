<script setup lang="ts">
  import CardDetailsModal from "../../global/components/CardDetailsModal.vue";
  import { useCardShop } from "./composables/useCardShop.ts";
  import "./styles/card-shop.css";
  import Pagination from "@/global/components/Pagination.vue";
  import CardFilterModal from "@/global/components/CardFilterModal.vue";

  const {
    searchQuery,
    loading,
    error,
    selectedCardId,
    selectedCard,
    purchaseMessage,
    purchaseError,
    currentPage,
    columnsPerRow,
    galleryRef,
    filteredCards,
    totalPages,
    paginatedCards,
    cardFilters,
    showFilters,
    availableRarities,
    searchCards,
    openCard,
    closeCard,
    purchaseCard,
    changePage
  } = useCardShop();
</script>


<template>
  <main class="container">
    <h1>Card Shop</h1>

    <div class="search-panel">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search for a card..."
          @keyup.enter="searchCards"
        />

        <button class="search-button" @click="searchCards">
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

    <p v-if="loading">Loading shop cards...</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="filteredCards.length === 0">
      No cards found.
    </p>

    <div v-else class="results-section">
      <div class="gallery-panel" id="card-gallery" ref="galleryRef">
        <div class="gallery-header">
          <h2>Available Cards</h2>
          <span>{{ paginatedCards.length }} cards displayed</span>
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />

        <div class="card-results" :style="{gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))`}">
          <div
            v-for="card in paginatedCards"
            :key="card.id"
            class="shop-card"
          >
            <button
              type="button"
              class="card-result-link card-select-button"
              @click="openCard(card.id)"
            >
              <img
                :src="card.image_path"
                :alt="card.card_name"
                class="card-image"
              />
            </button>

            <div class="shop-card-info">
              <span>{{ card.rarity }}</span>

              <div class="shop-card-pricing">
                <span
                  v-if="card.discount_percent > 0"
                  class="shop-original-price"
                >
                  {{ card.base_price }} DP
                </span>

                <strong>{{ card.price }} DP</strong>

                <span
                  v-if="card.discount_percent > 0"
                  class="shop-discount"
                >
                  {{ card.discount_percent }}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>

    <div
      v-if="purchaseMessage || purchaseError"
      class="shop-notification"
    >
      <p v-if="purchaseMessage" class="shop-success">
        {{ purchaseMessage }}
      </p>

      <p v-if="purchaseError" class="shop-error">
        {{ purchaseError }}
      </p>

      <button
        type="button"
        @click="purchaseMessage = ''; purchaseError = ''"
      >
        Dismiss
      </button>
    </div>

    <CardDetailsModal
      :card-id="selectedCardId"
      :price="selectedCard?.price"
      :rarity="selectedCard?.rarity"
      @close="closeCard"
      @purchase="purchaseCard"
    />
  </main>
  
  <CardFilterModal
    v-model:open="showFilters"
    v-model="cardFilters"
    mode="shop"
    :available-rarities="availableRarities"
  />

</template>