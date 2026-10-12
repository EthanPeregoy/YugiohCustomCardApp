<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  editPlayerCollection,
  type CollectionEditAction,
} from "../services/adminService";
import { searchCardsByName } from "@/features/cards/services/cardService";
import type { CollectionCard } from "@/global/services/collectionService";

interface SearchCard {
  id: number;
  card_name: string;
  image_path: string | null;
}

const RARITIES = [
  "Common",
  "Rare",
  "Super Rare",
  "Ultra Rare",
  "Secret Rare",
];

const props = defineProps<{
  userId: number;
  username: string;
  collection: CollectionCard[];
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const action = ref<CollectionEditAction>("add");
const searchQuery = ref("");
const searchResults = ref<SearchCard[]>([]);
const searching = ref(false);
const selectedCardId = ref<number | null>(null);
const rarity = ref("Common");
const quantity = ref(1);
const saving = ref(false);
const error = ref("");
const success = ref("");

let searchVersion = 0;

const ownedCards = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return props.collection.filter(card =>
    card.card_name.toLowerCase().includes(query)
  );
});

const selectedOwnedEntry = computed(() =>
  props.collection.find(card =>
    card.card_id === selectedCardId.value &&
    card.rarity === rarity.value
  )
);

const selectedSearchCard = computed(() =>
  searchResults.value.find(card =>
    card.id === selectedCardId.value
  )
);

const canSubmit = computed(() => {
  if (!selectedCardId.value) return false;
  if (!Number.isSafeInteger(quantity.value) ||
      quantity.value < 1 ||
      quantity.value > 9999) return false;

  if (action.value === "remove") {
    return !!selectedOwnedEntry.value &&
      quantity.value <= selectedOwnedEntry.value.quantity;
  }

  return !!selectedSearchCard.value;
});

function selectOwnedCard(card: CollectionCard) {
  selectedCardId.value = card.card_id;
  rarity.value = card.rarity;
  quantity.value = 1;
  error.value = "";
  success.value = "";
}

function selectSearchCard(card: SearchCard) {
  selectedCardId.value = card.id;
  quantity.value = 1;
  error.value = "";
  success.value = "";
}

watch(action, () => {
  searchVersion++;
  searchQuery.value = "";
  searchResults.value = [];
  selectedCardId.value = null;
  rarity.value = "Common";
  quantity.value = 1;
  error.value = "";
  success.value = "";
});

watch(searchQuery, async query => {
  selectedCardId.value = null;
  success.value = "";
  error.value = "";

  const version = ++searchVersion;

  if (action.value !== "add" || !query.trim()) {
    searchResults.value = [];
    searching.value = false;
    return;
  }

  searching.value = true;

  try {
    const result = await searchCardsByName(query.trim());

    if (version !== searchVersion) return;

    searchResults.value = Array.isArray(result)
      ? result
      : [];
  } catch (err) {
    if (version !== searchVersion) return;

    error.value = err instanceof Error
      ? err.message
      : "Card search failed.";
    searchResults.value = [];
  } finally {
    if (version === searchVersion) {
      searching.value = false;
    }
  }
});

async function saveChanges() {
  if (!canSubmit.value || saving.value || !selectedCardId.value) {
    return;
  }

  saving.value = true;
  error.value = "";
  success.value = "";

  try {
    await editPlayerCollection(
      props.userId,
      action.value,
      selectedCardId.value,
      rarity.value,
      quantity.value
    );

    success.value =
      action.value === "add"
        ? "Cards added successfully."
        : "Cards removed successfully.";

    emit("saved");

    // Clear selection so the next change is intentional.
    selectedCardId.value = null;
    quantity.value = 1;
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to edit collection.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="admin-modal-overlay" @click.self="!saving && emit('close')">
    <div
      class="admin-modal admin-edit-collection-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-collection-title"
    >
      <h2 id="edit-collection-title">Edit Collection</h2>
      <p>Editing collection for <strong>{{ username }}</strong></p>

      <div class="admin-dp-actions">
        <button
          type="button"
          :class="{ active: action === 'add' }"
          :disabled="saving"
          @click="action = 'add'"
        >
          Add Cards
        </button>

        <button
          type="button"
          :class="{ active: action === 'remove' }"
          :disabled="saving"
          @click="action = 'remove'"
        >
          Remove Cards
        </button>
      </div>

      <label for="edit-collection-search">
        {{ action === "add" ? "Search Card Database" : "Search Owned Cards" }}
      </label>

      <input
        id="edit-collection-search"
        v-model="searchQuery"
        type="search"
        placeholder="Enter card name..."
        :disabled="saving"
        class="admin-collection-modal-search"
      />

      <div class="admin-collection-modal-results">
        <p v-if="action === 'add' && searching">Searching...</p>

        <template v-else-if="action === 'add'">
          <button
            v-for="card in searchResults"
            :key="card.id"
            type="button"
            class="admin-collection-option"
            :class="{ selected: selectedCardId === card.id }"
            :disabled="saving"
            @click="selectSearchCard(card)"
          >
            <img
              v-if="card.image_path"
              :src="card.image_path"
              :alt="card.card_name"
            />
            <span>{{ card.card_name }}</span>
          </button>

          <p v-if="searchQuery && !searchResults.length && !searching">
            No matching cards found.
          </p>
        </template>

        <template v-else>
          <button
            v-for="card in ownedCards"
            :key="card.id"
            type="button"
            class="admin-collection-option"
            :class="{
              selected:
                selectedCardId === card.card_id &&
                rarity === card.rarity
            }"
            :disabled="saving"
            @click="selectOwnedCard(card)"
          >
            <img
              v-if="card.image_path"
              :src="card.image_path"
              :alt="card.card_name"
            />

            <span>
              {{ card.card_name }}
              <small>
                {{ card.rarity }} · Owned: {{ card.quantity }}
              </small>
            </span>
          </button>

          <p v-if="!ownedCards.length">
            No matching owned cards.
          </p>
        </template>
      </div>

      <form @submit.prevent="saveChanges">
        <label for="edit-collection-rarity">Rarity</label>

        <select
          id="edit-collection-rarity"
          v-model="rarity"
          :disabled="action === 'remove' || saving"
        >
          <option v-for="item in RARITIES" :key="item" :value="item">
            {{ item }}
          </option>
        </select>

        <label for="edit-collection-quantity">Quantity</label>

        <input
          id="edit-collection-quantity"
          v-model.number="quantity"
          type="number"
          min="1"
          :max="action === 'remove'
            ? selectedOwnedEntry?.quantity ?? 1
            : 9999"
          step="1"
          :disabled="saving"
        />

        <p v-if="selectedOwnedEntry && action === 'remove'">
          Available: {{ selectedOwnedEntry.quantity }}
        </p>

        <p v-if="error" class="admin-modal-error">{{ error }}</p>
        <p v-if="success" class="admin-collection-success">{{ success }}</p>

        <div class="admin-modal-actions">
          <button
            type="button"
            class="admin-modal-cancel"
            :disabled="saving"
            @click="emit('close')"
          >
            Close
          </button>

          <button
            type="submit"
            class="admin-modal-save"
            :disabled="!canSubmit || saving"
          >
            {{
              saving
                ? "Saving..."
                : action === "add"
                  ? "Add Cards"
                  : "Remove Cards"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>