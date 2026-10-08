<script setup lang="ts">
    import { rarities, type CardSlot } from "../../types/pack";

    defineProps<{
        currentSlot: CardSlot;
        cardSlots: CardSlot[];
    }>();

    const emit = defineEmits<{
        (event: "addConditionalRule"): void;
        (event: "removeConditionalRule", ruleId: string): void;
    }>();
</script>

<template>
  <div class="conditional-rules">
    <h3>Conditional Rarity Rules</h3>

    <p>
      Override this slot's probabilities based on
      the rarity pulled by another card slot.
    </p>

    <div
      v-for="rule in currentSlot.conditions"
      :key="rule.id"
      class="conditional-rule">
      <label>Depends on Card</label>

      <select v-model.number="rule.dependsOnSlot">
        <option
          v-for="slot in cardSlots.filter(
            slot => slot.position !== currentSlot.position
          )"
          :key="slot.position"
          :value="slot.position">
          Card {{ slot.position }}
        </option>
      </select>

      <h4>Trigger When Rarity Is:</h4>

      <div
        v-for="rarity in rarities"
        :key="rarity"
        class="trigger-row">
        <label>
          <input
            v-model="rule.triggerRarities"
            type="checkbox"
            :value="rarity"/>
          {{ rarity }}
        </label>
      </div>

      <h4>Override Probabilities</h4>

      <div
        v-for="rarity in rarities"
        :key="rarity"
        class="rarity-row">
        <label>{{ rarity }}</label>

        <input
          v-model.number="rule.probabilities[rarity]"
          type="number"
          min="0"
          max="100"
          step="0.01"/>

        <span>%</span>
      </div>

      <button
        type="button"
        class="remove-rule-button"
        @click="emit('removeConditionalRule', rule.id)">
        Remove Rule
      </button>
    </div>

    <button
      type="button"
      class="copy-button"
      @click="emit('addConditionalRule')">
      Add Conditional Rule
    </button>
  </div>
</template>