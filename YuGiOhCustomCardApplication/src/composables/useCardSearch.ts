import { ref, nextTick, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllCards, searchCardsByName } from "../services/cardService";

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

  async function changePage(direction: "next" | "previous") {
    if (direction === "next") {
      nextPage();
    } else {
      previousPage();
    }

    await nextTick();

    document.getElementById("card-gallery")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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

  const currentPage = ref(
    Math.max(1, Number(route.query.page) || 1)
  );

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(cards.value.length / cardsPerPage.value))
  );

  const paginatedCards = computed(() => {
    const start = (currentPage.value - 1) * cardsPerPage.value;

    return cards.value.slice(
      start,
      start + cardsPerPage.value
    );
  });

  function updateSearchURL() {
    router.replace({
      path: "/cards",
      query: {
        search: searchQuery.value || undefined,
        page: currentPage.value,
      },
    });
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      updateSearchURL();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function previousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      updateSearchURL();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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