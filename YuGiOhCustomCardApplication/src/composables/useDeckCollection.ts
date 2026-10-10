import { ref, computed, onMounted } from "vue";
import {
  getCollection,
  type CollectionCard
} from "../services/collectionService";

export interface DeckCollectionCard {
  card_id: number;
  card_name: string;
  image_path: string | null;
  card_type: string;
  frame_type: string;
  quantity: number;
}

export function useDeckCollection() {
  const collection = ref<DeckCollectionCard[]>([]);
  const collectionLoading = ref(true);
  const collectionError = ref("");
  const collectionSearch = ref("");

  const filteredCollection = computed(() => {
    const query = collectionSearch.value.trim().toLowerCase();

    return collection.value.filter(card =>
      card.card_name.toLowerCase().includes(query)
    );
  });

  async function loadCollection() {
    collectionLoading.value = true;
    collectionError.value = "";

    try {
      const entries: CollectionCard[] = await getCollection();

      const grouped = new Map<number, DeckCollectionCard>();

      for (const entry of entries) {
        const existing = grouped.get(entry.card_id);

        if (existing) {
          existing.quantity += Number(entry.quantity);
        } else {
          grouped.set(entry.card_id, {
            card_id: entry.card_id,
            card_name: entry.card_name,
            image_path: entry.image_path,
            card_type: entry.card_type,
            frame_type: entry.frame_type,
            quantity: Number(entry.quantity)
          });
        }
      }

      collection.value = [...grouped.values()].sort(
        (a, b) => a.card_name.localeCompare(b.card_name)
      );
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
    filteredCollection,
    loadCollection
  };
}