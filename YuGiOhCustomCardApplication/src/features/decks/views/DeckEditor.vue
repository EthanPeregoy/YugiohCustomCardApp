
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getDeck, type DeckDetails } from "../services/deckService";
import { useDeckCollection } from "../composables/useDeckCollection";
import { useDeckEditor, type DeckSection } from "../composables/useDeckEditor";
import CardDetailsModal from "@/global/components/CardDetailsModal.vue";
import CardFilterModal from "@/global/components/CardFilterModal.vue";
import DeckCoverModal from "../components/DeckCoverModal.vue";
import type { DeckCoverSettings } from "../services/deckService";
import "../styles/deck-cover.css";
import "../styles/deck-editor.css";

const route = useRoute();
const router = useRouter();

const deck = ref<DeckDetails | null>(null);
const loading = ref(true);
const error = ref("");

const showCoverModal = ref(false);
const coverMessage = ref("");

const {
  collection,
  collectionLoading,
  collectionError,
  collectionSearch,
  cardFilters,
  availableTags,
  filteredCollection
} = useDeckCollection();

const showFilters = ref(false);

const selectedCardId = ref<number | null>(null);

function openCard(cardId: number) {
  selectedCardId.value = cardId;
}

function closeCard() {
  selectedCardId.value = null;
}

const {
  editableCards,
  expandedDeckCards,
  totalCards,
  saving,
  saveError,
  actionMessage,
  hasChanges,
  sectionCount,
  loadCards,
  addCard,
  addCardToSection,
  removeCard,
  moveCard,
  saveCards
} = useDeckEditor();

async function handleSave() {
  const deckId = Number(route.params.id);
  await saveCards(deckId);
}

type DraggedCard =
  | { source: "collection"; cardId: number }
  | {
      source: "deck";
      cardId: number;
      section: DeckSection;
    };

const draggedCard = ref<DraggedCard | null>(null);
const dragOverSection = ref<DeckSection | null>(null);
const draggingOverCollection = ref(false);

function startCollectionDrag(
  event: DragEvent,
  cardId: number
) {
  draggedCard.value = {
    source: "collection",
    cardId
  };

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", String(cardId));
  }
}

function startDeckDrag(
  event: DragEvent,
  cardId: number,
  section: DeckSection
) {
  draggedCard.value = {
    source: "deck",
    cardId,
    section
  };

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(cardId));
  }
}

function handleDragOver(
  event: DragEvent,
  section: DeckSection
) {
  // Allow the browser to drop cards here
  event.preventDefault();
  event.stopPropagation();
  dragOverSection.value = section;

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect =
      draggedCard.value?.source === "collection"
        ? "copy"
        : "move";
  }
}

function handleDrop(
  event: DragEvent,
  section: DeckSection
) {
  event.preventDefault();
  event.stopPropagation();

  const dragged = draggedCard.value;
  if (!dragged) return;

  if (dragged.source === "collection") {
    const card = collection.value.find(
      card => card.card_id === dragged.cardId
    );

    if (card) {
      addCardToSection(card, section);
    }
  } else {
    moveCard(dragged.cardId, dragged.section, section);
  }

  endDrag();
}

function handleCollectionDrop(event: DragEvent) {
  event.preventDefault();

  const dragged = draggedCard.value;

  if (dragged?.source === "deck") {
    removeCard(dragged.cardId, dragged.section);
  }

  endDrag();
}

function endDrag() {
  draggedCard.value = null;
  dragOverSection.value = null;
  draggingOverCollection.value = false;
}

async function loadDeck() {
  const deckId = Number(route.params.id);

  if (!Number.isSafeInteger(deckId) || deckId <= 0) {
    error.value = "Invalid deck ID.";
    loading.value = false;
    return;
  }

  try {
    deck.value = await getDeck(deckId);
    loadCards(deck.value.cards);
  } catch (err) {
    console.error("Failed to load deck:", err);
    error.value = "Failed to load deck.";
  } finally {
    loading.value = false;
  }
}

function handleCoverSaved(settings: DeckCoverSettings) {
  if (deck.value) {
    Object.assign(deck.value, settings);
  }

  showCoverModal.value = false;
  coverMessage.value = "Deck cover saved successfully!";
}

onMounted(loadDeck);
</script>

<template>
  <main class="deck-editor-page">
    <div v-if="loading" class="deck-message">
      Loading deck...
    </div>

    <div v-else-if="error" class="deck-message">
      <h2>{{ error }}</h2>

      <button
        class="deck-primary-button"
        @click="router.push('/decks')"
      >
        Return to Decks
      </button>
    </div>

    <template v-else-if="deck">
      <div class="deck-editor-header">
        <h1>{{ deck.name }}</h1>
        <p>Deck Editor</p>
      </div>

      <div class="deck-editor-toolbar">
        <p>
          {{ totalCards }} Cards
        </p>

        <div class="deck-editor-toolbar-actions">
          <button
            type="button"
            class="deck-primary-button"
            :disabled="hasChanges || saving"
            :title="hasChanges
              ? 'Save your deck changes before editing the cover'
              : 'Choose a deck cover'"
            @click="showCoverModal = true"
          >
            Edit Cover
          </button>

          <button
            type="button"
            class="deck-primary-button"
            :disabled="!hasChanges || saving"
            @click="handleSave"
          >
            {{ saving ? "Saving..." : "Save Deck" }}
          </button>
        </div>
      </div>

      <p v-if="coverMessage" class="deck-editor-feedback">
        {{ coverMessage }}
      </p>

      <p v-if="actionMessage" class="deck-editor-feedback">
        {{ actionMessage }}
      </p>

      <p v-if="saveError" class="deck-editor-feedback error">
        {{ saveError }}
      </p>

      <div class="deck-editor-workspace">
        <div class="deck-editor-sections">
          <section
            v-for="section in [
              { key: 'main', name: 'Main Deck', limit: 60 },
              { key: 'extra', name: 'Extra Deck', limit: 15 },
              { key: 'side', name: 'Side Deck', limit: 15 }
            ]"
            :key="section.key"
            class="deck-section"
            :class="`deck-${section.key}`"
          >
            <div class="deck-section-header">
              <h2>{{ section.name }}</h2>

              <span class="deck-section-count">
                {{ sectionCount(section.key as "main" | "extra" | "side") }}
                / {{ section.limit }}
              </span>
            </div>

            <div
              class="deck-section-content"
              :class="{
                'deck-drop-active': dragOverSection === section.key
              }"
              @dragenter.prevent.stop
              @dragover.prevent.stop="handleDragOver(
                $event,
                section.key as DeckSection
              )"
              @drop.prevent.stop="handleDrop(
                $event,
                section.key as DeckSection
              )"
            >
              <div
                v-for="card in expandedDeckCards.filter(
                    c => c.deck_section === section.key
                )"
                :key="`${section.key}-${card.card_id}-${card.copyIndex}`"
                class="deck-editor-card"
                :title="card.card_name"
                role="button"
                tabindex="0"
                @click="openCard(card.card_id)"
                draggable="true"
                @dragstart="startDeckDrag(
                  $event,
                  card.card_id,
                  card.deck_section
                )"
                @dragend="endDrag"
                @contextmenu.prevent="removeCard(card.card_id, card.deck_section)"
                @keydown.enter="openCard(card.card_id)"
                @keydown.space.prevent="openCard(card.card_id)"
                >
                <img
                  v-if="card.image_path"
                  :src="card.image_path"
                  :alt="card.card_name"
                />

                <span
                  v-else
                  class="deck-section-empty"
                >
                  {{ card.card_name }}
                </span>
              </div>

              <p
                v-if="!editableCards.some(
                 c => c.deck_section === section.key
                )"
                class="deck-section-empty"
              >
                No cards in this section
              </p>
            </div>
          </section>
        </div>
        <aside
          class="deck-collection-panel"
          :class="{
            'deck-drop-active': draggingOverCollection
          }"
          @dragover.prevent="
            draggingOverCollection =
              draggedCard?.source === 'deck'
          "
          @dragleave="draggingOverCollection = false"
          @drop="handleCollectionDrop"
        >
        <h2>Your Collection</h2>

        <div class="deck-collection-search-row">
          <input
            v-model="collectionSearch"
            class="deck-collection-search"
            type="text"
            placeholder="Search your collection..."
          />

          <button
            type="button"
            class="deck-collection-filter-button"
            @click="showFilters = true"
          >
            Filters
          </button>
        </div>

        <p class="deck-collection-count">
            {{ filteredCollection.length }} /
            {{ collection.length }} unique cards
        </p>

        <div class="deck-collection-list">
            <p
            v-if="collectionLoading"
            class="deck-collection-placeholder"
            >
            Loading collection...
            </p>

            <p
            v-else-if="collectionError"
            class="deck-collection-placeholder"
            >
            {{ collectionError }}
            </p>

            <p
            v-else-if="collection.length === 0"
            class="deck-collection-placeholder"
            >
            Your collection is empty.
            </p>

            <p
            v-else-if="filteredCollection.length === 0"
            class="deck-collection-placeholder"
            >
            No matching cards found.
            </p>

            <button
              v-for="card in filteredCollection"
              :key="card.card_id"
              type="button"
              class="deck-collection-card"
              draggable="true"
              @click="openCard(card.card_id)"
              @contextmenu.prevent="addCard(card)"
              @dragstart="startCollectionDrag($event, card.card_id)"
              @dragend="endDrag"
            >
            <img
                v-if="card.image_path"
                :src="card.image_path"
                :alt="card.card_name"
                class="deck-collection-card-image"
            />

            <div
                v-else
                class="deck-collection-card-no-image"
            >
                No Image
            </div>

            <div class="deck-collection-card-info">
                <span class="deck-collection-card-name">
                {{ card.card_name }}
                </span>

                <span class="deck-collection-card-type">
                {{ card.card_type }}
                </span>

                <span class="deck-collection-card-owned">
                Owned: {{ card.quantity }}
                </span>
            </div>
            </button>
        </div>
        </aside>
      </div>
    </template>

    <CardFilterModal
      v-model:open="showFilters"
      v-model="cardFilters"
      mode="deck"
      :available-tags="availableTags"
    />

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
    
    <DeckCoverModal
      v-if="showCoverModal && deck"
      :deck-id="deck.id"
      :cards="editableCards"
      :initial-settings="deck"
      @close="showCoverModal = false"
      @saved="handleCoverSaved"
    />
  </main>
</template>