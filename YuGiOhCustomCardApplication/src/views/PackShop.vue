<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import PurchasePackModal from "../components/PurchasePackModal.vue";
import "../styles/pack-shop.css";

interface Pack {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  price: number;
  restricted: boolean;
}

const packs = ref<Pack[]>([]);
const loading = ref(true);
const error = ref("");

const selectedPack = ref<Pack | null>(null);

function openPurchaseModal(pack: Pack) {
  selectedPack.value = pack;
}

function closePurchaseModal() {
  selectedPack.value = null;
}

function handlePurchase(remainingDuelPoints: number) {
  console.log(
    "Pack purchased! Remaining Duel Points:",
    remainingDuelPoints
  );
}

const searchQuery = ref("");
const currentPage = ref(1);
const packsPerPage = 6;

const filteredPacks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return packs.value.filter(pack =>
    pack.name.toLowerCase().includes(query) ||
    (pack.description ?? "").toLowerCase().includes(query)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPacks.value.length / packsPerPage))
);

const displayedPacks = computed(() => {
  const start = (currentPage.value - 1) * packsPerPage;

  return filteredPacks.value.slice(start, start + packsPerPage);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;

  currentPage.value = page;
}

async function loadPacks() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/packs",
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load packs");
    }

    const data = await response.json();

    packs.value = Array.isArray(data)
      ? data
      : data.packs ?? [];

  } catch (err) {
    console.error(err);
    error.value = "Unable to load the Pack Shop.";

  } finally {
    loading.value = false;
  }
}

onMounted(loadPacks);
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