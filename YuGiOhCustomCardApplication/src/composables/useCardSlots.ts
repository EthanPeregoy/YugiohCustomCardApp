import { ref, computed } from "vue";
import { rarities, type CardSlot } from "../types/pack";

export function useCardSlots() {
  const cardsPerPack = ref(5);

  const selectedSlot = ref(1);
  const copyStart = ref(1);
  const copyEnd = ref(5);

  function createSlot(position: number): CardSlot {
    return {
      position,
      probabilities: {
        "Common": 100,
        "Rare": 0,
        "Super Rare": 0,
        "Ultra Rare": 0,
        "Secret Rare": 0
      },
      conditions: []
    };
  }

  const cardSlots = ref<CardSlot[]>(
    Array.from(
      { length: cardsPerPack.value },
      (_, index) => createSlot(index + 1)
    )
  );

  const currentSlot = computed(() => {
    return cardSlots.value.find(
      slot => slot.position === selectedSlot.value
    );
  });

  const totalProbability = computed(() => {
    if (!currentSlot.value) return 0;

    return Object.values(currentSlot.value.probabilities)
      .reduce((sum, value) => sum + Number(value || 0), 0);
  });

  function selectSlot(slot: number) {
    selectedSlot.value = slot;
  }

  function updateCardCount() {
    cardsPerPack.value = Math.max(
      1,
      Math.min(100, Math.trunc(cardsPerPack.value) || 1)
    );

    const currentCount = cardSlots.value.length;
    const newCount = cardsPerPack.value;

    if (newCount > currentCount) {
      for (let i = currentCount + 1; i <= newCount; i++) {
        cardSlots.value.push(createSlot(i));
      }
    } else if (newCount < currentCount) {
      cardSlots.value.splice(newCount);
    }

    if (selectedSlot.value > newCount) {
      selectedSlot.value = newCount;
    }
  }

  function copySlotSettings() {
    const sourceSlot = currentSlot.value;

    if (!sourceSlot) return;

    const start = copyStart.value;
    const end = copyEnd.value;

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end > cardSlots.value.length ||
      start > end
    ) {
      alert("Please enter a valid slot range.");
      return;
    }

    for (let i = start; i <= end; i++) {
      const targetSlot = cardSlots.value.find(
        slot => slot.position === i
      );

      if (targetSlot) {
        targetSlot.probabilities = {
          ...sourceSlot.probabilities
        };
      }
    }
  }

  function addConditionalRule() {
    const slot = currentSlot.value;
    if (!slot) return;

    const otherSlot = cardSlots.value.find(
      candidate => candidate.position !== slot.position
    );

    if (!otherSlot) {
      alert("A conditional rule requires at least two card slots.");
      return;
    }

    slot.conditions.push({
      id: crypto.randomUUID(),
      dependsOnSlot: otherSlot.position,
      conditionRarity: "Super Rare",
      resultRarity: "Rare"
    });
  }

  function removeConditionalRule(ruleId: string) {
    const slot = currentSlot.value;

    if (!slot) return;

    slot.conditions = slot.conditions.filter(
      rule => rule.id !== ruleId
    );
  }

  return {
    cardsPerPack,
    selectedSlot,
    copyStart,
    copyEnd,
    cardSlots,
    currentSlot,
    totalProbability,
    selectSlot,
    updateCardCount,
    copySlotSettings,
    addConditionalRule,
    removeConditionalRule
  };
}