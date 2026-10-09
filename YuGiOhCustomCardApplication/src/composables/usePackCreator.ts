import { ref } from "vue";
import { useCardPools } from "./useCardPools";
import { useCardSlots } from "./useCardSlots";
import { simulatePack } from "../utils/packSimulation";
import type { PulledCard } from "../types/pack";
import { createPack } from "../services/packService";

export function usePackCreator() {
  // Pack information
  const packName = ref("");
  const packDescription = ref("");
  const packPrice = ref(0);
  const packRestricted = ref(false);

  // Card pools
  const cardPoolsState = useCardPools();

  // Card slots and conditional rules
  const cardSlotsState = useCardSlots();

  // Convert frontend pack data into the backend format
  function buildPackPayload(imagePath: string | null = null) {
    const card_pool = Object.entries(cardPoolsState.cardPools.value)
      .flatMap(([rarity, cards]) =>
        cards.map(card => ({
          card_id: card.id,
          rarity
        }))
      );

    const slots = cardSlotsState.cardSlots.value.map(slot => ({
      slot_number: slot.position,

      probabilities: Object.entries(slot.probabilities)
        .map(([rarity, probability]) => ({
          rarity,
          probability
        })),

      conditions: slot.conditions.map(rule => ({
        condition_slot_number: rule.dependsOnSlot,
        condition_rarity: rule.conditionRarity,
        result_rarity: rule.resultRarity
      }))
    }));

    return {
      name: packName.value,
      description: packDescription.value,
      image_path: imagePath,
      price: packPrice.value,
      restricted: packRestricted.value,
      card_pool,
      slots
    };
  }

  // Pack saving
  const savingPack = ref(false);
  const saveError = ref("");
  const saveSuccess = ref("");

  async function savePack(imagePath: string | null = null) {
    if (savingPack.value) return;

    savingPack.value = true;
    saveError.value = "";
    saveSuccess.value = "";

    try {
      const payload = buildPackPayload(imagePath);

      const createdPack = await createPack(payload);

      saveSuccess.value =
        `Pack "${createdPack.name}" created successfully!`;

      console.log("Created pack:", createdPack);
    } catch (err) {
      console.error("Error saving pack:", err);

      saveError.value =
        err instanceof Error
          ? err.message
          : "Failed to save pack.";
    } finally {
      savingPack.value = false;
    }
  }

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
    packRestricted,

    // Card pools
    ...cardPoolsState,

    // Card slots
    ...cardSlotsState,

    // Simulator
    pulledCards,
    simulationError,
    testOpenPack,

    // Backend payload
    buildPackPayload,

    // Pack saving
    savingPack,
    saveError,
    saveSuccess,
    savePack
  };
}