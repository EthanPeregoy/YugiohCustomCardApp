import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { getCollection, type CollectionCard } from "@/global/services/collectionService";
import { createDefaultCardFilters } from "@/global/types/cardFilters";
import { filterAndSortCards } from "@/global/utils/cardFiltering";

export function useCollection() {
  const collection = ref<CollectionCard[]>([]);
  const loading = ref(true);
  const error = ref("");

  const searchQuery = ref("");

  const cardFilters = ref(
    createDefaultCardFilters()
  );

  const availableRarities = computed(() =>
    [...new Set(
      collection.value.map(card => card.rarity)
    )]
  );

  const availableTags = computed(() => {
    const tagsById = new Map();

    for (const card of collection.value) {
      for (const tag of card.tags ?? []) {
        tagsById.set(tag.id, tag);
      }
    }

    return [...tagsById.values()].sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  });

  // Combine name search, modal filters, and sorting.
  const filteredCollection = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    const matchingNames = collection.value.filter(card =>
      card.card_name.toLowerCase().includes(query)
    );

    return filterAndSortCards(
      matchingNames,
      cardFilters.value,
      "collection"
    );
  });

  // Responsive pagination
  const currentPage = ref(1);
  const cardsPerPage = ref(28);

  const galleryElement = ref<HTMLElement | null>(null);

  const cardMinWidth = 160;
  const cardGap = 24;
  const rowsPerPage = 4;

  const selectedCardId = ref<number | null>(null);

  let resizeObserver: ResizeObserver | null = null;

  const totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(
        filteredCollection.value.length / cardsPerPage.value
      )
    )
  );

  const paginatedCollection = computed(() => {
    const start =
      (currentPage.value - 1) * cardsPerPage.value;

    return filteredCollection.value.slice(
      start,
      start + cardsPerPage.value
    );
  });

  function updateCardsPerPage() {
    if (!galleryElement.value) return;

    const galleryWidth = galleryElement.value.clientWidth;

    const columns = Math.max(
      1,
      Math.floor(
        (galleryWidth + cardGap) /
        (cardMinWidth + cardGap)
      )
    );

    const newCardsPerPage = columns * rowsPerPage;

    if (newCardsPerPage === cardsPerPage.value) return;

    const firstCardIndex =
      (currentPage.value - 1) * cardsPerPage.value;

    cardsPerPage.value = newCardsPerPage;

    currentPage.value = Math.min(
      Math.floor(firstCardIndex / newCardsPerPage) + 1,
      totalPages.value
    );
  }

  function openCard(cardId: number) {
    selectedCardId.value = cardId;
  }

  function closeCard() {
    selectedCardId.value = null;
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function previousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  async function changePage(direction: "next" | "previous") {
    if (direction === "next") {
      nextPage();
    } else {
      previousPage();
    }

    await nextTick();

    document.getElementById("collection-gallery")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // Reset pagination whenever search changes
  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  watch(
    cardFilters,
    () => {
      currentPage.value = 1;
    },
    { deep: true }
  );

  // Observe gallery width
  watch(galleryElement, (element) => {
    resizeObserver?.disconnect();
    resizeObserver = null;

    if (!element) return;

    resizeObserver = new ResizeObserver(() => {
      updateCardsPerPage();
    });

    resizeObserver.observe(element);
    updateCardsPerPage();
  });

  // Retrieve logged-in user's collection
  async function loadCollection(resetPage = true) {
    loading.value = true;
    error.value = "";

    try {
      collection.value = await getCollection();

      const existingTagIds = new Set(
        collection.value.flatMap(card =>
          (card.tags ?? []).map(tag => tag.id)
        )
      );

      const remainingTagIds = cardFilters.value.tagIds.filter(
        id => existingTagIds.has(id)
      );

      if (
        remainingTagIds.length !== cardFilters.value.tagIds.length
      ) {
        cardFilters.value.tagIds = remainingTagIds;
      }

      if (resetPage) {
        currentPage.value = 1;
      } else {
        currentPage.value = Math.min(
          currentPage.value,
          totalPages.value
        );
      }
    } catch (err) {
      console.error("Error loading collection:", err);

      collection.value = [];
      error.value = "Unable to load your collection.";
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => loadCollection());

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
  });

  return {
    collection,
    cardFilters,
    availableRarities,
    availableTags,
    selectedCardId,
    filteredCollection,
    paginatedCollection,
    searchQuery,
    loading,
    error,
    currentPage,
    totalPages,
    galleryElement,
    changePage,
    loadCollection,
    openCard,
    closeCard
  };
}