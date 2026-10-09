import { ref, computed, watch, toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getCardById } from "../services/cardService";
import { getMonsterStats } from "../utils/cardFormatting";

export function useCardDetails(cardId?: MaybeRefOrGetter<string | number | null>) {
  const route = useRoute();
  const cardDetails = ref<any>(null);
  const loading = ref(true);
  const error = ref("");

  let requestId = 0;

  async function fetchCardDetails(id: string) {
    const currentRequest = ++requestId;

    loading.value = true;
    error.value = "";
    cardDetails.value = null;

    try {
      const card = await getCardById(id);

      if (currentRequest === requestId) {
        cardDetails.value = card;
      }
    } catch (err) {
      if (currentRequest === requestId) {
        console.error(err);
        error.value = "Could not load card.";
      }
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  }

  const monsterStats = computed(() => {
    if (!cardDetails.value) {
      return null;
    }
    return getMonsterStats(cardDetails.value);
  });

  watch(
    () => cardId === undefined ? route.params.id : toValue(cardId),
    (id) => {
      if (
        (typeof id === "string" && id.length > 0) ||
        (typeof id === "number" && Number.isFinite(id))
      ) {
        fetchCardDetails(String(id));
      } else {
        requestId++;
        cardDetails.value = null;
        error.value = "Invalid card ID.";
        loading.value = false;
      }
    },
    { immediate: true }
  );

  return {
    route,
    cardDetails,
    loading,
    error,
    monsterStats,
  };
}
