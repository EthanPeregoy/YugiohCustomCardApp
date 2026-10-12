
import { ref, computed, watch, onMounted } from "vue";
import { getShopPacks, type ShopPack } from "../../services/packService";
import { usePagination } from "@/global/composables/usePagination";

export function usePackShop() {
  const packs = ref<ShopPack[]>([]);
  const loading = ref(true);
  const error = ref("");

  const selectedPack = ref<ShopPack | null>(null);

  const selectedPrice = ref<number | "all">("all");

  function openPurchaseModal(pack: ShopPack) {
    selectedPack.value = pack;
  }

  function closePurchaseModal() {
    selectedPack.value = null;
  }

  function handlePurchase(remainingDuelPoints: number) {
    console.log(
      "Pack purchased! Remaining Duel Points:",
      remainingDuelPoints
    );
  }

  const searchQuery = ref("");

  const rowsPerPage = ref<number | "all">(2);
  const sortBy = ref("default");
  const includeRestrictedInSort = ref(false);

  const columnsPerRow = 4;

  const packsPerPage = computed(() => {
    if (rowsPerPage.value === "all") {
      return Math.max(1, sortedPacks.value.length);
    }

    return rowsPerPage.value * columnsPerRow;
  });
  
  const filteredPacks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    return packs.value.filter(pack => {
      const matchesSearch =
        pack.name.toLowerCase().includes(query) ||
        (pack.description ?? "").toLowerCase().includes(query);

      const matchesPrice =
        selectedPrice.value === "all" ||
        Number(pack.price) === selectedPrice.value;

      return matchesSearch && matchesPrice;
    });
  });
  
  const sortedPacks = computed(() => {
    const result = [...filteredPacks.value];

    result.sort((a, b) => {
      // Restricted packs appear last by default
      if (!includeRestrictedInSort.value) {
        const difference =
          Number(a.restricted) - Number(b.restricted);

        if (difference !== 0) return difference;
      }

      switch (sortBy.value) {
        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "name":
          return a.name.localeCompare(b.name);

        default:
          return 0;
      }
    });

    return result;
  });

  const {
    currentPage,
    totalPages,
    displayedItems: displayedPacks,
    changePage,
    resetPage
  } = usePagination(sortedPacks, packsPerPage);

  watch(
    [
      searchQuery,
      selectedPrice,
      rowsPerPage,
      sortBy,
      includeRestrictedInSort
    ],
    resetPage
  );

  async function loadPacks() {
    loading.value = true;
    error.value = "";

    try {
      packs.value = await getShopPacks();

    } catch (err) {
      console.error(err);
      error.value = "Unable to load the Pack Shop.";

    } finally {
      loading.value = false;
    }
  }

  onMounted(loadPacks);

  return {
    packs,
    loading,
    error,
    selectedPack,
    searchQuery,
    currentPage,
    filteredPacks,
    totalPages,
    displayedPacks,
    rowsPerPage,
    sortBy,
    includeRestrictedInSort,
    selectedPrice,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    changePage,
    loadPacks
  };
}