<script setup lang="ts">
import { ref, watch } from "vue";
import "../styles/pack-details.css";

interface RevealCard {
  slot_number: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

const props = defineProps<{
  cards: RevealCard[];
}>();

const revealedCards = ref<number[]>([]);

function revealCard(index: number) {
  if (!revealedCards.value.includes(index)) {
    revealedCards.value.push(index);
  }
}

function revealAllCards() {
  revealedCards.value = props.cards.map((_, index) => index);
}

watch(
  () => props.cards,
  () => {
    revealedCards.value = [];
  }
);
</script>

<template>
  <div class="pack-card-reveal">
    <div class="reveal-header">
      <button
        type="button"
        class="reveal-all-button"
        :disabled="cards.length === 0"
        @click="revealAllCards"
      >
        Reveal All
      </button>
    </div>

    <div class="pulled-card-grid">
      <button
        v-for="(card, index) in cards"
        :key="index"
        type="button"
        class="flip-card"
        :aria-label="
          revealedCards.includes(index)
            ? `Card ${index + 1}: ${card.card_name}, ${card.rarity}`
            : `Reveal card ${index + 1}`
        "
        @click="revealCard(index)"
      >
        <div
          class="flip-card-inner"
          :class="{ revealed: revealedCards.includes(index) }"
        >
          <div class="flip-card-back">
            <img
              src="http://localhost:3000/card-assets/YugiohCardBack.jpg"
              alt="Yu-Gi-Oh Card Back"
              class="card-back-image"
            />
          </div>

          <div class="flip-card-front">
            <img
              v-if="card.image_path"
              :src="card.image_path"
              :alt="card.card_name"
              class="revealed-card-image"
            />

            <div v-else class="revealed-card-placeholder">
              No Artwork
            </div>

            <div class="revealed-card-info">
              <strong class="revealed-card-name">
                {{ card.card_name }}
              </strong>

              <span class="card-rarity">
                {{ card.rarity }}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>