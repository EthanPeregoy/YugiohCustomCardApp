
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch
} from "vue";

import {
  getShopCards,
  purchaseShopCard,
  type ShopCard
} from "../services/cardShopService";

export function useCardShop() {
  const cards = ref<ShopCard[]>([]);
  const searchQuery = ref("");
  const activeSearch = ref("");
  const loading = ref(true);
  const error = ref("");

  const selectedCardId = ref<number | null>(null);

  const purchasing = ref(false);
  const purchaseMessage = ref("");
  const purchaseError = ref("");

  const selectedCard = computed(() =>
    cards.value.find(card => card.id === selectedCardId.value)
  );

  const currentPage = ref(1);
  const columnsPerRow = ref(5);

  const galleryRef = ref<HTMLElement | null>(null);
  let galleryObserver: ResizeObserver | null = null;

  function updateColumns(width: number) {
    const minimumCardWidth = 155;
    const gap = 20;
    const horizontalPadding = 40;

    const availableWidth = Math.max(0, width - horizontalPadding);

    columnsPerRow.value = Math.max(
      1,
      Math.floor((availableWidth + gap) / (minimumCardWidth + gap))
    );
  }

  const cardsPerPage = computed(() => columnsPerRow.value * 4);

  const filteredCards = computed(() => {
    const query = activeSearch.value.trim().toLowerCase();

    console.log("Search query:", query);

    const results = cards.value.filter(card =>
        (card.card_name ?? "").toLowerCase().includes(query)
    );

    console.log("Matching cards:", results);

    return results;
    });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredCards.value.length / cardsPerPage.value))
  );

  watch(totalPages, newTotal => {
    if (currentPage.value > newTotal) {
      currentPage.value = newTotal;
    }
  });

  const paginatedCards = computed(() => {
    const start = (currentPage.value - 1) * cardsPerPage.value;

    return filteredCards.value.slice(
      start,
      start + cardsPerPage.value
    );
  });

  async function loadCards() {
    loading.value = true;
    error.value = "";

    try {
        cards.value = await getShopCards();

    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "An unexpected error occurred";
    } finally {
      loading.value = false;
    }
  }

  function searchCards() {
    activeSearch.value = searchQuery.value;
    currentPage.value = 1;
  }

  function openCard(cardId: number) {
    selectedCardId.value = cardId;
  }

  function closeCard() {
    selectedCardId.value = null;
  }

  async function purchaseCard() {
    if (!selectedCard.value || purchasing.value) return;

    purchasing.value = true;
    purchaseError.value = "";
    purchaseMessage.value = "";

    try {
      const data = await purchaseShopCard(selectedCard.value.id);

      purchaseMessage.value =
        `Successfully purchased ${selectedCard.value.card_name}! ` +
        `Remaining DP: ${data.remainingDuelPoints}`;

    } catch (err) {
      purchaseError.value =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred";
    } finally {
      purchasing.value = false;
    }
  }

  async function changePage(direction: "next" | "previous") {
    if (direction === "next" && currentPage.value < totalPages.value) {
      currentPage.value++;
    } else if (direction === "previous" && currentPage.value > 1) {
      currentPage.value--;
    }

    await nextTick();

    document.getElementById("card-gallery")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  onMounted(async () => {
    await loadCards();
    await nextTick();

    if (galleryRef.value) {
      galleryObserver = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect.width;

        if (width !== undefined) {
          updateColumns(width);
        }
      });

      galleryObserver.observe(galleryRef.value);
    }
  });

  onUnmounted(() => {
    galleryObserver?.disconnect();
  });

  return {
    cards,
    searchQuery,
    activeSearch,
    loading,
    error,
    selectedCardId,
    selectedCard,
    purchasing,
    purchaseMessage,
    purchaseError,
    currentPage,
    columnsPerRow,
    galleryRef,
    cardsPerPage,
    filteredCards,
    totalPages,
    paginatedCards,
    loadCards,
    searchCards,
    openCard,
    closeCard,
    purchaseCard,
    changePage
  };
}