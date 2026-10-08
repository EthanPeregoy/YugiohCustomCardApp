import { ref, computed, onMounted } from "vue";
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

  const cardsPerPage = 30;

  const currentPage = ref(
    Math.max(1, Number(route.query.page) || 1)
  );

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(cards.value.length / cardsPerPage))
  );

  const paginatedCards = computed(() => {
    const start = (currentPage.value - 1) * cardsPerPage;
    return cards.value.slice(start, start + cardsPerPage);
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

  onMounted(() => {
    searchCards(searchQuery.value, false);
  });

  return {
    searchQuery,
    cards,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedCards,
    searchCards,
    nextPage,
    previousPage,
  };
}
