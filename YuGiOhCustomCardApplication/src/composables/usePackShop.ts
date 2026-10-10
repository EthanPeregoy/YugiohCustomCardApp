
import { ref, computed, watch, onMounted } from "vue";
import { getShopPacks, type ShopPack } from "../services/packService";

export function usePackShop() {
  const packs = ref<ShopPack[]>([]);
  const loading = ref(true);
  const error = ref("");

  const selectedPack = ref<ShopPack | null>(null);

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
  const currentPage = ref(1);
  const packsPerPage = 6;

  const filteredPacks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    return packs.value.filter(pack =>
      pack.name.toLowerCase().includes(query) ||
      (pack.description ?? "").toLowerCase().includes(query)
    );
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPacks.value.length / packsPerPage))
  );

  const displayedPacks = computed(() => {
    const start = (currentPage.value - 1) * packsPerPage;

    return filteredPacks.value.slice(
      start,
      start + packsPerPage
    );
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  function changePage(page: number) {
    if (page < 1 || page > totalPages.value) return;

    currentPage.value = page;
  }

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
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    changePage,
    loadPacks
  };
}