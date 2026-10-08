<script setup lang="ts">
    import { computed } from "vue";
    import { rarities, type CardSlot } from "../../types/pack";

    const props = defineProps<{
        cardSlots: CardSlot[];
        selectedSlot: number;
        totalProbability: number;
    }>();

    const copyStart = defineModel<number>("copyStart", {
        required: true
    });

    const copyEnd = defineModel<number>("copyEnd", {
        required: true
    });

    const emit = defineEmits<{
        (event: "selectSlot", slot: number): void;
        (event: "copySlotSettings"): void;
    }>();

    const currentSlot = computed(() =>
        props.cardSlots.find(
          slot => slot.position === props.selectedSlot
        )
    );
</script>

<template>
  <section class="pack-section">
    <h2>Card Slots</h2>

    <p>Select a card slot to configure its rarity.</p>

    <div class="slot-grid">
      <button
        v-for="slot in cardSlots"
        :key="slot.position"
        class="slot-button"
        :class="{ active: selectedSlot === slot.position }"
        @click="emit('selectSlot', slot.position)">
        Card {{ slot.position }}
      </button>
    </div>
  </section>

  <section v-if="currentSlot" class="pack-section">
    <h2>Card {{ selectedSlot }} Settings</h2>

    <p>Set the probability of each rarity appearing in this slot.</p>

    <div
      v-for="rarity in rarities"
      :key="rarity"
      class="rarity-row"
    >
      <label>{{ rarity }}</label>

      <input
        v-model.number="currentSlot.probabilities[rarity]"
        type="number"
        min="0"
        max="100"
        step="0.01"/>

      <span>%</span>
    </div>

    <div class="probability-total">
      <strong>Total Probability:</strong>

      <span
        :class="{
          valid: Math.abs(totalProbability - 100) < 0.000001,
          invalid: Math.abs(totalProbability - 100) >= 0.000001
        }">
        {{ totalProbability.toFixed(2) }}%
      </span>
    </div>

    <p
      v-if="Math.abs(totalProbability - 100) >= 0.000001"
      class="warning">
      The total probability must equal 100%.
    </p>

    <!-- ConditionalRules.vue will be inserted here later -->
    <slot name="conditional-rules" />
  </section>

  <section class="pack-section">
    <h2>Copy Slot Settings</h2>

    <p>
      Copy Card {{ selectedSlot }}'s rarity probabilities
      to another slot or range of slots.
    </p>

    <div class="copy-range">
      <div>
        <label>Starting Slot</label>
        <input
          v-model.number="copyStart"
          type="number"
          min="1"
          :max="cardSlots.length"/>
      </div>

      <div>
        <label>Ending Slot</label>
        <input
          v-model.number="copyEnd"
          type="number"
          min="1"
          :max="cardSlots.length"/>
      </div>
    </div>

    <button
      type="button"
      class="copy-button"
      @click="emit('copySlotSettings')"
    >
      Copy Settings
    </button>
  </section>
</template>