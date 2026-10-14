<script setup lang="ts">
  import { nextTick, ref } from "vue";
  import { usePackShop } from "./composables/usePackShop.ts";
  import PurchasePackModal from "./components/PurchasePackModal.vue";
  import Pagination from "@/global/components/Pagination.vue";
  import { API_BASE_URL } from "@/global/config/api";

  import "./styles/pack-shop.css";

  const {
    loading,
    error,
    selectedPack,
    searchQuery,
    currentPage,
    filteredPacks,
    totalPages,
    displayedPacks,
    rowsPerPage,
    sortBy,
    includeRestrictedInSort,
    selectedPrice,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    changePage
  } = usePackShop();
  
  const galleryRef = ref<HTMLElement | null>(null);

  async function handlePageChange(page: number) {
    changePage(page);

    await nextTick();

    galleryRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
</script>

<template>
  <main class="pack-shop">
    <header class="shop-header">
      <h1>Pack Shop</h1>
    </header>

    <!-- Search Panel -->
    <section class="search-panel">
      <div class="search-row">
        <input
          v-model="searchQuery"
          type="text"
          class="pack-search"
          placeholder="Search for a pack..."
        />
      </div>
      
      <div class="pack-shop-controls">
        <label>
          Rows per page
          <select v-model="rowsPerPage">
            <option :value="2">2 Rows</option>
            <option :value="3">3 Rows</option>
            <option :value="4">4 Rows</option>
            <option :value="5">5 Rows</option>
            <option value="all">All Packs</option>
          </select>
        </label>

        <label>
          Sort By
          <select v-model="sortBy">
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>

        
        <label>
          Price
          <select v-model="selectedPrice">
            <option value="all">All Prices</option>
            <option :value="30">30 DP</option>
            <option :value="50">50 DP</option>
            <option :value="75">75 DP</option>
            <option :value="100">100 DP</option>
          </select>
        </label>

        
        <label class="restricted-sort-toggle">
          <div class="restricted-sort-text">
            <span>Include Restricted</span>
            <small>Sort restricted packs alongside other packs</small>
          </div>

          <input
            v-model="includeRestrictedInSort"
            type="checkbox"
            class="restricted-toggle-input"
          />

          <span class="restricted-toggle-slider"></span>
        </label>
      </div>

      <div class="search-info">
        <span>{{ filteredPacks.length }} packs found</span>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
      </div>
    </section>

    <!-- Pack Gallery -->
    <section ref="galleryRef" class="gallery-panel">
      <div class="gallery-header">
        <h2>Pack Gallery</h2>
        <span>{{ displayedPacks.length }} packs displayed</span>
      </div>

      <Pagination
        v-if="!loading && !error"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="handlePageChange"
      />

      <p v-if="loading" class="status-message">
        Loading packs...
      </p>

      <p v-else-if="error" class="status-message error">
        {{ error }}
      </p>

      <p
        v-else-if="filteredPacks.length === 0"
        class="status-message"
      >
        No packs match your search.
      </p>

      <div v-else class="pack-grid">
        <article
          v-for="pack in displayedPacks"
          :key="pack.id"
          class="pack-card"
          role="link"
          tabindex="0"
          @click="$router.push(`/packs/${pack.id}`)"
          @keydown.enter="$router.push(`/packs/${pack.id}`)"
        >
          <div class="pack-image-container">
            <img
              v-if="pack.image_path"
              :src="`${API_BASE_URL}${pack.image_path}`"
              :alt="pack.name"
              class="pack-image"
            />

            <div v-else class="pack-placeholder">
              No Artwork
            </div>

            <span
              v-if="pack.restricted"
              class="restricted-badge"
            >
              Restricted
            </span>
          </div>

          <div class="pack-details">
            <h3>{{ pack.name }}</h3>

            <p class="pack-description">
              {{ pack.description }}
            </p>

            <div class="pack-footer">
              <span class="pack-price">
                {{ pack.price.toLocaleString() }} DP
              </span>

              <button
                type="button"
                class="purchase-button"
                v-if="pack.is_published"
                @click.stop="openPurchaseModal(pack)"
              >
                Purchase
              </button>

              <span v-else class="unpublished-badge">
                Unreleased
              </span>
            </div>
          </div>
        </article>
      </div>

      <Pagination
        v-if="!loading && !error"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="handlePageChange"
      />
    </section>

    <PurchasePackModal
      v-if="selectedPack"
      :pack-id="selectedPack.id"
      :pack-name="selectedPack.name"
      :pack-price="selectedPack.price"
      :pack-image="selectedPack.image_path"
      @close="closePurchaseModal"
      @purchased="handlePurchase"
    />
  </main>
</template>