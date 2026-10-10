import { ref, onMounted } from "vue";
import { getDecks, createDeck, renameDeck, deleteDeck, type Deck } from "../services/deckService";

export function useDecks() {
  const decks = ref<Deck[]>([]);
  const loading = ref(true);
  const error = ref("");
  const processing = ref(false);

  // Load the user's saved decks
  async function loadDecks() {
    loading.value = true;
    error.value = "";

    try {
      decks.value = await getDecks();
    } catch (err) {
      console.error("Failed to load decks:", err);
      error.value = "Failed to load your decks.";
    } finally {
      loading.value = false;
    }
  }

  // Create a new deck
  async function addDeck(name: string): Promise<Deck | null> {
    if (processing.value) return null;

    processing.value = true;
    error.value = "";

    try {
      const deck = await createDeck(name.trim());

      decks.value.unshift({
        ...deck,
        total_cards: 0
      });

      return deck;
    } catch (err) {
      console.error("Failed to create deck:", err);
      error.value = "Failed to create deck.";
      return null;
    } finally {
      processing.value = false;
    }
  }

  // Rename an existing deck
  async function updateDeckName(
    deckId: number,
    name: string
  ): Promise<boolean> {
    if (processing.value) return false;

    processing.value = true;
    error.value = "";

    try {
      const updated = await renameDeck(deckId, name.trim());

      const deck = decks.value.find(d => d.id === deckId);

      if (deck) {
        deck.name = updated.name;
        deck.updated_at = updated.updated_at;
      }

      return true;
    } catch (err) {
      console.error("Failed to rename deck:", err);
      error.value = "Failed to rename deck.";
      return false;
    } finally {
      processing.value = false;
    }
  }

  // Delete a deck
  async function removeDeck(deckId: number): Promise<boolean> {
    if (processing.value) return false;

    processing.value = true;
    error.value = "";

    try {
      await deleteDeck(deckId);

      decks.value = decks.value.filter(
        deck => deck.id !== deckId
      );

      return true;
    } catch (err) {
      console.error("Failed to delete deck:", err);
      error.value = "Failed to delete deck.";
      return false;
    } finally {
      processing.value = false;
    }
  }

  onMounted(loadDecks);

  return {
    decks,
    loading,
    error,
    processing,
    loadDecks,
    addDeck,
    updateDeckName,
    removeDeck
  };
}