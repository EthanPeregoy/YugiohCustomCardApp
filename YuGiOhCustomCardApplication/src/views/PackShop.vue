<script setup lang="ts">
  import { usePackShop } from "../composables/usePackShop";
  import PurchasePackModal from "../components/PurchasePackModal.vue";

  import "../styles/pack-shop.css";

  const {
    packs,
    loading,
    error,
    selectedPack,
    searchQuery,
    currentPage,
    filteredPacks,
    totalPages,
    displayedPacks,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    changePage
  } = usePackShop();
</script>

<template>
  <main class="pack-shop">
    <header class="shop-header">
      <h1>Pack Shop</h1>
      <p>Expand your collection with new booster packs!</p>
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

      <div class="search-info">
        <span>{{ filteredPacks.length }} packs found</span>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
      </div>
    </section>

    <!-- Pack Gallery -->
    <section class="gallery-panel">
      <div class="gallery-header">
        <h2>Pack Gallery</h2>
        <span>{{ displayedPacks.length }} packs displayed</span>
      </div>

      <div
        v-if="!loading && !error && totalPages > 1"
        class="pagination"
      >
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          ← Previous
        </button>

        <span>
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next →
        </button>
      </div>

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
              :src="`http://localhost:3000${pack.image_path}`"
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
                @click.stop="openPurchaseModal(pack)"
              >
                Purchase
              </button>
            </div>
          </div>
        </article>
      </div>
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