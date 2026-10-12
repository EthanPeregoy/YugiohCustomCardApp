<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import {
  createDefaultCardFilters,
  type CardFilters,
  type CardFilterMode,
  type CardTag
} from "../types/cardFilters";

const props = withDefaults(
  defineProps<{
    open: boolean;
    modelValue: CardFilters;
    mode?: CardFilterMode;
    availableRarities?: string[];
    availableTags?: CardTag[];
  }>(),
  {
    mode: "search",
    availableRarities: () => [],
    availableTags: () => []
  }
);

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:modelValue": [value: CardFilters];
}>();

const dialogElement = ref<HTMLDialogElement | null>(null);
const draftFilters = ref<CardFilters>(
  createDefaultCardFilters()
);

const validationError = ref("");

const showMonsterFilters = computed(() =>
  draftFilters.value.category === "all" ||
  draftFilters.value.category === "monster"
);

const showSpellTrapFilters = computed(() =>
  draftFilters.value.category === "spell" ||
  draftFilters.value.category === "trap"
);

const showRarityFilters = computed(() =>
  props.mode === "shop" ||
  props.mode === "collection"
);

const showTagFilters = computed(() =>
  props.mode === "collection" ||
  props.mode === "deck"
);

const monsterTypes = [
  "Normal",
  "Effect",
  "Ritual",
  "Fusion",
  "Synchro",
  "XYZ",
  "Link",
  "Pendulum",
  "Tuner",
  "Flip",
  "Spirit",
  "Union",
  "Gemini",
  "Token"
];

const monsterSubtypes = [
  "Aqua",
  "Beast",
  "Beast-Warrior",
  "Creator God",
  "Cyberse",
  "Dinosaur",
  "Divine-Beast",
  "Dragon",
  "Fairy",
  "Fiend",
  "Fish",
  "Illusion",
  "Insect",
  "Machine",
  "Plant",
  "Psychic",
  "Pyro",
  "Reptile",
  "Rock",
  "Sea Serpent",
  "Spellcaster",
  "Thunder",
  "Warrior",
  "Winged Beast",
  "Wyrm",
  "Zombie"
];

const attributes = [
  "DARK",
  "LIGHT",
  "EARTH",
  "WATER",
  "FIRE",
  "WIND",
  "DIVINE"
];

const spellTrapSubtypes = computed(() =>
  draftFilters.value.category === "spell"
    ? [
        "Normal",
        "Continuous",
        "Equip",
        "Field",
        "Quick-Play",
        "Ritual"
      ]
    : [
        "Normal",
        "Continuous",
        "Counter"
      ]
);

// Copy the saved filters so Cancel can discard edits.
function copyFilters(filters: CardFilters): CardFilters {
  return {
    ...filters,
    monsterTypes: [...filters.monsterTypes],
    rarities: [...filters.rarities],
    tagIds: [...filters.tagIds]
  };
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      draftFilters.value = copyFilters(props.modelValue);
      validationError.value = "";

      await nextTick();

      if (!dialogElement.value?.open) {
        dialogElement.value?.showModal();
      }
    } else {
      dialogElement.value?.close();
    }
  }
);

function closeModal() {
  emit("update:open", false);
}

function resetFilters() {
  draftFilters.value = createDefaultCardFilters();
  validationError.value = "";
}

// Remove hidden filters when changing categories.
function handleCategoryChange() {
  draftFilters.value.spellTrapSubtype = "";

  if (!showMonsterFilters.value) {
    draftFilters.value.monsterTypes = [];
    draftFilters.value.monsterSubtype = "";
    draftFilters.value.attribute = "";
    draftFilters.value.ratingMin = "";
    draftFilters.value.ratingMax = "";
  }
}

function applyFilters() {
  const min = draftFilters.value.ratingMin;
  const max = draftFilters.value.ratingMax;

  if (
    min !== "" &&
    max !== "" &&
    Number(min) > Number(max)
  ) {
    validationError.value =
      "Minimum rating cannot exceed maximum rating.";

    return;
  }

  emit(
    "update:modelValue",
    copyFilters(draftFilters.value)
  );

  closeModal();
}
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogElement"
      class="card-filter-modal"
      aria-labelledby="card-filter-title"
      @cancel.prevent="closeModal"
      @close="closeModal"
    >
      <form @submit.prevent="applyFilters">
        <header class="filter-header">
          <h2 id="card-filter-title">
            Filter &amp; Sort Cards
          </h2>

          <button
            type="button"
            aria-label="Close filters"
            @click="closeModal"
          >
            ✕
          </button>
        </header>

        <div class="filter-grid">
          <label>
            Card Category

            <select
              v-model="draftFilters.category"
              @change="handleCategoryChange"
            >
              <option value="all">All Cards</option>
              <option value="monster">Monsters</option>
              <option value="spell">Spells</option>
              <option value="trap">Traps</option>
            </select>
          </label>

          <label>
            Card Origin

            <select v-model="draftFilters.origin">
              <option value="all">All Cards</option>
              <option value="official">
                Official Only
              </option>
              <option value="custom">
                Custom Only
              </option>
            </select>
          </label>

          <label class="filter-full-width">
            Effect Text Contains

            <input
              v-model="draftFilters.effectText"
              type="text"
              placeholder="Special Summon, destroy, draw..."
            />
          </label>
        </div>

        <fieldset v-if="showMonsterFilters">
          <legend>Monster Classification</legend>

          <p class="filter-hint">
            Cards must match all selected classifications.
          </p>

          <div class="filter-checkboxes">
            <label
              v-for="type in monsterTypes"
              :key="type"
            >
              <input
                v-model="draftFilters.monsterTypes"
                type="checkbox"
                :value="type"
              />

              {{ type }}
            </label>
          </div>
        </fieldset>

        <div
          v-if="showMonsterFilters"
          class="filter-grid"
        >
          <label>
            Monster Type

            <select v-model="draftFilters.monsterSubtype">
              <option value="">Any Type</option>

              <option
                v-for="subtype in monsterSubtypes"
                :key="subtype"
                :value="subtype"
              >
                {{ subtype }}
              </option>
            </select>
          </label>

          <label>
            Attribute

            <select v-model="draftFilters.attribute">
              <option value="">Any Attribute</option>

              <option
                v-for="attribute in attributes"
                :key="attribute"
                :value="attribute"
              >
                {{ attribute }}
              </option>
            </select>
          </label>

          <label class="filter-full-width">
            Rating Type

            <select v-model="draftFilters.ratingType">
              <option value="level">Level</option>
              <option value="rank">Rank</option>
              <option value="link">Link Rating</option>
            </select>
          </label>

          <label>
            Minimum

            <input
              v-model="draftFilters.ratingMin"
              type="number"
              min="0"
              step="1"
              placeholder="Any"
            />
          </label>

          <label>
            Maximum

            <input
              v-model="draftFilters.ratingMax"
              type="number"
              min="0"
              step="1"
              placeholder="Any"
            />
          </label>
        </div>

        <div
          v-if="showSpellTrapFilters"
          class="filter-grid"
        >
          <label class="filter-full-width">
            {{ draftFilters.category === "spell"
              ? "Spell Subtype"
              : "Trap Subtype" }}

            <select
              v-model="draftFilters.spellTrapSubtype"
            >
              <option value="">Any Subtype</option>

              <option
                v-for="subtype in spellTrapSubtypes"
                :key="subtype"
                :value="subtype"
              >
                {{ subtype }}
              </option>
            </select>
          </label>
        </div>

        <fieldset v-if="showRarityFilters">
          <legend>Rarity</legend>

          <div class="filter-checkboxes">
            <label
              v-for="rarity in availableRarities"
              :key="rarity"
            >
              <input
                v-model="draftFilters.rarities"
                type="checkbox"
                :value="rarity"
              />

              {{ rarity }}
            </label>
          </div>

          <p v-if="availableRarities.length === 0">
            No available rarities.
          </p>
        </fieldset>

        <fieldset v-if="showTagFilters">
          <legend>Custom Tags</legend>

          <p class="filter-hint">
            Cards must have all selected tags.
          </p>

          <div class="filter-checkboxes">
            <label
              v-for="tag in availableTags"
              :key="tag.id"
            >
              <input
                v-model="draftFilters.tagIds"
                type="checkbox"
                :value="tag.id"
              />

              {{ tag.name }}
            </label>
          </div>

          <p v-if="availableTags.length === 0">
            Create and assign tags in your Collection.
          </p>
        </fieldset>

        <div class="filter-grid">
          <label>
            Sort By

            <select v-model="draftFilters.sortBy">
              <option value="name">Card Name</option>
              <option
                v-if="props.mode === 'collection'"
                value="quantity">
                Quantity Owned
              </option>
              <option value="attack">ATK</option>
              <option value="defense">DEF</option>
              <option value="level">Level / Rank</option>
              <option value="link_value">
                Link Rating
              </option>

              <option
                v-if="showRarityFilters"
                value="rarity"
              >
                Rarity
              </option>

              <option
                v-if="showTagFilters"
                value="tags"
              >
                Custom Tag Name
              </option>
            </select>
          </label>

          <label>
            Direction

            <select
              v-model="draftFilters.sortDirection"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <p
          v-if="validationError"
          class="filter-error"
          role="alert"
        >
          {{ validationError }}
        </p>

        <footer class="filter-footer">
          <button
            type="button"
            @click="resetFilters"
          >
            Reset
          </button>

          <button
            type="button"
            @click="closeModal"
          >
            Cancel
          </button>

          <button type="submit">
            Apply Filters
          </button>
        </footer>
      </form>
    </dialog>
  </Teleport>
</template>

<style scoped>
.card-filter-modal {
  width: min(720px, calc(100vw - 32px));
  max-height: 85vh;
  box-sizing: border-box;
  padding: 24px;
  overflow-y: auto;

  color: #f0dfff;
  background: #190f29;

  border: 1px solid #a675d2;
  border-radius: 16px;
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.6);
}

.card-filter-modal::backdrop {
  background: rgba(5, 2, 12, 0.75);
  backdrop-filter: blur(4px);
}

.filter-header,
.filter-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-header {
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-header h2 {
  margin: 0;
}

.filter-footer {
  justify-content: flex-end;
  margin-top: 24px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 18px 0;
}

.filter-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-full-width {
  grid-column: 1 / -1;
}

.card-filter-modal input:not([type="checkbox"]),
.card-filter-modal select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;

  font: inherit;
  color: #f4eaff;
  background: #2b1b3c;

  border: 1px solid #73508e;
  border-radius: 8px;
}

.card-filter-modal fieldset {
  margin: 18px 0;
  padding: 16px;

  border: 1px solid #62427b;
  border-radius: 10px;
}

.filter-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.filter-checkboxes label {
  display: flex;
  align-items: center;
  gap: 7px;
}

.filter-checkboxes input {
  accent-color: #b77be9;
}

.filter-hint {
  margin: 0 0 14px;
  color: #cbb5df;
  font-size: 0.9rem;
}

.card-filter-modal button {
  padding: 10px 16px;

  font: inherit;
  color: #ffffff;
  background: #59317a;

  border: 1px solid #a570cd;
  border-radius: 8px;

  cursor: pointer;
}

.card-filter-modal button:hover {
  background: #704195;
}

.filter-error {
  color: #ffaaaa;
}

@media (max-width: 550px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .card-filter-modal {
    padding: 18px;
  }
}
</style>