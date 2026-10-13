<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  saveDeckCover,
  type DeckCard,
  type DeckCoverSettings
} from "../services/deckService";

const props = defineProps<{
  deckId: number;
  cards: DeckCard[];
  initialSettings: DeckCoverSettings;
}>();

const emit = defineEmits<{
  close: [];
  saved: [settings: DeckCoverSettings];
}>();

const selectedCardId = ref<number | null>(null);
const positionX = ref(50);
const positionY = ref(50);
const zoom = ref(1);
const rotation = ref(0);
const saving = ref(false);
const error = ref("");

const uniqueCards = computed(() => {
  const seen = new Set<number>();

  return props.cards.filter(card => {
    if (seen.has(card.card_id)) return false;
    seen.add(card.card_id);
    return true;
  });
});

const selectedCard = computed(() =>
  uniqueCards.value.find(
    card => card.card_id === selectedCardId.value
  )
);

watch(
  () => props.initialSettings,
  settings => {
    selectedCardId.value = settings.cover_card_id;
    positionX.value = settings.cover_position_x;
    positionY.value = settings.cover_position_y;
    zoom.value = settings.cover_zoom;
    rotation.value = settings.cover_rotation;
  },
  { immediate: true }
);

function selectCard(cardId: number) {
  selectedCardId.value = cardId;
  positionX.value = 50;
  positionY.value = 50;
  zoom.value = 1;
  rotation.value = 0;
}

function resetCover() {
  selectedCardId.value = null;
  positionX.value = 50;
  positionY.value = 50;
  zoom.value = 1;
  rotation.value = 0;
}

const previewStyle = computed(() => ({
  objectPosition: `${positionX.value}% ${positionY.value}%`,
  transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`
}));

const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const initialPosition = ref({ x: 50, y: 50 });

function startDrag(event: PointerEvent) {
  if (!selectedCard.value) return;

  dragging.value = true;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY
  };

  initialPosition.value = {
    x: positionX.value,
    y: positionY.value
  };

  (event.currentTarget as HTMLElement)
    .setPointerCapture(event.pointerId);
}

function moveDrag(event: PointerEvent) {
  if (!dragging.value) return;

  const element = event.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();

  positionX.value = Math.max(
    0,
    Math.min(
      100,
      initialPosition.value.x -
        ((event.clientX - dragStart.value.x) / rect.width) * 100
    )
  );

  positionY.value = Math.max(
    0,
    Math.min(
      100,
      initialPosition.value.y -
        ((event.clientY - dragStart.value.y) / rect.height) * 100
    )
  );
}

function endDrag() {
  dragging.value = false;
}

async function handleSave() {
  saving.value = true;
  error.value = "";

  try {
    const settings = await saveDeckCover(props.deckId, {
      cover_card_id: selectedCardId.value,
      cover_position_x: positionX.value,
      cover_position_y: positionY.value,
      cover_zoom: zoom.value,
      cover_rotation: rotation.value
    });

    emit("saved", settings);
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to save cover";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="deck-cover-overlay" @click.self="emit('close')">
    <div
      class="deck-cover-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Deck Cover"
    >
      <div class="deck-cover-header">
        <h2>Edit Deck Cover</h2>
        <button type="button" @click="emit('close')">✕</button>
      </div>

      <div class="deck-cover-workspace">
        <section class="deck-cover-selection">
          <h3>Select a Card</h3>

          <div class="deck-cover-card-grid">
            <button
              v-for="card in uniqueCards"
              :key="card.card_id"
              type="button"
              class="deck-cover-card-option"
              :class="{
                selected: selectedCardId === card.card_id
              }"
              @click="selectCard(card.card_id)"
            >
              <img
                v-if="card.image_path"
                :src="card.image_path"
                :alt="card.card_name"
              />
              <span v-else>{{ card.card_name }}</span>
            </button>
          </div>

          <p v-if="uniqueCards.length === 0">
            Add cards to your deck to select a cover.
          </p>
        </section>

        <section class="deck-cover-editor">
          <h3>Cover Preview</h3>

          <div
            class="deck-cover-preview"
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="endDrag"
            @pointercancel="endDrag"
            @lostpointercapture="endDrag"
          >
            <img
              v-if="selectedCard?.image_path"
              :src="selectedCard.image_path"
              :alt="selectedCard.card_name"
              :style="previewStyle"
              draggable="false"
            />
            <span v-else class="deck-cover-placeholder">
              ★
            </span>
          </div>

          <p class="deck-cover-hint">
            Drag the artwork to reposition it.
          </p>

          <label>
            Horizontal Position: {{ Math.round(positionX) }}%
            <input
              v-model.number="positionX"
              type="range"
              min="0"
              max="100"
              :disabled="!selectedCard"
            />
          </label>

          <label>
            Vertical Position: {{ Math.round(positionY) }}%
            <input
              v-model.number="positionY"
              type="range"
              min="0"
              max="100"
              :disabled="!selectedCard"
            />
          </label>

          <label>
            Zoom: {{ Number(zoom).toFixed(1) }}x
            <input
              v-model.number="zoom"
              type="range"
              min="1"
              max="5"
              step="0.1"
              :disabled="!selectedCard"
            />
          </label>

          <label>
            Rotation: {{ rotation }}°
            <input
              v-model.number="rotation"
              type="range"
              min="-180"
              max="180"
              step="1"
              :disabled="!selectedCard"
            />
          </label>
        </section>
      </div>

      <p v-if="error" class="deck-cover-error">{{ error }}</p>

      <div class="deck-cover-actions">
        <button type="button" @click="resetCover">
          Default Cover
        </button>
        <button type="button" @click="emit('close')">
          Cancel
        </button>
        <button
          type="button"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? "Saving..." : "Save Cover" }}
        </button>
      </div>
    </div>
  </div>
</template>