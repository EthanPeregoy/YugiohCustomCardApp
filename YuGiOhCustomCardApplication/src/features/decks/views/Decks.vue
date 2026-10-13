
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useDecks } from "../composables/useDecks";
import { Deck, exportDeckYdk } from "../services/deckService";
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

const searchQuery = ref("");

const filteredDecks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) return decks.value;

  return decks.value.filter(deck =>
    deck.name.toLowerCase().includes(query)
  );
});

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

function isDeckValid(mainCount: number): boolean {
  return mainCount >= 40 && mainCount <= 60;
}


const exportingDeckId = ref<number | null>(null);
const exportMessage = ref("");
const exportError = ref("");

async function handleExport(deck: Deck) {
  if (exportingDeckId.value !== null) return;

  exportingDeckId.value = deck.id;
  exportMessage.value = "";
  exportError.value = "";

  try {
    const result = await exportDeckYdk(deck.id, deck.name);

    exportMessage.value =
      `Exported "${deck.name}" successfully! ` +
      `${result.exportedCount} cards exported.` +
      (result.skippedCount > 0
        ? ` ${result.skippedCount} custom cards skipped.`
        : "");
  } catch (err) {
    exportError.value =
      err instanceof Error
        ? err.message
        : "Failed to export deck";
  } finally {
    exportingDeckId.value = null;
  }
}
</script>

<template>
  <main class="decks-page">
    <div class="decks-header">
      <div>
        <h1>My Decks</h1>
      </div>

      <button
        class="deck-primary-button"
        @click="showCreateModal = true"
      >
        + Create Deck
      </button>

      <p v-if="exportMessage" class="deck-export-success">
        {{ exportMessage }}
      </p>

      <p v-if="exportError" class="deck-export-error">
        {{ exportError }}
      </p>
    </div>

    <div class="decks-search-container">
      <input
        v-model="searchQuery"
        type="text"
        class="decks-search-input"
        placeholder="Search your decks..."
        aria-label="Search decks"
      />
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

    <div
      v-else-if="filteredDecks.length === 0"
      class="deck-message"
    >
      No decks match your search.
    </div>

    <div v-else class="decks-grid">
      <div
        v-for="deck in filteredDecks"
        :key="deck.id"
        class="deck-card"
      >
        <div class="deck-card-preview">
          <img
            v-if="deck.cover_card_id && deck.cover_image_path"
            :src="deck.cover_image_path"
            :alt="`${deck.name} cover`"
            class="deck-card-cover-image"
            :style="{
              objectPosition: `${deck.cover_position_x}% ${deck.cover_position_y}%`,
              transform: `scale(${deck.cover_zoom}) rotate(${deck.cover_rotation}deg)`
            }"
          />

          <span v-else>✦</span>
        </div>

        <h2>{{ deck.name }}</h2>

        <div class="deck-card-status">
          <span
            v-if="!isDeckValid(deck.main_count)"
            class="deck-invalid-badge"
          >
            ⚠ Invalid
          </span>

          <span v-else class="deck-valid-badge">
            ✓ Valid
          </span>
        </div>

        <div class="deck-card-counts">
          <div class="deck-count-item">
            <strong>{{ deck.main_count }}</strong>
            <span>Main</span>
          </div>

          <div class="deck-count-item">
            <strong>{{ deck.extra_count }}</strong>
            <span>Extra</span>
          </div>

          <div class="deck-count-item">
            <strong>{{ deck.side_count }}</strong>
            <span>Side</span>
          </div>
        </div>

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

        <button
          type="button"
          class="deck-export-button"
          :disabled="exportingDeckId !== null"
          @click="handleExport(deck)"
        >
          {{
            exportingDeckId === deck.id
              ? "Exporting..."
              : "↓ Export YDK"
          }}
        </button>
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