<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  getAdminPlayerDecks,
  getAdminPlayerDeck
} from "../services/adminService";
import type {
  Deck,
  DeckDetails,
  DeckCard
} from "@/features/decks/services/deckService";
import CardDetailsModal from "@/global/components/CardDetailsModal.vue";
import "../styles/admin-decks.css";

const props = defineProps<{ userId: number }>();

const decks = ref<Deck[]>([]);
const selectedDeck = ref<DeckDetails | null>(null);
const loading = ref(true);
const deckLoading = ref(false);
const error = ref("");
const selectedCardId = ref<number | null>(null);

let requestVersion = 0;
let deckRequestVersion = 0;

const sections = [
  { key: "main", title: "Main Deck" },
  { key: "extra", title: "Extra Deck" },
  { key: "side", title: "Side Deck" }
] as const;

function cardsInSection(section: DeckCard["deck_section"]) {
  return selectedDeck.value?.cards.filter(
    card => card.deck_section === section
  ) ?? [];
}

function sectionCount(section: DeckCard["deck_section"]) {
  return cardsInSection(section).reduce(
    (total, card) => total + card.quantity,
    0
  );
}

const totalCards = computed(() =>
  selectedDeck.value?.cards.reduce(
    (total, card) => total + card.quantity,
    0
  ) ?? 0
);

async function loadDecks() {
  const version = ++requestVersion;
  deckRequestVersion++;
  loading.value = true;
  error.value = "";
  decks.value = [];
  selectedDeck.value = null;

  try {
    const result = await getAdminPlayerDecks(props.userId);
    if (version !== requestVersion) return;
    decks.value = result;
  } catch (err) {
    if (version !== requestVersion) return;
    error.value = err instanceof Error
      ? err.message
      : "Failed to load decks.";
  } finally {
    if (version === requestVersion) loading.value = false;
  }
}

async function selectDeck(deckId: number) {
  const version = ++deckRequestVersion;
  deckLoading.value = true;
  error.value = "";
  selectedDeck.value = null;

  try {
    const result = await getAdminPlayerDeck(props.userId, deckId);
    if (version !== deckRequestVersion) return;
    selectedDeck.value = result;
  } catch (err) {
    if (version !== deckRequestVersion) return;
    error.value = err instanceof Error
      ? err.message
      : "Failed to load deck.";
  } finally {
    if (version === deckRequestVersion) deckLoading.value = false;
  }
}

function backToDecks() {
  deckRequestVersion++;
  selectedDeck.value = null;
  deckLoading.value = false;
  error.value = "";
}

watch(() => props.userId, loadDecks, { immediate: true });
</script>

<template>
  <div class="admin-decks">
    <p v-if="loading">Loading decks...</p>

    <div v-else-if="error" class="admin-decks-message">
      <p>{{ error }}</p>
      <button @click="selectedDeck ? backToDecks() : loadDecks()">
        Back / Retry
      </button>
    </div>

    <template v-else-if="selectedDeck">
      <div class="admin-decks-detail-header">
        <button type="button" @click="backToDecks">
          ← Back to Decks
        </button>
        <h3>{{ selectedDeck.name }}</h3>
        <span>{{ totalCards }} cards</span>
      </div>

      <section
        v-for="section in sections"
        :key="section.key"
        class="admin-decks-section"
      >
        <h3>
          {{ section.title }}
          ({{ sectionCount(section.key) }})
        </h3>

        <div class="admin-decks-card-grid">
          <button
            v-for="card in cardsInSection(section.key)"
            :key="card.card_id"
            type="button"
            class="admin-decks-card"
            @click="selectedCardId = card.card_id"
          >
            <img
              :src="card.image_path || undefined"
              :alt="card.card_name"
            />
            <span class="admin-decks-card-quantity">
              ×{{ card.quantity }}
            </span>
            <span class="admin-decks-card-name">
              {{ card.card_name }}
            </span>
          </button>
        </div>

        <p v-if="!cardsInSection(section.key).length">
          No cards in this section.
        </p>
      </section>
    </template>

    <p v-else-if="deckLoading">Loading deck...</p>

    <p v-else-if="!decks.length">
      This player has no decks.
    </p>

    <div v-else class="admin-decks-list">
      <button
        v-for="deck in decks"
        :key="deck.id"
        type="button"
        class="admin-decks-list-item"
        @click="selectDeck(deck.id)"
      >
        <strong>{{ deck.name }}</strong>
        <span>{{ deck.total_cards }} cards</span>
        <span>View Deck →</span>
      </button>
    </div>

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="selectedCardId = null"
    />
  </div>
</template>