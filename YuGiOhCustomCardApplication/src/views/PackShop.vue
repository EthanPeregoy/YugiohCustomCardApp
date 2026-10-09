<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

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

              <button class="purchase-button" disabled>
                Purchase
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.pack-shop {
  width: 100%;
  max-width: 1450px;
  margin: 0 auto;
  padding: 20px 30px 60px;
  box-sizing: border-box;
}

/* Header */

.shop-header {
  text-align: center;
  margin-bottom: 35px;
}

.shop-header h1 {
  font-size: 3rem;
  margin: 0 0 10px;
  color: #f0dfff;
  font-variant: small-caps;
  text-shadow: 2px 3px 3px black;
}

.shop-header p {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;

  text-shadow:
    1px 1px 3px #000000,
    0 0 8px #000000,
    0 0 15px rgba(0, 0, 0, 0.8);
}

/* Search Panel */

.search-panel {
  width: 100%;
  max-width: 630px;
  margin: 0 auto 50px;
  padding: 18px 20px;
  box-sizing: border-box;

  background: linear-gradient(
    145deg,
    rgba(15, 7, 29, 0.96),
    rgba(44, 27, 68, 0.96)
  );

  border: 1px solid #8054ad;
  border-radius: 13px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
}

.search-row {
  display: flex;
  gap: 12px;
}

.pack-search {
  flex: 1;
  min-width: 0;
  padding: 12px 15px;

  background: #10091d;
  border: 1px solid #67438d;
  border-radius: 7px;

  color: white;
  font-size: 0.95rem;
}

.pack-search:focus {
  outline: none;
  border-color: #bb8aff;
}

.search-info {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  margin-top: 14px;
  padding-top: 14px;

  border-top: 1px solid #50356d;
  color: #d7c7e8;
  font-size: 0.85rem;
}

/* Gallery */

.gallery-panel {
  background: linear-gradient(
    120deg,
    rgba(13, 5, 27, 0.96),
    rgba(35, 23, 58, 0.95),
    rgba(13, 5, 27, 0.96)
  );

  border: 1px solid #71469e;
  border-radius: 13px;

  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 0 8px 14px;
  border-bottom: 1px solid #51316e;
}

.gallery-header h2 {
  color: #ead8fa;
  font-size: 1.45rem;
  margin: 0;
}

.gallery-header span {
  color: #cbb7df;
  font-size: 0.85rem;
}

/* Pagination */

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  margin: 25px 0 35px;
}

.pagination button {
  padding: 10px 18px;
  background: #28163e;
  color: white;

  border: 1px solid #8054ad;
  border-radius: 8px;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background: #69439c;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination span {
  color: #ead8fa;
  font-weight: 600;
}

/* Pack Grid */

.pack-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(250px, 1fr)
  );

  gap: 25px;
  padding: 25px 10px 15px;
}

/* Pack Cards */

.pack-card {
  background: linear-gradient(
    145deg,
    #21172e,
    #140d20
  );

  border: 1px solid #61417f;
  border-radius: 12px;
  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  cursor: pointer;
}

.pack-card:hover {
  transform: translateY(-5px);
  border-color: #ad7bdb;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.pack-image-container {
  position: relative;
  height: 310px;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 18px;
  background: rgba(8, 5, 17, 0.85);
}

.pack-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pack-placeholder {
  color: #a998b8;
  font-style: italic;
}

.restricted-badge {
  position: absolute;
  top: 12px;
  right: 12px;

  padding: 7px 11px;
  background: #92383e;
  color: white;

  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Pack Details */

.pack-details {
  padding: 18px;
}

.pack-details h3 {
  margin: 0 0 12px;
  font-size: 1.25rem;
  color: #f2e6ff;
}

.pack-description {
  min-height: 65px;
  color: #cbbfd7;
  font-size: 0.9rem;
  line-height: 1.5;
}

.pack-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  margin-top: 18px;
}

.pack-price {
  color: #f4cf65;
  font-weight: bold;
  font-size: 1.1rem;
}

.purchase-button {
  padding: 10px 17px;
  background: #644198;
  color: white;

  border: none;
  border-radius: 7px;
  font-weight: bold;
}

.purchase-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status */

.status-message {
  text-align: center;
  color: #d3c1e4;
  padding: 45px 0;
}

.error {
  color: #ff8888;
}

/* Responsive */

@media (max-width: 650px) {
  .pack-shop {
    padding: 20px 15px 40px;
  }

  .gallery-panel {
    padding: 15px;
  }

  .pack-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    gap: 10px;
  }
}
</style>