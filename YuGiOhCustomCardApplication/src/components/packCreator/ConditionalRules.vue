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
      Guarantee a specific rarity for this slot based on
      the rarity pulled by another card slot.
    </p>

    <div
      v-for="rule in currentSlot.conditions"
      :key="rule.id"
      class="conditional-rule"
    >
      <label>Depends on Card</label>

      <select v-model.number="rule.dependsOnSlot">
        <option
          v-for="slot in cardSlots.filter(
            slot => slot.position !== currentSlot.position
          )"
          :key="slot.position"
          :value="slot.position"
        >
          Card {{ slot.position }}
        </option>
      </select>

      <label>Trigger When Rarity Is:</label>

      <select v-model="rule.conditionRarity">
        <option
          v-for="rarity in rarities"
          :key="rarity"
          :value="rarity"
        >
          {{ rarity }}
        </option>
      </select>

      <label>Guaranteed Resulting Rarity:</label>

      <select v-model="rule.resultRarity">
        <option
          v-for="rarity in rarities"
          :key="rarity"
          :value="rarity"
        >
          {{ rarity }}
        </option>
      </select>

      <button
        type="button"
        class="remove-rule-button"
        @click="emit('removeConditionalRule', rule.id)"
      >
        Remove Rule
      </button>
    </div>

    <button
      type="button"
      class="copy-button"
      @click="emit('addConditionalRule')"
    >
      Add Conditional Rule
    </button>
  </div>
</template>