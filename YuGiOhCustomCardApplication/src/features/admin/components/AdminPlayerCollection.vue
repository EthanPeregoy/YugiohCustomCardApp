
<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { getAdminPlayerCollection } from "../services/adminService";
import type { CollectionCard } from "@/global/services/collectionService";
import CardFilterModal from "@/global/components/CardFilterModal.vue";
import CardDetailsModal from "@/global/components/CardDetailsModal.vue";
import Pagination from "@/global/components/Pagination.vue";
import { createDefaultCardFilters } from "@/global/types/cardFilters";
import { filterAndSortCards } from "@/global/utils/cardFiltering";
import { usePagination } from "@/global/composables/usePagination";
import EditCollectionModal from "./EditCollectionModal.vue";

import "@/features/collection/styles/collection.css";

const props = defineProps<{
  userId: number;
  username: string;
}>();

const collection = ref<CollectionCard[]>([]);

const loading = ref(true);
const error = ref("");

let requestVersion = 0;

const searchQuery = ref("");
const showFilters = ref(false);

const cardFilters = ref(createDefaultCardFilters());

const availableRarities = computed(() =>
  [...new Set(collection.value.map(card => card.rarity))]
);

const filteredCollection = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  const matchingCards = collection.value.filter(card =>
    card.card_name.toLowerCase().includes(query)
  );

  return filterAndSortCards(
    matchingCards,
    cardFilters.value,
    "collection"
  );
});

const totalCopies = computed(() =>
  collection.value.reduce(
    (total, card) => total + card.quantity,
    0
  )
);

const selectedCardId = ref<number | null>(null);

const galleryElement = ref<HTMLElement | null>(null);

const cardsPerPage = ref(28);

let resizeObserver: ResizeObserver | null = null;

const {
  currentPage,
  totalPages,
  displayedItems: paginatedCollection,
  changePage: setPage,
  resetPage,
} = usePagination(
  filteredCollection,
  cardsPerPage
);

const showEditCollection = ref(false);

function updateCardsPerPage() {
  if (!galleryElement.value) return;

  const width = galleryElement.value.clientWidth;

  const columns =
    width <= 420 ? 1 :
    width <= 650 ? 2 :
    width <= 850 ? 3 : 4;

  const newPageSize = columns * 4;

  if (newPageSize === cardsPerPage.value) return;

  const firstIndex =
    (currentPage.value - 1) * cardsPerPage.value;

  cardsPerPage.value = newPageSize;

  currentPage.value = Math.min(
    Math.floor(firstIndex / newPageSize) + 1,
    totalPages.value
  );
}

watch(galleryElement, element => {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (!element) return;

  resizeObserver = new ResizeObserver(
    updateCardsPerPage
  );

  resizeObserver.observe(element);

  updateCardsPerPage();
});

onBeforeUnmount(() => {
  requestVersion++;
  resizeObserver?.disconnect();
});

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;

  setPage(page);

  await nextTick();

  document
    .getElementById("admin-collection-gallery")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}

watch(searchQuery, resetPage);

watch(
  cardFilters,
  resetPage,
  { deep: true }
);

async function loadCollection() {
  const version = ++requestVersion;

  loading.value = true;
  error.value = "";

  collection.value = [];

  searchQuery.value = "";
  cardFilters.value = createDefaultCardFilters();

  selectedCardId.value = null;

  resetPage();

  try {
    const result = await getAdminPlayerCollection(
      props.userId
    );

    // Ignore outdated requests when switching players.
    if (version !== requestVersion) return;

    collection.value = result;
  } catch (err) {
    if (version !== requestVersion) return;

    error.value =
      err instanceof Error
        ? err.message
        : "Failed to load player collection.";
  } finally {
    if (version === requestVersion) {
      loading.value = false;
    }
  }
}

watch(
  () => props.userId,
  loadCollection,
  { immediate: true }
);

async function refreshCollection() {
  const version = ++requestVersion;

  try {
    const result = await getAdminPlayerCollection(props.userId);

    if (version !== requestVersion) return;

    collection.value = result;
    error.value = "";
  } catch (err) {
    if (version !== requestVersion) return;

    error.value =
      err instanceof Error
        ? err.message
        : "Failed to refresh collection.";
  }
}
</script>

<template>
  <div class="admin-collection collection-page">
    <h2 class="admin-collection-title">Player Collection</h2>

    <p v-if="loading" class="collection-message">
      Loading collection...
    </p>

    <div v-else-if="error" class="collection-message">
      <p>{{ error }}</p>
      <button type="button" @click="loadCollection">Retry</button>
    </div>

    <p v-else-if="collection.length === 0" class="collection-message">
      This player has no cards yet.
    </p>

    <div v-else class="results-section">
      <div id="admin-collection-gallery" class="gallery-panel">
        
        <div class="gallery-header admin-gallery-header">
            <div class="admin-gallery-heading">
                <h2>Card Gallery</h2>

                <div class="admin-gallery-stats">
                <span>{{ filteredCollection.length }} collection entries</span>
                <span>{{ totalCopies }} total cards owned</span>
                </div>
            </div>

            <div class="admin-gallery-controls">
                <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search player's collection..."
                />

                <button
                type="button"
                class="search-button"
                @click="showFilters = true"
                >
                Filters
                </button>

                <button
                type="button"
                class="search-button edit-collection-button"
                @click="showEditCollection = true"
                >
                Edit Collection
                </button>
            </div>
        </div>


        <!-- Top pagination -->
        <Pagination
          v-if="filteredCollection.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />

        <p
          v-if="filteredCollection.length === 0"
          class="collection-message"
        >
          No cards match your search or filters.
        </p>

        <!-- Same gallery as the regular Collection -->
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
              @click="selectedCardId = card.card_id"
            >
              <img
                :src="card.image_path || undefined"
                :alt="card.card_name"
                class="card-image"
              />
            </button>

            <div class="collection-card-info">
              <h3>{{ card.card_name }}</h3>

              <div class="collection-card-bottom">
                <div class="collection-card-stats">
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

        <!-- Bottom pagination -->
        <Pagination
          v-if="filteredCollection.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>

    <CardFilterModal
        v-model:open="showFilters"
        v-model="cardFilters"
        mode="shop"
        :available-rarities="availableRarities"
    />

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="selectedCardId = null"
    />

    <EditCollectionModal
        v-if="showEditCollection"
        :user-id="userId"
        :username="username"
        :collection="collection"
        @close="showEditCollection = false"
        @saved="refreshCollection"
    />
  </div>
</template>