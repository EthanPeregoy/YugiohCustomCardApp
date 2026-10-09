<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

interface Pack {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  price: number;
  restricted: boolean;
}

const route = useRoute();

const pack = ref<Pack | null>(null);
const loading = ref(true);
const error = ref("");

interface PulledCard {
  slot_number: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

const pulledCards = ref<PulledCard[]>([]);
const pulling = ref(false);
const pullError = ref("");
const hasPulled = ref(false);

const revealedCards = ref<number[]>([]);

function revealCard(index: number) {
  if (!revealedCards.value.includes(index)) {
    revealedCards.value.push(index);
  }
}

function revealAllCards() {
  revealedCards.value = pulledCards.value.map((_, index) => index);
}

async function loadPack() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/packs/${route.params.id}`,
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load pack");
    }

    pack.value = await response.json();

  } catch (err) {
    console.error(err);
    error.value = "Unable to load this pack.";
  } finally {
    loading.value = false;
  }
}

async function testPull() {
  if (!pack.value || pulling.value) return;

  pulling.value = true;
  pullError.value = "";
  pulledCards.value = [];
  hasPulled.value = false;
  revealedCards.value = [];
  
  try {
    const response = await fetch(
      `http://localhost:3000/api/packs/${pack.value.id}/test-open`,
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate test pack");
    }

    const data = await response.json();

    pulledCards.value = data.cards;
    hasPulled.value = true;

  } catch (err) {
    console.error(err);
    pullError.value = "Unable to generate a test pack.";
  } finally {
    pulling.value = false;
  }
}

onMounted(loadPack);
</script>

<template>
  <main class="pack-details-page">
    <h1>Pack Details</h1>

    <p v-if="loading" class="status-message">
      Loading pack...
    </p>

    <p v-else-if="error" class="status-message error">
      {{ error }}
    </p>

    <section v-else-if="pack" class="pack-information">
      <div class="pack-artwork">
        <img
          v-if="pack.image_path"
          :src="`http://localhost:3000${pack.image_path}`"
          :alt="pack.name"
        />

        <div v-else class="artwork-placeholder">
          No Artwork
        </div>
      </div>

      <div class="pack-description-panel">
        <h2>{{ pack.name }}</h2>

        <span
          v-if="pack.restricted"
          class="restricted-badge"
        >
          Restricted Pack
        </span>

        <p class="description">
          {{ pack.description }}
        </p>

        <div class="pack-price">
          <span>Pack Price</span>
          <strong>{{ pack.price.toLocaleString() }} DP</strong>
        </div>

        <div class="pack-actions">
          <button
            :disabled="pulling"
            @click="testPull">
            {{ pulling ? "Opening..." : "Test Pull" }}
          </button>

          <button disabled>
            Purchase Pack
          </button>
        </div>
        </div>
    </section>

    <section v-if="hasPulled || pullError" class="test-results">
        <div class="results-header">
            <h2>Test Pack Results</h2>

            <button
            v-if="hasPulled"
            class="reveal-all-button"
            @click="revealAllCards"
            >
            Reveal All
            </button>
        </div>

        <p v-if="pullError" class="error">
            {{ pullError }}
        </p>

        <div v-else class="pulled-card-grid">
            <button
            v-for="(card, index) in pulledCards"
            :key="index"
            type="button"
            class="flip-card"
            :aria-label="revealedCards.includes(index) ? `Card ${index + 1}: ${card.rarity}` : `Reveal card ${index + 1}`"
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
    </section>
  </main>
</template>

<style scoped>
.pack-details-page {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  padding: 30px 30px 70px;
  box-sizing: border-box;
}

.pack-details-page h1 {
  margin-bottom: 40px;
}

.pack-information {
  display: grid;
  grid-template-columns: minmax(250px, 380px) 1fr;
  gap: 35px;

  padding: 30px;

  background: linear-gradient(
    135deg,
    rgba(13, 5, 27, 0.97),
    rgba(40, 24, 65, 0.96)
  );

  border: 1px solid #8054ad;
  border-radius: 14px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.pack-artwork {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 400px;
  padding: 20px;

  background: rgba(8, 5, 17, 0.7);
  border: 1px solid #51316e;
  border-radius: 10px;
}

.pack-artwork img {
  max-width: 100%;
  max-height: 430px;
  object-fit: contain;
}

.artwork-placeholder {
  color: #b7a4c9;
  font-style: italic;
}

.pack-description-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.pack-description-panel h2 {
  margin: 0 0 18px;
  color: #f0dfff;
  font-family: "Cinzel", serif;
  font-size: 2rem;
}

.restricted-badge {
  padding: 7px 13px;
  background: #92383e;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
}

.description {
  margin: 25px 0;
  color: #ded0eb;
  font-size: 1.05rem;
  line-height: 1.7;
  white-space: pre-wrap;
}

.pack-price {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  margin-top: auto;
  padding: 20px 0;

  border-top: 1px solid #51316e;
  color: #d9c9e9;
}

.pack-price strong {
  color: #f4cf65;
  font-size: 1.5rem;
}

.pack-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
}

.pack-actions button {
  flex: 1;
  min-width: 140px;
  padding: 13px 20px;

  background: #644198;
  border: 1px solid #986dc6;
  border-radius: 8px;

  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.pack-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-message {
  text-align: center;
  padding: 50px 0;
  color: #ded0eb;
}

.error {
  color: #ff8888;
}

@media (max-width: 800px) {
  .pack-information {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .pack-artwork {
    min-height: 300px;
  }

  .pack-details-page {
    padding: 20px 15px 50px;
  }
}

.test-results {
  margin-top: 35px;
  padding: 30px;

  background: linear-gradient(
    135deg,
    rgba(13, 5, 27, 0.97),
    rgba(40, 24, 65, 0.96)
  );

  border: 1px solid #8054ad;
  border-radius: 14px;
}

.test-results h2 {
  margin: 0 0 25px;
  color: #f0dfff;
  font-family: "Cinzel", serif;
}

.pulled-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.results-header h2 {
  margin: 0;
}

.reveal-all-button {
  padding: 10px 18px;
  background: #644198;
  color: white;
  border: 1px solid #986dc6;
  border-radius: 8px;
  cursor: pointer;
}

.reveal-all-button:hover {
  background: #8054ad;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 300px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.65s ease;
}

.flip-card-inner.revealed {
  transform: rotateY(180deg);
}

.flip-card-back,
.flip-card-front {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  box-sizing: border-box;

  border: 2px solid #8054ad;
  border-radius: 10px;

  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-back {
  padding: 0;
  overflow: hidden;
  background: #130a21;
  border: none;
}

.card-back-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.card-position {
  color: #f0dfff;
  font-size: 0.85rem;
}

.flip-card-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  padding: 8px;

  background: linear-gradient(145deg, #28163e, #130a21);
  color: #f0e6fa;

  transform: rotateY(180deg);
}

.revealed-card-image {
  width: 100%;
  min-height: 0;
  flex: 1;
  object-fit: contain;
  border-radius: 4px;
}

.revealed-card-placeholder {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: #b9a3d0;
}

.revealed-card-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.revealed-card-name {
  max-width: 100%;
  color: #f0e6fa;
  font-size: 0.78rem;
  line-height: 1.3;
  text-align: center;
  overflow-wrap: anywhere;
}

.card-rarity {
  color: #f4cf65;
  font-size: 0.8rem;
  font-weight: bold;
}

.flip-card-front strong {
  font-size: 1.05rem;
}

.flip-card:hover .flip-card-inner:not(.revealed) {
  filter: brightness(1.2);
}

@media (prefers-reduced-motion: reduce) {
  .flip-card-inner {
    transition: none;
  }
}

.card-number {
  color: #b9a3d0;
  font-size: 0.85rem;
}
p
.card-rarity {
  color: #f4cf65;
  font-weight: bold;
}
</style>