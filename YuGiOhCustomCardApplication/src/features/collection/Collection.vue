<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCollection } from "./composables/useCollection.ts";
import CardDetailsModal from "@/global/components/CardDetailsModal.vue";
import CardFilterModal from "@/global/components/CardFilterModal.vue";
import SellCardModal from "./components/SellCardModal.vue";
import CollectionTagModal from "./components/CollectionTagModal.vue";
import BulkTagModal from "./components/BulkTagModal.vue";
import Pagination from "@/global/components/Pagination.vue";
import { submitCollectionImport } from "./services/collectionImportServices.ts";

import type { CollectionCard, CardSaleResult } from "../../global/services/collectionService.ts";

import "./styles/collection.css";

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

const csvFileInput = ref<HTMLInputElement | null>(null);
const importingCSV = ref(false);
const importMessage = ref("");
const importError = ref("");

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

const showTagModal = ref(false);
const tagCardId = ref<number | null>(null);
const tagCardName = ref("");

const assignedTags = ref<
  CollectionCard["tags"]
>([]);

function openTagManager() {
  tagCardId.value = null;
  tagCardName.value = "";
  assignedTags.value = [];

  showTagModal.value = true;
}

async function handleTagsChanged() {
  await loadCollection(false);
}

// Bulk Tag Modal Code
const tagSelectionMode = ref(false);
const selectedTagCardIds = ref<number[]>([]);

const showBulkTagModal = ref(false);
const bulkTagAction = ref<"add" | "remove">("add");

const pageCardIds = computed(() =>
  [...new Set(
    paginatedCollection.value.map(card => card.card_id)
  )]
);

const allPageCardsSelected = computed(() =>
  pageCardIds.value.length > 0 &&
  pageCardIds.value.every(id =>
    selectedTagCardIds.value.includes(id)
  )
);

function toggleTagSelectionMode() {
  tagSelectionMode.value = !tagSelectionMode.value;
  selectedTagCardIds.value = [];
}

function toggleSelectPage() {
  selectedTagCardIds.value = allPageCardsSelected.value
    ? []
    : [...pageCardIds.value];
}

function openBulkTags(action: "add" | "remove") {
  if (selectedTagCardIds.value.length === 0) return;

  bulkTagAction.value = action;
  showBulkTagModal.value = true;
}

async function handleBulkTagsChanged() {
  selectedTagCardIds.value = [];
  await loadCollection(false);
}

// Clear selection when changing pages or search/filter settings.
watch(
  [currentPage, searchQuery, cardFilters],
  () => {
    selectedTagCardIds.value = [];
  },
  { deep: true }
);

// Also clear it if the visible card identities change.
watch(
  pageCardIds,
  (next, previous) => {
    if (next.join(",") !== previous.join(",")) {
      selectedTagCardIds.value = [];
    }
  }
);

function openCSVPicker() {
  if (importingCSV.value) return;
  csvFileInput.value?.click();
}

async function handleCSVSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  importMessage.value = "";
  importError.value = "";

  if (!file.name.toLowerCase().endsWith(".csv")) {
    importError.value = "Please select a CSV file.";
    input.value = "";
    return;
  }

  importingCSV.value = true;

  try {
    await submitCollectionImport(file);

    importMessage.value =
      "Your collection import has been submitted " +
      "to the DM for approval. Your current collection " +
      "will remain unchanged until approval.";
  } catch (error) {
    importError.value =
      error instanceof Error
        ? error.message
        : "Failed to submit collection import.";
  } finally {
    importingCSV.value = false;
    input.value = "";
  }
}
void galleryElement;
</script>

<template>
  <main class="container collection-page">
    <h1>My Collection</h1>
    
    <div class="collection-import-section">
      <input
        ref="csvFileInput"
        type="file"
        accept=".csv,text/csv"
        class="collection-csv-input"
        @change="handleCSVSelected"
      />

      <button
        type="button"
        class="collection-import-button"
        :disabled="importingCSV"
        @click="openCSVPicker"
      >
        {{ importingCSV ? "Uploading CSV..." : "Import CSV" }}
      </button>

      <div
        v-if="importMessage"
        class="collection-import-notification success"
        role="status"
      >
        <span>{{ importMessage }}</span>

        <button
          type="button"
          @click="importMessage = ''"
        >
          Dismiss
        </button>
      </div>

      <div
        v-if="importError"
        class="collection-import-notification error"
        role="alert"
      >
        <span>{{ importError }}</span>

        <button
          type="button"
          @click="importError = ''"
        >
          Dismiss
        </button>
      </div>
    </div>

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

          <div class="collection-gallery-actions">
            <span>
              {{ paginatedCollection.length }} cards displayed
            </span>

            <button
              type="button"
              class="collection-tag-button"
              @click="toggleTagSelectionMode"
            >
              {{ tagSelectionMode ? "Done" : "Tag Cards" }}
            </button>

            <button
              type="button"
              class="collection-tag-button"
              @click="openTagManager"
            >
              Manage Tags
            </button>
          </div>
        </div>

        <div
          v-if="tagSelectionMode"
          class="collection-tag-toolbar"
        >
          <label>
            <input
              type="checkbox"
              :checked="allPageCardsSelected"
              :disabled="pageCardIds.length === 0"
              @change="toggleSelectPage"
            />

            Select Page
          </label>

          <span>
            {{ selectedTagCardIds.length }} unique cards selected
          </span>

          <button
            type="button"
            class="collection-tag-button"
            :disabled="selectedTagCardIds.length === 0"
            @click="openBulkTags('add')"
          >
            Add Tags
          </button>

          <button
            type="button"
            class="collection-tag-button"
            :disabled="selectedTagCardIds.length === 0"
            @click="openBulkTags('remove')"
          >
            Remove Tags
          </button>
        </div>      
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
          No cards match your search.
        </p>

        <div v-else ref="galleryElement" class="card-results">
          <div
            v-for="card in paginatedCollection"
            :key="card.id"
            class="card-result collection-result"
          >
            <label
              v-if="tagSelectionMode"
              class="collection-tag-selection"
            >
              <input
                v-model="selectedTagCardIds"
                type="checkbox"
                :value="card.card_id"
                :aria-label="`Select ${card.card_name} for tagging`"
              />

              Select
            </label>

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

              <div class="collection-card-tags">
                <span
                  v-for="tag in card.tags"
                  :key="tag.id"
                  class="collection-tag"
                  :style="{ borderColor: tag.color }"
                >
                  {{ tag.name }}
                </span>
              </div>

              <div class="collection-card-bottom">
                <div class="collection-card-stats">
                  <p class="collection-card-rarity">
                    {{ card.rarity }}
                  </p>

                  <p class="collection-card-quantity">
                    Owned: {{ card.quantity }}
                  </p>
                </div>

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

        <Pagination
          v-if="filteredCollection.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>

    <BulkTagModal
      v-model:open="showBulkTagModal"
      :card-ids="selectedTagCardIds"
      :action="bulkTagAction"
      @changed="handleBulkTagsChanged"
    />

    <CollectionTagModal
      v-model:open="showTagModal"
      :card-id="tagCardId"
      :card-name="tagCardName"
      :assigned-tags="assignedTags"
      @changed="handleTagsChanged"
    />

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