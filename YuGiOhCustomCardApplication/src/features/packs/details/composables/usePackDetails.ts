import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPackDetails, generateTestPack, updatePackPublication, deletePack, type Pack, type PulledCard } from "../../services/packService";
import { useAuth } from "@/features/auth/composables/useAuth";

export function usePackDetails() {
  const route = useRoute();
  const { isAdmin, checkAdmin } = useAuth();

  const pack = ref<Pack | null>(null);
  const loading = ref(true);
  const error = ref("");

  const showPurchaseModal = ref(false);

  const updatingPublication = ref(false);
  const publicationError = ref("");

  const router = useRouter();

  const deletingPack = ref(false);
  const deleteError = ref("");

  async function togglePublication() {
    if (!pack.value || updatingPublication.value) return;

    updatingPublication.value = true;
    publicationError.value = "";

    try {
      const updatedPack = await updatePackPublication(
        pack.value.id,
        !pack.value.is_published
      );

      pack.value = {
        ...pack.value,
        ...updatedPack
      };

      if (!updatedPack.is_published) {
        closePurchaseModal();
      }
    } catch (err) {
      console.error("Failed to update publication:", err);

      publicationError.value =
        err instanceof Error
          ? err.message
          : "Failed to update publication status.";
    } finally {
      updatingPublication.value = false;
    }
  }

  function openPurchaseModal() {
    if (!pack.value || !pack.value.is_published) return;

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

  async function removePack() {
    if (!pack.value || deletingPack.value) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${pack.value.name}"?\n\n` +
      "This removes the pack from the shops, but cards already owned by players will remain."
    );

    if (!confirmed) return;

    deletingPack.value = true;
    deleteError.value = "";

    try {
      await deletePack(pack.value.id);

      await router.replace("/packs");
    } catch (err) {
      deleteError.value =
        err instanceof Error
          ? err.message
          : "Failed to delete pack.";
    }
  }

  onMounted(() => {
    checkAdmin();
    loadPack();
  });

  return {
    isAdmin,
    pack,
    loading,
    error,
    showPurchaseModal,
    pulledCards,
    pulling,
    pullError,
    hasPulled,
    updatingPublication,
    publicationError,
    deletingPack,
    deleteError,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    loadPack,
    testPull,
    togglePublication,
    removePack
  };
}