<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PackCardPool from "../components/PackCardPool.vue";
import PurchasePackModal from "../components/PurchasePackModal.vue";
import PackCardReveal from "../components/PackCardReveal.vue";
import "../styles/pack-details.css";

interface PoolCard {
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

interface Pack {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  price: number;
  restricted: boolean;
  card_pool: PoolCard[];
}

const route = useRoute();

const pack = ref<Pack | null>(null);
const loading = ref(true);
const error = ref("");

const showPurchaseModal = ref(false);

function openPurchaseModal() {
  if (!pack.value) return;

  showPurchaseModal.value = true;
}

function closePurchaseModal() {
  showPurchaseModal.value = false;
}

function handlePurchase(remainingDuelPoints: number) {
  console.log(
    "Pack purchased! Remaining Duel Points:",
    remainingDuelPoints
  );
}

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

          <button
            type="button"
            @click="openPurchaseModal"
          >
            Purchase Pack
          </button>
        </div>
        </div>
    </section>

    <section v-if="hasPulled || pullError" class="test-results">
      <div class="results-header">
        <h2>Test Pack Results</h2>
      </div>

      <p v-if="pullError" class="error">
        {{ pullError }}
      </p>

      <PackCardReveal
        v-else
        :cards="pulledCards"
      />
    </section>

    <PackCardPool
        v-if="pack"
        :cards="pack.card_pool"
      />

    <PurchasePackModal
      v-if="pack && showPurchaseModal"
      :pack-id="pack.id"
      :pack-name="pack.name"
      :pack-price="pack.price"
      :pack-image="pack.image_path"
      @close="closePurchaseModal"
      @purchased="handlePurchase"
    />
  </main>
</template>