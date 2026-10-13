import { ref } from "vue";
import { useCardPools } from "./useCardPools";
import { useCardSlots } from "./useCardSlots";
import { simulatePack } from "../utils/packSimulation";
import type { PulledCard, Rarity, RarityProbabilities } from "../types/pack";
import { Pack, createPack, updatePack } from "../../services/packService";

export function usePackCreator() {
  // Pack information
  const packName = ref("");
  const packDescription = ref("");
  const packPrice = ref(0);
  const packRestricted = ref(false);
  const packPublished = ref(false);

  // Card pools
  const cardPoolsState = useCardPools();

  // Card slots and conditional rules
  const cardSlotsState = useCardSlots();
  
  function loadExistingPack(pack: Pack) {
    // Restore basic information
    packName.value = pack.name;
    packDescription.value = pack.description ?? "";
    packPrice.value = pack.price;
    packRestricted.value = pack.restricted;
    packPublished.value = pack.is_published;

    // Restore card pools
    const pools = cardPoolsState.cardPools.value;

    for (const rarity of Object.keys(pools) as Rarity[]) {
      pools[rarity] = [];
    }

    for (const card of pack.card_pool) {
      const rarity = card.rarity as Rarity;

      if (!pools[rarity]) continue;

      pools[rarity].push({
        id: card.card_id,
        card_name: card.card_name,
        image_path: card.image_path ?? ""
      });
    }

    // Convert database slot IDs into frontend positions
    const slotPositions = new Map(
      pack.slots.map(slot => [slot.id, slot.slot_number])
    );

    cardSlotsState.cardSlots.value = pack.slots.map(slot => {
      const probabilities: RarityProbabilities = {
        "Common": 0,
        "Rare": 0,
        "Super Rare": 0,
        "Ultra Rare": 0,
        "Secret Rare": 0
      };

      for (const entry of slot.probabilities) {
        const rarity = entry.rarity as Rarity;

        if (rarity in probabilities) {
          probabilities[rarity] = Number(entry.probability);
        }
      }

      return {
        position: slot.slot_number,
        probabilities,
        conditions: slot.conditions.map(condition => ({
          id: crypto.randomUUID(),
          dependsOnSlot:
            slotPositions.get(condition.condition_slot_id) ?? 1,
          conditionRarity: condition.condition_rarity as Rarity,
          resultRarity: condition.result_rarity as Rarity
        }))
      };
    });

    // Restore slot controls
    cardSlotsState.cardsPerPack.value =
      cardSlotsState.cardSlots.value.length;

    cardSlotsState.selectedSlot.value = 1;
    cardSlotsState.copyStart.value = 1;
    cardSlotsState.copyEnd.value =
      cardSlotsState.cardsPerPack.value;
  }

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
      is_published: packPublished.value,
      card_pool,
      slots
    };
  }

  // Pack saving
  const savingPack = ref(false);
  const saveError = ref("");
  const saveSuccess = ref("");

  async function savePack(
    imagePath: string | null = null,
    editingPackId: number | null = null
  ): Promise<boolean> {
    if (savingPack.value) return false;

    savingPack.value = true;
    saveError.value = "";
    saveSuccess.value = "";

    try {
      const payload = buildPackPayload(imagePath);

      if (editingPackId !== null) {
        const updatedPack = await updatePack(editingPackId, payload);

        saveSuccess.value =
          `Pack "${updatedPack.name}" updated successfully!`;
      } else {
        const createdPack = await createPack(payload);

        saveSuccess.value =
          `Pack "${createdPack.name}" created successfully!`;
      }

      return true;
    } catch (err) {
      saveError.value =
        err instanceof Error ? err.message : "Failed to save pack.";

      return false;
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
    packPublished,

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
    savePack,

    // Load existing pack
    loadExistingPack
  };
}