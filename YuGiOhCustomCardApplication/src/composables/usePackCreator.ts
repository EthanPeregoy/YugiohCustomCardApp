import { ref } from "vue";
import { useCardPools } from "./useCardPools";
import { useCardSlots } from "./useCardSlots";
import { simulatePack } from "../utils/packSimulation";
import type { PulledCard } from "../types/pack";

export function usePackCreator() {
  // Pack information
  const packName = ref("");
  const packDescription = ref("");
  const packPrice = ref(0);

  // Card pools
  const cardPoolsState = useCardPools();

  // Card slots and conditional rules
  const cardSlotsState = useCardSlots();

  // Pack simulator
  const pulledCards = ref<PulledCard[]>([]);
  const simulationError = ref("");

  function testOpenPack() {
    simulationError.value = "";
    pulledCards.value = [];

    try {
      pulledCards.value = simulatePack(
        cardSlotsState.cardSlots.value,
        cardPoolsState.cardPools.value
      );
    } catch (err) {
      simulationError.value =
        err instanceof Error
          ? err.message
          : "Could not simulate pack.";
    }
  }

  return {
    // Pack information
    packName,
    packDescription,
    packPrice,

    // Card pools
    ...cardPoolsState,

    // Card slots
    ...cardSlotsState,

    // Simulator
    pulledCards,
    simulationError,
    testOpenPack
  };
}