
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch
} from "vue";

import {
  getCollection,
  type CollectionCard
} from "../services/collectionService";

export function useCollection() {
  const collection = ref<CollectionCard[]>([]);
  const loading = ref(true);
  const error = ref("");

  const searchQuery = ref("");

  // Filter collection by card name
  const filteredCollection = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    return collection.value.filter(card =>
      card.card_name.toLowerCase().includes(query)
    );
  });

  // Responsive pagination
  const currentPage = ref(1);
  const cardsPerPage = ref(28);

  const galleryElement = ref<HTMLElement | null>(null);

  const cardMinWidth = 160;
  const cardGap = 24;
  const rowsPerPage = 4;

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

  // Reset pagination whenever search changes
  watch(searchQuery, () => {
    currentPage.value = 1;
  });

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
  async function loadCollection() {
    loading.value = true;
    error.value = "";

    try {
      collection.value = await getCollection();
      currentPage.value = 1;
    } catch (err) {
      console.error("Error loading collection:", err);

      collection.value = [];
      error.value = "Unable to load your collection.";
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadCollection);

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
  });

  return {
    collection,
    filteredCollection,
    paginatedCollection,
    searchQuery,
    loading,
    error,
    currentPage,
    totalPages,
    galleryElement,
    nextPage,
    previousPage,
    loadCollection
  };
}