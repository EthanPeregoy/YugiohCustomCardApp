<script setup lang="ts">
  import { usePackCreator } from "./composables/usePackCreator.ts";
  import PackInformation from "./components/PackInformation.vue";
  import CardSlotSettings from "./components/CardSlotSettings.vue";
  import ConditionalRules from "./components/ConditionalRules.vue";
  import CardPoolManager from "./components/CardPoolManager.vue";
  import PackSimulator from "./components/PackSimulator.vue";
  import PackArtworkEditor from "./components/PackArtworkEditor.vue";
  import { uploadPackArtwork, getPackDetails } from "../services/packService.ts";
  import { ref, computed, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import "./styles/pack-creator.css";

  const artworkEditor = ref<InstanceType<
    typeof PackArtworkEditor
  > | null>(null);

  const uploadingArtwork = ref(false);

  const route = useRoute();
  const router = useRouter();

  const editingPackId = computed(() => {
    const id = Number(route.params.id);

    return Number.isSafeInteger(id) && id > 0
      ? id
      : null;
  });

  const isEditMode = computed(() => editingPackId.value !== null);

  const loadingExistingPack = ref(false);
  const existingArtworkPath = ref<string | null>(null);

  const {
    // Pack information
    packName,
    packDescription,
    packPrice,
    packRestricted,
    packPublished,

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
    savePack: savePackData,

    // Existing pack details
    loadExistingPack
  } = usePackCreator();

  onMounted(async () => {
    if (!isEditMode.value || editingPackId.value === null) return;

    loadingExistingPack.value = true;

    try {
      const existingPack = await getPackDetails(editingPackId.value);

      loadExistingPack(existingPack);
      existingArtworkPath.value = existingPack.image_path;
    } catch (error) {
      console.error("Failed to load pack for editing:", error);

      saveError.value =
        error instanceof Error
          ? error.message
          : "Failed to load pack.";
    } finally {
      loadingExistingPack.value = false;
    }
  });

  async function savePackWithArtwork() {
    if (
      uploadingArtwork.value ||
      savingPack.value ||
      loadingExistingPack.value
    ) return;

    uploadingArtwork.value = true;
    saveError.value = "";
    saveSuccess.value = "";

    try {
      if (!artworkEditor.value) {
        throw new Error("Artwork editor is unavailable.");
      }

      let imagePath: string | null = existingArtworkPath.value;

      if (
        !isEditMode.value ||
        artworkEditor.value.hasNewArtwork()
      ) {
        const artworkFile = await artworkEditor.value.getArtworkFile();
        const uploadResult = await uploadPackArtwork(artworkFile);

        imagePath = uploadResult.image_path;
      }

      const saved = await savePackData(
        imagePath,
        editingPackId.value
      );

      if (saved && isEditMode.value && editingPackId.value !== null) {
        await router.push(`/packs/${editingPackId.value}`);
      }
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
      <h1>{{ isEditMode ? "Edit Pack" : "Create New Pack" }}</h1>

      <!-- Pack Information -->
      <PackInformation
        v-model:pack-name="packName"
        v-model:pack-description="packDescription"
        v-model:pack-price="packPrice"
        v-model:pack-restricted="packRestricted"
        v-model:pack-published="packPublished"
        v-model:cards-per-pack="cardsPerPack"
        @update-card-count="updateCardCount"
      />

      <PackArtworkEditor
        v-model:pack-name="packName"
        :existing-artwork="existingArtworkPath"
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
          :disabled="loadingExistingPack || uploadingArtwork || savingPack"
          @click="savePackWithArtwork"
        >
          {{
            savingPack
              ? "Saving Pack..."
              : isEditMode
                ? "Save Changes"
                : "Save Pack"
          }}
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