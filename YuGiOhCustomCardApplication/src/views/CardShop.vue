
<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch
} from "vue";import CardDetailsModal from "../components/CardDetailsModal.vue";
import "../styles/card-search.css";
import "../styles/card-shop.css";

interface ShopCard {
  id: number;
  cardname: string;
  image_path: string;
  rarity: string;
  price: number;
}

const cards = ref<ShopCard[]>([]);
const searchQuery = ref("");
const activeSearch = ref("");
const loading = ref(true);
const error = ref("");

const selectedCardId = ref<number | null>(null);

const currentPage = ref(1);
const columnsPerRow = ref(5);

const galleryRef = ref<HTMLElement | null>(null);
let galleryObserver: ResizeObserver | null = null;

function updateColumns(width: number) {
  const minimumCardWidth = 155;
  const gap = 20;
  const horizontalPadding = 40;

  const availableWidth = Math.max(0, width - horizontalPadding);

  columnsPerRow.value = Math.max(
    1,
    Math.floor((availableWidth + gap) / (minimumCardWidth + gap))
  );
}

const cardsPerPage = computed(() => columnsPerRow.value * 4);

const filteredCards = computed(() => {
  const query = activeSearch.value.trim().toLowerCase();

  return cards.value.filter(card =>
    (card.cardname ?? "").toLowerCase().includes(query)
  );
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCards.value.length / cardsPerPage.value))
);

watch(totalPages, newTotal => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal;
  }
});

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage.value;
  return filteredCards.value.slice(start, start + cardsPerPage.value);
});

async function loadCards() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(
      "http://localhost:3000/api/card-shop"
    );

    if (!response.ok) {
      throw new Error("Failed to load shop cards");
    }

    cards.value = await response.json();

  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}

function searchCards() {
  activeSearch.value = searchQuery.value;
  currentPage.value = 1;
}

function openCard(cardId: number) {
  selectedCardId.value = cardId;
}

function closeCard() {
  selectedCardId.value = null;
}

async function changePage(direction: "next" | "previous") {
  if (direction === "next" && currentPage.value < totalPages.value) {
    currentPage.value++;
  } else if (direction === "previous" && currentPage.value > 1) {
    currentPage.value--;
  }

  await nextTick();

  document.getElementById("card-gallery")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

onMounted(async () => {
  await loadCards();
  await nextTick();

  if (galleryRef.value) {
    galleryObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;

      if (width !== undefined) {
        updateColumns(width);
      }
    });

    galleryObserver.observe(galleryRef.value);
  }
});

onUnmounted(() => {
  galleryObserver?.disconnect();
});
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

        <div class="pagination">
          <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="changePage('previous')"
          >
            ← Previous
          </button>

          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            class="pagination-button"
            :disabled="currentPage >= totalPages"
            @click="changePage('next')"
          >
            Next →
          </button>
        </div>

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
                :alt="card.cardname"
                class="card-image"
              />
            </button>

            <div class="shop-card-info">
              <span>{{ card.rarity }}</span>
              <strong>{{ card.price }} DP</strong>
            </div>
          </div>
        </div>

        <div class="pagination">
          <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="changePage('previous')"
          >
            ← Previous
          </button>

          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            class="pagination-button"
            :disabled="currentPage >= totalPages"
            @click="changePage('next')"
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