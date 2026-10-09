<script setup lang="ts">
import { computed, ref } from "vue";
import CardDetailsModal from "./CardDetailsModal.vue";

interface PoolCard {
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

const props = defineProps<{
  cards: PoolCard[];
}>();

const selectedCardId = ref<number | null>(null);

const rarityOrder = [
  "Common",
  "Rare",
  "Super Rare",
  "Ultra Rare",
  "Secret Rare"
];

const groupedCards = computed(() => {
  const groups = new Map<string, PoolCard[]>();

  for (const card of props.cards) {
    if (!groups.has(card.rarity)) {
      groups.set(card.rarity, []);
    }

    groups.get(card.rarity)!.push(card);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const aIndex = rarityOrder.indexOf(a);
      const bIndex = rarityOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    })
    .map(([rarity, cards]) => ({
      rarity,
      cards
    }));
});

function openCard(cardId: number) {
  selectedCardId.value = cardId;
}

function closeCard() {
  selectedCardId.value = null;
}
</script>

<template>
  <section class="pack-card-pool">
    <h2>Pack Card Pool</h2>

    <p class="pool-description">
      Select a card to view its information.
    </p>

    <p v-if="cards.length === 0" class="empty-pool">
      This pack has no cards assigned.
    </p>

    <div
      v-for="group in groupedCards"
      :key="group.rarity"
      class="rarity-group"
    >
      <div class="rarity-header">
        <h3>{{ group.rarity }}</h3>
        <span>{{ group.cards.length }} Cards</span>
      </div>

      <div class="pool-card-grid">
        <button
          v-for="card in group.cards"
          :key="`${card.card_id}-${card.rarity}`"
          type="button"
          class="pool-card"
          :aria-label="`View ${card.card_name} (${card.rarity})`"
          @click="openCard(card.card_id)"
        >
          <img
            v-if="card.image_path"
            :src="card.image_path"
            :alt="card.card_name"
            loading="lazy"
          />

          <div v-else class="card-placeholder">
            No Artwork
          </div>
        </button>
      </div>
    </div>

    <CardDetailsModal
      :card-id="selectedCardId"
      @close="closeCard"
    />
  </section>
</template>

<style scoped>
.pack-card-pool {
  margin-top: 35px;
  padding: 25px;

  background: linear-gradient(
    135deg,
    rgba(13, 5, 27, 0.97),
    rgba(40, 24, 65, 0.96)
  );

  border: 1px solid #8054ad;
  border-radius: 14px;
}

.pack-card-pool h2 {
  margin: 0 0 10px;
  color: #f0dfff;
  font-family: "Cinzel", serif;
}

.pool-description {
  color: #b9a3d0;
  margin-bottom: 25px;
}

.rarity-group {
  margin-bottom: 25px;
}

.rarity-group:last-of-type {
  margin-bottom: 0;
}

.rarity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 10px;

  border-bottom: 1px solid rgba(170, 110, 255, 0.3);
}

.rarity-header h3 {
  margin: 0;
  color: #d7b8ff;
  font-size: 1.15rem;
}

.rarity-header span {
  color: #b9a3d0;
  font-size: 0.85rem;
}

.pool-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 110px));
  gap: 12px;
}

.pool-card {
  display: block;
  width: 100%;
  padding: 0;

  background: transparent;
  border: none;
  border-radius: 5px;

  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.pool-card:hover {
  transform: translateY(-4px);
  filter: brightness(1.2);
}

.pool-card:focus-visible {
  outline: 3px solid #d7b8ff;
  outline-offset: 3px;
}

.pool-card img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;

  aspect-ratio: 0.69;

  background: #28163e;
  border: 1px solid #8054ad;
  border-radius: 5px;

  color: #b9a3d0;
  font-size: 0.75rem;
  text-align: center;
}

.empty-pool {
  color: #b9a3d0;
}

@media (max-width: 600px) {
  .pack-card-pool {
    padding: 18px;
  }

  .pool-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(75px, 95px));
    gap: 10px;
  }
}
</style>