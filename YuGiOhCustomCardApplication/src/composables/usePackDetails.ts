
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import { getPackDetails, generateTestPack, type Pack, type PulledCard } from "../services/packService";

export function usePackDetails() {
  const route = useRoute();

  const pack = ref<Pack | null>(null);
  const loading = ref(true);
  const error = ref("");

  const showPurchaseModal = ref(false);

  function openPurchaseModal() {
    if (!pack.value) return;

    showPurchaseModal.value = true;
  }

  function closePurchaseModal() {
    showPurchaseModal.value = false;
  }

  function handlePurchase(remainingDuelPoints: number) {
    console.log(
      "Pack purchased! Remaining Duel Points:",
      remainingDuelPoints
    );
  }

  const pulledCards = ref<PulledCard[]>([]);
  const pulling = ref(false);
  const pullError = ref("");
  const hasPulled = ref(false);

  async function loadPack() {
    loading.value = true;
    error.value = "";

    try {
      pack.value = await getPackDetails(
        route.params.id as string
      );

    } catch (err) {
      console.error(err);
      error.value = "Unable to load this pack.";
    } finally {
      loading.value = false;
    }
  }

  async function testPull() {
    if (!pack.value || pulling.value) return;

    pulling.value = true;
    pullError.value = "";
    pulledCards.value = [];
    hasPulled.value = false;

    try {
      const data = await generateTestPack(pack.value.id);

      pulledCards.value = data.cards;
      hasPulled.value = true;

    } catch (err) {
      console.error(err);
      pullError.value = "Unable to generate a test pack.";
    } finally {
      pulling.value = false;
    }
  }

  onMounted(loadPack);

  return {
    pack,
    loading,
    error,
    showPurchaseModal,
    pulledCards,
    pulling,
    pullError,
    hasPulled,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    loadPack,
    testPull
  };
}