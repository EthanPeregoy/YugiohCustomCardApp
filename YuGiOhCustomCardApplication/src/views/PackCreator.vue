<script setup lang="ts">
import { usePackCreator } from "../composables/usePackCreator";

import PackInformation from "../components/packCreator/PackInformation.vue";
import CardSlotSettings from "../components/packCreator/CardSlotSettings.vue";
import ConditionalRules from "../components/packCreator/ConditionalRules.vue";
import CardPoolManager from "../components/packCreator/CardPoolManager.vue";
import PackSimulator from "../components/packCreator/PackSimulator.vue";
import PackArtworkEditor from "../components/packCreator/PackArtworkEditor.vue";
import { ref } from "vue";
import { uploadPackArtwork } from "../services/packService";

import "../styles/pack-creator.css";



const artworkEditor = ref<InstanceType<
  typeof PackArtworkEditor
> | null>(null);

const uploadingArtwork = ref(false);

const {
  // Pack information
  packName,
  packDescription,
  packPrice,
  packRestricted,

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
  testOpenPack,

  // Pack saving
  savingPack,
  saveError,
  saveSuccess,
  savePack: savePackData
} = usePackCreator();

async function savePackWithArtwork() {
  if (uploadingArtwork.value || savingPack.value) return;

  uploadingArtwork.value = true;
  saveError.value = "";
  saveSuccess.value = "";

  try {
    if (!artworkEditor.value) {
      throw new Error("Artwork editor is unavailable.");
    }

    const artworkFile = await artworkEditor.value.getArtworkFile();

    const uploadResult = await uploadPackArtwork(artworkFile);

    await savePackData(uploadResult.image_path);
  } catch (error) {
    console.error("Failed to save pack:", error);

    saveError.value =
      error instanceof Error
        ? error.message
        : "Failed to save pack.";
  } finally {
    uploadingArtwork.value = false;
  }
}
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
        v-model:pack-restricted="packRestricted"
        v-model:cards-per-pack="cardsPerPack"
        @update-card-count="updateCardCount"
      />

      <PackArtworkEditor 
        v-model:pack-name="packName" 
        ref="artworkEditor"
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

      <div class="pack-save-section">
        <button
          type="button"
          class="save-pack-button"
          :disabled="uploadingArtwork || savingPack"
          @click="savePackWithArtwork"
        >
          {{ savingPack ? "Saving Pack..." : "Save Pack" }}
        </button>

        <p v-if="saveError" class="save-error">
          {{ saveError }}
        </p>

        <p v-if="saveSuccess" class="save-success">
          {{ saveSuccess }}
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.pack-save-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px;
}

.save-pack-button {
  width: 100%;
  max-width: 525px;
  min-height: 96px;

  padding: 20px 32px;

  font-family: Georgia, "Times New Roman", serif;
  font-size: 2rem;
  font-weight: bold;
  font-variant: small-caps;

  color: #f5eaff;
  background: rgba(8, 5, 20, 0.92);

  border: 3px solid #b58aff;
  border-radius: 16px;

  box-shadow:
    0 0 12px rgba(181, 138, 255, 0.6),
    inset 0 0 12px rgba(181, 138, 255, 0.1);

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.save-pack-button:hover:not(:disabled) {
  background: rgba(35, 18, 65, 0.95);

  box-shadow:
    0 0 20px rgba(181, 138, 255, 0.9),
    0 0 35px rgba(145, 85, 255, 0.35);

  transform: translateY(-2px);
}

.save-pack-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-error {
  color: #ff6b6b;
}

.save-success {
  color: #65d68a;
}

</style>