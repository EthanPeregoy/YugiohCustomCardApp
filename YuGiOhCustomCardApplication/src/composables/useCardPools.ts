import { ref, computed, onMounted } from "vue";
import { getAllCards } from "../services/cardService";
import type { Card, Rarity } from "../types/pack";

export function useCardPools() {
  const allCards = ref<Card[]>([]);
  const cardSearch = ref("");
  const selectedRarity = ref<Rarity>("Common");

  const cardPools = ref<Record<Rarity, Card[]>>({
    "Common": [],
    "Rare": [],
    "Super Rare": [],
    "Ultra Rare": [],
    "Secret Rare": []
  });

  const loadingCards = ref(false);
  const cardLoadError = ref("");

  async function fetchCards() {
    loadingCards.value = true;
    cardLoadError.value = "";

    try {
      allCards.value = await getAllCards();
    } catch (err) {
      console.error("Error fetching cards:", err);
      cardLoadError.value = "Failed to load cards.";
    } finally {
      loadingCards.value = false;
    }
  }

  const filteredCards = computed(() => {
    const query = cardSearch.value.trim().toLowerCase();

    if (!query) {
      return allCards.value.slice(0, 30);
    }

    return allCards.value
      .filter(card =>
        card.card_name.toLowerCase().includes(query)
      )
      .slice(0, 30);
  });

  function addCardToPool(card: Card) {
    const pool = cardPools.value[selectedRarity.value];

    if (pool.some(existing => existing.id === card.id)) {
      return;
    }

    pool.push(card);
  }

  function removeCardFromPool(cardId: number, rarity: Rarity) {
    cardPools.value[rarity] = cardPools.value[rarity].filter(
      card => card.id !== cardId
    );
  }

  function isCardInPool(cardId: number): boolean {
    return cardPools.value[selectedRarity.value].some(
      card => card.id === cardId
    );
  }

  onMounted(fetchCards);

  return {
    allCards,
    cardSearch,
    selectedRarity,
    cardPools,
    loadingCards,
    cardLoadError,
    filteredCards,
    addCardToPool,
    removeCardFromPool,
    isCardInPool,
    fetchCards
  };
}