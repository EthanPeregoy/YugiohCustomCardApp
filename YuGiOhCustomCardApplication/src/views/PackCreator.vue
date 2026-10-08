<script setup lang="ts">
import { usePackCreator } from "../composables/usePackCreator";

import PackInformation from "../components/packCreator/PackInformation.vue";
import CardSlotSettings from "../components/packCreator/CardSlotSettings.vue";
import ConditionalRules from "../components/packCreator/ConditionalRules.vue";
import CardPoolManager from "../components/packCreator/CardPoolManager.vue";
import PackSimulator from "../components/packCreator/PackSimulator.vue";

import "../styles/pack-creator.css";

const {
  // Pack information
  packName,
  packDescription,
  packPrice,

  // Card slots
  cardsPerPack,
  cardSlots,
  selectedSlot,
  currentSlot,
  totalProbability,
  copyStart,
  copyEnd,
  selectSlot,
  updateCardCount,
  copySlotSettings,
  addConditionalRule,
  removeConditionalRule,

  // Card pools
  cardPools,
  cardSearch,
  selectedRarity,
  filteredCards,
  addCardToPool,
  removeCardFromPool,

  // Simulator
  pulledCards,
  simulationError,
  testOpenPack
} = usePackCreator();
</script>

<template>
  <main class="pack-creator-page">
    <div class="pack-creator">
      <h1>Create New Pack</h1>

      <!-- Pack Information -->
      <PackInformation
        v-model:pack-name="packName"
        v-model:pack-description="packDescription"
        v-model:pack-price="packPrice"
        v-model:cards-per-pack="cardsPerPack"
        @update-card-count="updateCardCount"
      />

      <!-- Card Slot Settings -->
      <CardSlotSettings
        :card-slots="cardSlots"
        :selected-slot="selectedSlot"
        :total-probability="totalProbability"
        v-model:copy-start="copyStart"
        v-model:copy-end="copyEnd"
        @select-slot="selectSlot"
        @copy-slot-settings="copySlotSettings"
      >
        <template #conditional-rules>
          <ConditionalRules
            v-if="currentSlot"
            :current-slot="currentSlot"
            :card-slots="cardSlots"
            @add-conditional-rule="addConditionalRule"
            @remove-conditional-rule="removeConditionalRule"
          />
        </template>
      </CardSlotSettings>

      <!-- Rarity Card Pools -->
      <CardPoolManager
        :card-pools="cardPools"
        :filtered-cards="filteredCards"
        v-model:card-search="cardSearch"
        v-model:selected-rarity="selectedRarity"
        @add-card-to-pool="addCardToPool"
        @remove-card-from-pool="removeCardFromPool"
      />

      <!-- Pack Simulator -->
      <PackSimulator
        :pulled-cards="pulledCards"
        :simulation-error="simulationError"
        @test-open-pack="testOpenPack"
      />
    </div>
  </main>
</template>