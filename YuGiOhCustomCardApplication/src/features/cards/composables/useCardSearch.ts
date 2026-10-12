import { ref, nextTick, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllCards, searchCardsByName } from "../services/cardService";
import { createDefaultCardFilters } from "@/global/types/cardFilters";
import { filterAndSortCards } from "@/global/utils/cardFiltering";
import { usePagination } from "@/global/composables/usePagination";

export function useCardSearch() {
  const route = useRoute();
  const router = useRouter();

  const searchQuery = ref(
    typeof route.query.search === "string"
      ? route.query.search
      : ""
  );

  const cards = ref<any[]>([]);
  const loading = ref(true);
  const error = ref("");

  const cardFilters = ref(
    createDefaultCardFilters()
  );

  const filteredCards = computed(() =>
    filterAndSortCards(cards.value, cardFilters.value)
  );

  const cardsPerPage = ref(30);
  
  const galleryElement = ref<HTMLElement | null>(null);

  const cardMinWidth = 160;
  const cardGap = 24;
  const rowsPerPage = 4;

  const selectedCardId = ref<number | null>(null);

  let resizeObserver: ResizeObserver | null = null;

  function openCard(cardId: number) {
    selectedCardId.value = cardId;
  }

  function closeCard() {
    selectedCardId.value = null;
  }

  function updateCardsPerPage() {
    if (!galleryElement.value) return;

    const galleryWidth = galleryElement.value.clientWidth;

    const columns = Math.max(
      1,
      Math.floor(
        (galleryWidth + cardGap) / (cardMinWidth + cardGap)
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

    updateSearchURL();
  }

  const {
    currentPage,
    totalPages,
    displayedItems: paginatedCards,
    changePage: setPage
  } = usePagination(filteredCards, cardsPerPage);

  // Preserve the page from the URL when initially loading.
  const initialPage = Number(route.query.page);

  if (Number.isInteger(initialPage) && initialPage > 0) {
    currentPage.value = initialPage;
  }

  async function changePage(page: number) {
    if (page < 1 || page > totalPages.value) return;

    setPage(page);
    updateSearchURL();

    await nextTick();

    document.getElementById("card-gallery")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function updateSearchURL() {
    router.replace({
      path: "/cards",
      query: {
        search: searchQuery.value || undefined,
        page: currentPage.value,
      },
    });
  }

  async function searchCards(
    query: string,
    resetPage = true
  ) {
    loading.value = true;
    error.value = "";

    try {
      cards.value = query.trim()
        ? await searchCardsByName(query.trim())
        : await getAllCards();

      if (resetPage) {
        currentPage.value = 1;
      }

      currentPage.value = Math.min(
        currentPage.value,
        totalPages.value
      );

      updateSearchURL();
    } catch (err) {
      console.error(err);
      cards.value = [];
      error.value = "Could not load cards.";
    } finally {
      loading.value = false;
    }
  }

  watch(
    cardFilters,
    () => {
      currentPage.value = 1;
      updateSearchURL();
    },
    { deep: true }
  );

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

  onMounted(() => {
    searchCards(searchQuery.value, false);
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
  });
  return {
    searchQuery,
    cards,
    cardFilters,
    filteredCards,
    selectedCardId,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedCards,
    galleryElement,
    searchCards,
    openCard,
    closeCard,
    changePage
  };
}