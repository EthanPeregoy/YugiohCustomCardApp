import { ref, computed } from "vue";
import {
  saveDeckCards,
  type DeckCard,
  type SaveDeckCard
} from "../services/deckService";
import type {
  DeckCollectionCard
} from "./useDeckCollection";

type DeckSection = "main" | "extra" | "side";

const SECTION_LIMITS: Record<DeckSection, number> = {
  main: 60,
  extra: 15,
  side: 15
};

const EXTRA_TYPES = ["fusion", "synchro", "xyz", "link"];

export function useDeckEditor() {
  const editableCards = ref<DeckCard[]>([]);
  const saving = ref(false);
  const saveError = ref("");
  const actionMessage = ref("");
  const hasChanges = ref(false);

  const expandedDeckCards = computed(() =>
    editableCards.value.flatMap(card =>
      Array.from({ length: card.quantity }, (_, index) => ({
        ...card,
        copyIndex: index
      }))
    )
  );

  const totalCards = computed(() =>
    editableCards.value.reduce(
      (sum, card) => sum + card.quantity,
      0
    )
  );

  function sectionCount(section: DeckSection) {
    return editableCards.value
      .filter(card => card.deck_section === section)
      .reduce((sum, card) => sum + card.quantity, 0);
  }

  function loadCards(cards: DeckCard[]) {
    editableCards.value = cards.map(card => ({ ...card }));
    hasChanges.value = false;
    saveError.value = "";
    actionMessage.value = "";
  }

  function isExtraDeckCard(frameType: string) {
    const frame = frameType.toLowerCase();

    return EXTRA_TYPES.some(type => frame.includes(type));
  }

  function addCard(card: DeckCollectionCard) {
    actionMessage.value = "";

    const totalInDeck = editableCards.value
      .filter(entry => entry.card_id === card.card_id)
      .reduce((sum, entry) => sum + entry.quantity, 0);

    if (totalInDeck >= 3) {
      actionMessage.value = "Maximum 3 copies per card.";
      return;
    }

    if (totalInDeck >= card.quantity) {
      actionMessage.value = "You don't own enough copies.";
      return;
    }

    const section: DeckSection = isExtraDeckCard(card.frame_type)
      ? "extra"
      : "main";

    if (sectionCount(section) >= SECTION_LIMITS[section]) {
      actionMessage.value = `${section} deck is full.`;
      return;
    }

    const existing = editableCards.value.find(
      entry =>
        entry.card_id === card.card_id &&
        entry.deck_section === section
    );

    if (existing) {
      existing.quantity++;
    } else {
      editableCards.value.push({
        card_id: card.card_id,
        card_name: card.card_name,
        image_path: card.image_path,
        card_type: card.card_type,
        frame_type: card.frame_type,
        deck_section: section,
        quantity: 1
      });
    }

    hasChanges.value = true;
  }

  function removeCard(cardId: number, section: DeckSection) {
    actionMessage.value = "";

    const index = editableCards.value.findIndex(
      card =>
        card.card_id === cardId &&
        card.deck_section === section
    );

    if (index === -1) return;

    if (editableCards.value[index].quantity > 1) {
      editableCards.value[index].quantity--;
    } else {
      editableCards.value.splice(index, 1);
    }

    hasChanges.value = true;
  }

  async function saveCards(deckId: number): Promise<boolean> {
    if (saving.value || !hasChanges.value) return false;

    saving.value = true;
    saveError.value = "";
    actionMessage.value = "";

    try {
      const cards: SaveDeckCard[] = editableCards.value.map(
        card => ({
          card_id: card.card_id,
          deck_section: card.deck_section,
          quantity: card.quantity
        })
      );

      await saveDeckCards(deckId, cards);

      hasChanges.value = false;
      actionMessage.value = "Deck saved successfully!";
      return true;
    } catch (err) {
      saveError.value =
        err instanceof Error ? err.message : "Failed to save deck.";
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
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
    removeCard,
    saveCards
  };
}