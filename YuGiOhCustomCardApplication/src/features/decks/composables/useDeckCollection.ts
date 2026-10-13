import { ref, computed, onMounted } from "vue";

import {
  getCollection,
  type CollectionCard
} from "@/global/services/collectionService";

import {
  createDefaultCardFilters,
  type CardTag
} from "@/global/types/cardFilters";

import {
  filterAndSortCards
} from "@/global/utils/cardFiltering";

export interface DeckCollectionCard extends CollectionCard {}

export function useDeckCollection() {
  const collection = ref<DeckCollectionCard[]>([]);
  const collectionLoading = ref(true);
  const collectionError = ref("");
  const collectionSearch = ref("");

  const cardFilters = ref(createDefaultCardFilters());

  const availableTags = computed<CardTag[]>(() => {
    const tagsById = new Map<number, CardTag>();

    for (const card of collection.value) {
      for (const tag of card.tags ?? []) {
        tagsById.set(tag.id, tag);
      }
    }

    return [...tagsById.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  const filteredCollection = computed(() => {
    const query = collectionSearch.value.trim().toLowerCase();

    const matchingNames = collection.value.filter(card =>
      card.card_name.toLowerCase().includes(query)
    );

    return filterAndSortCards(
      matchingNames,
      cardFilters.value,
      "deck"
    );
  });

  async function loadCollection() {
    collectionLoading.value = true;
    collectionError.value = "";

    try {
      const entries = await getCollection();

      const grouped = new Map<number, DeckCollectionCard>();

      for (const entry of entries) {
        const existing = grouped.get(entry.card_id);

        if (existing) {
          existing.quantity += Number(entry.quantity);

          // Preserve tags even when a card has multiple rarities.
          const tagIds = new Set(
            existing.tags.map(tag => tag.id)
          );

          for (const tag of entry.tags ?? []) {
            if (!tagIds.has(tag.id)) {
              existing.tags.push(tag);
              tagIds.add(tag.id);
            }
          }
        } else {
          grouped.set(entry.card_id, {
            ...entry,
            quantity: Number(entry.quantity),
            tags: [...(entry.tags ?? [])]
          });
        }
      }

      collection.value = [...grouped.values()];
    } catch (err) {
      console.error("Failed to load deck collection:", err);
      collectionError.value = "Failed to load your collection.";
    } finally {
      collectionLoading.value = false;
    }
  }

  onMounted(loadCollection);

  return {
    collection,
    collectionLoading,
    collectionError,
    collectionSearch,
    cardFilters,
    availableTags,
    filteredCollection,
    loadCollection
  };
}