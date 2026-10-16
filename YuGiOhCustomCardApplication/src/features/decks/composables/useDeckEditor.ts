import { ref, computed } from "vue";
import {
  saveDeckCards,
  type DeckCard,
  type SaveDeckCard
} from "../services/deckService";
import type { DeckCollectionCard } from "./useDeckCollection";

export type DeckSection = "main" | "extra" | "side";

export interface EditableDeckCard extends DeckCard {
  localId: number;
}

const SECTION_LIMITS: Record<DeckSection, number> = {
  main: 60,
  extra: 15,
  side: 15
};

const EXTRA_TYPES = ["fusion", "synchro", "xyz", "link"];

export function useDeckEditor() {
  const editableCards = ref<EditableDeckCard[]>([]);
  const saving = ref(false);
  const saveError = ref("");
  const actionMessage = ref("");
  const hasChanges = ref(false);

  let nextLocalId = 1;

  const expandedDeckCards = computed(() => editableCards.value);
  const totalCards = computed(() => editableCards.value.length);

  function sectionCards(section: DeckSection) {
    return editableCards.value
      .filter(card => card.deck_section === section)
      .sort((a, b) => a.position - b.position);
  }

  function sectionCount(section: DeckSection) {
    return sectionCards(section).length;
  }

  function normalizePositions() {
    for (const section of ["main", "extra", "side"] as DeckSection[]) {
      sectionCards(section).forEach((card, index) => {
        card.position = index + 1;
      });
    }
  }

  function loadCards(cards: DeckCard[]) {
    nextLocalId = 1;

    editableCards.value = cards.map(card => ({
      ...card,
      localId: nextLocalId++
    }));

    normalizePositions();
    hasChanges.value = false;
    saveError.value = "";
    actionMessage.value = "";
  }

  function isExtraDeckCard(frameType: string) {
    const frame = frameType.toLowerCase();
    return EXTRA_TYPES.some(type => frame.includes(type));
  }

  function addCard(card: DeckCollectionCard) {
    const section: DeckSection = isExtraDeckCard(card.frame_type)
      ? "extra"
      : "main";

    return addCardToSection(card, section);
  }

  function addCardToSection(
    card: DeckCollectionCard,
    section: DeckSection,
    targetPosition?: number
  ): boolean {
    actionMessage.value = "";

    const totalInDeck = editableCards.value.filter(
      entry => entry.card_id === card.card_id
    ).length;

    if (totalInDeck >= 3) {
      actionMessage.value = "Maximum 3 copies per card.";
      return false;
    }

    if (totalInDeck >= card.quantity) {
      actionMessage.value = "You don't own enough copies.";
      return false;
    }

    const isExtra = isExtraDeckCard(card.frame_type);

    if (section === "main" && isExtra) {
      actionMessage.value = "Extra Deck monsters cannot enter the Main Deck.";
      return false;
    }

    if (section === "extra" && !isExtra) {
      actionMessage.value = "This card cannot enter the Extra Deck.";
      return false;
    }

    if (sectionCount(section) >= SECTION_LIMITS[section]) {
      actionMessage.value = `${section} deck is full.`;
      return false;
    }

    const cards = sectionCards(section);
    const insertAt = Math.max(
      0,
      Math.min((targetPosition ?? cards.length + 1) - 1, cards.length)
    );

    const newCard: EditableDeckCard = {
      deck_card_id: -1,
      card_id: card.card_id,
      card_name: card.card_name,
      image_path: card.image_path,
      card_type: card.card_type,
      frame_type: card.frame_type,
      deck_section: section,
      position: insertAt + 1,
      localId: nextLocalId++
    };

    cards.splice(insertAt, 0, newCard);

    editableCards.value = [
      ...editableCards.value.filter(c => c.deck_section !== section),
      ...cards
    ];

    normalizePositions();
    hasChanges.value = true;
    return true;
  }

  function removeCardByLocalId(localId: number) {
    actionMessage.value = "";

    const index = editableCards.value.findIndex(
      card => card.localId === localId
    );

    if (index === -1) return;

    editableCards.value.splice(index, 1);
    normalizePositions();
    hasChanges.value = true;
  }

  function removeCard(cardId: number, section: DeckSection) {
    const card = sectionCards(section).find(
      entry => entry.card_id === cardId
    );

    if (card) removeCardByLocalId(card.localId);
  }

  function moveCardToPosition(
    localId: number,
    to: DeckSection,
    targetPosition?: number
  ): boolean {
    actionMessage.value = "";

    const source = editableCards.value.find(
      card => card.localId === localId
    );

    if (!source) return false;

    const from = source.deck_section;
    const isExtra = isExtraDeckCard(source.frame_type);

    if (to === "main" && isExtra) {
      actionMessage.value = "Extra Deck monsters cannot enter the Main Deck.";
      return false;
    }

    if (to === "extra" && !isExtra) {
      actionMessage.value = "This card cannot enter the Extra Deck.";
      return false;
    }

    if (from !== to && sectionCount(to) >= SECTION_LIMITS[to]) {
      actionMessage.value = `${to} deck is full.`;
      return false;
    }

    const destination = sectionCards(to).filter(
      card => card.localId !== localId
    );

    const insertAt = Math.max(
      0,
      Math.min(
        (targetPosition ?? destination.length + 1) - 1,
        destination.length
      )
    );

    if (from !== to) {
      source.deck_section = to;
    }

    destination.splice(insertAt, 0, source);

    editableCards.value = [
      ...editableCards.value.filter(
        card => card.deck_section !== to && card.localId !== localId
      ),
      ...destination
    ];

    // Assign positions directly to preserve the new order.
    destination.forEach((card, index) => {
      card.position = index + 1;
    });

    // Close gaps in the source section.
    if (from !== to) {
      sectionCards(from).forEach((card, index) => {
        card.position = index + 1;
      });
    }

    hasChanges.value = true;
    return true;
  }

  function moveCard(
    cardId: number,
    from: DeckSection,
    to: DeckSection
  ): boolean {
    if (from === to) return false;

    const card = sectionCards(from).find(
      entry => entry.card_id === cardId
    );

    if (!card) return false;

    return moveCardToPosition(card.localId, to);
  }

  async function saveCards(deckId: number): Promise<boolean> {
    if (saving.value || !hasChanges.value) return false;

    saving.value = true;
    saveError.value = "";
    actionMessage.value = "";

    try {
      const cards: SaveDeckCard[] = (
        ["main", "extra", "side"] as DeckSection[]
      ).flatMap(section =>
        sectionCards(section).map((card, index) => ({
          card_id: card.card_id,
          deck_section: section,
          position: index + 1
        }))
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
    sectionCards,
    sectionCount,
    loadCards,
    addCard,
    addCardToSection,
    removeCard,
    removeCardByLocalId,
    moveCard,
    moveCardToPosition,
    saveCards
  };
}