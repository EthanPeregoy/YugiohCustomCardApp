
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDecks } from "../composables/useDecks";
import "../styles/decks.css";

const router = useRouter();

const {
  decks,
  loading,
  error,
  processing,
  addDeck,
  updateDeckName,
  removeDeck
} = useDecks();

const showCreateModal = ref(false);
const newDeckName = ref("");

const renamingDeckId = ref<number | null>(null);
const renameValue = ref("");

const deletingDeckId = ref<number | null>(null);

async function handleCreateDeck() {
  if (!newDeckName.value.trim()) return;

  const deck = await addDeck(newDeckName.value);

  if (deck) {
    showCreateModal.value = false;
    newDeckName.value = "";
    router.push(`/decks/${deck.id}`);
  }
}

function startRename(deckId: number, name: string) {
  renamingDeckId.value = deckId;
  renameValue.value = name;
}

async function handleRename() {
  if (renamingDeckId.value === null) return;
  if (!renameValue.value.trim()) return;

  const success = await updateDeckName(
    renamingDeckId.value,
    renameValue.value
  );

  if (success) {
    renamingDeckId.value = null;
    renameValue.value = "";
  }
}

async function handleDelete() {
  if (deletingDeckId.value === null) return;

  const success = await removeDeck(deletingDeckId.value);

  if (success) {
    deletingDeckId.value = null;
  }
}

function openDeck(deckId: number) {
  router.push(`/decks/${deckId}`);
}
</script>

<template>
  <main class="decks-page">
    <div class="decks-header">
      <div>
        <h1>My Decks</h1>
        <p>Create and manage your Yu-Gi-Oh! decks.</p>
      </div>

      <button
        class="deck-primary-button"
        @click="showCreateModal = true"
      >
        + Create Deck
      </button>
    </div>

    <p v-if="error" class="deck-error">
      {{ error }}
    </p>

    <div v-if="loading" class="deck-message">
      Loading your decks...
    </div>

    <div
      v-else-if="decks.length === 0"
      class="deck-message"
    >
      <h2>No Decks Yet</h2>
      <p>Create your first deck to get started!</p>
    </div>

    <div v-else class="decks-grid">
      <div
        v-for="deck in decks"
        :key="deck.id"
        class="deck-card"
      >
        <div class="deck-card-preview">
          <span>✦</span>
        </div>

        <h2>{{ deck.name }}</h2>

        <p class="deck-card-count">
          {{ deck.total_cards }} Cards
        </p>

        <div class="deck-card-actions">
          <button
            class="deck-primary-button"
            @click="openDeck(deck.id)"
          >
            Edit Deck
          </button>

          <button
            class="deck-secondary-button"
            @click="startRename(deck.id, deck.name)"
          >
            Rename
          </button>

          <button
            class="deck-delete-button"
            @click="deletingDeckId = deck.id"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create Deck Modal -->
    <div
      v-if="showCreateModal"
      class="deck-modal-overlay"
      @click.self="showCreateModal = false"
    >
      <form
        class="deck-modal"
        @submit.prevent="handleCreateDeck"
      >
        <h2>Create New Deck</h2>

        <input
          v-model="newDeckName"
          type="text"
          placeholder="Enter deck name..."
          maxlength="100"
          autofocus
        />

        <div class="deck-modal-actions">
          <button
            type="button"
            class="deck-secondary-button"
            @click="showCreateModal = false"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="deck-primary-button"
            :disabled="processing || !newDeckName.trim()"
          >
            Create
          </button>
        </div>
      </form>
    </div>

    <!-- Rename Deck Modal -->
    <div
      v-if="renamingDeckId !== null"
      class="deck-modal-overlay"
      @click.self="renamingDeckId = null"
    >
      <form
        class="deck-modal"
        @submit.prevent="handleRename"
      >
        <h2>Rename Deck</h2>

        <input
          v-model="renameValue"
          type="text"
          maxlength="100"
        />

        <div class="deck-modal-actions">
          <button
            type="button"
            class="deck-secondary-button"
            @click="renamingDeckId = null"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="deck-primary-button"
            :disabled="processing || !renameValue.trim()"
          >
            Save
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingDeckId !== null"
      class="deck-modal-overlay"
      @click.self="deletingDeckId = null"
    >
      <div class="deck-modal">
        <h2>Delete Deck?</h2>

        <p>
          This will permanently delete the deck.
          Cards in your collection will not be affected.
        </p>

        <div class="deck-modal-actions">
          <button
            class="deck-secondary-button"
            @click="deletingDeckId = null"
          >
            Cancel
          </button>

          <button
            class="deck-delete-button"
            :disabled="processing"
            @click="handleDelete"
          >
            Delete Deck
          </button>
        </div>
      </div>
    </div>
  </main>
</template>