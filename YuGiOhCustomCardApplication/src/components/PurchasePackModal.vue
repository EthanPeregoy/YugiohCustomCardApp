<script setup lang="ts">
import { ref, watch } from "vue";
import PackCardReveal from "./PackCardReveal.vue";

interface PurchasedCard {
  slot_number: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

interface PurchaseResponse {
  cards: PurchasedCard[];
  remainingDuelPoints: number;
}

const props = defineProps<{
  packId: number | null;
  packName: string;
  packPrice: number;
  packImage: string | null;
}>();

const emit = defineEmits<{
  close: [];
  purchased: [remainingDuelPoints: number];
}>();

const purchasing = ref(false);
const error = ref("");
const purchasedCards = ref<PurchasedCard[]>([]);
const remainingDuelPoints = ref<number | null>(null);
const purchaseComplete = ref(false);

watch(
  () => props.packId,
  () => {
    error.value = "";
    purchasedCards.value = [];
    remainingDuelPoints.value = null;
    purchaseComplete.value = false;
  }
);

function closeModal() {
  if (purchasing.value) return;

  emit("close");
}

async function confirmPurchase() {
  if (props.packId === null || purchasing.value || purchaseComplete.value) {
    return;
  }

  purchasing.value = true;
  error.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/api/packs/${props.packId}/purchase`,
      {
        method: "POST",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to purchase pack.");
    }

    const result = data as PurchaseResponse;

    purchasedCards.value = result.cards;
    remainingDuelPoints.value = result.remainingDuelPoints;
    purchaseComplete.value = true;

    emit("purchased", result.remainingDuelPoints);
  } catch (err) {
    console.error(err);

    error.value =
      err instanceof Error
        ? err.message
        : "Unable to purchase this pack.";
  } finally {
    purchasing.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="packId !== null"
      class="purchase-overlay"
      @click.self="closeModal"
    >
      <div
        class="purchase-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Purchase Pack"
      >
        <button
          class="close-button"
          type="button"
          :disabled="purchasing"
          @click="closeModal"
        >
          &times;
        </button>

        <h2>
          {{ purchaseComplete ? "Pack Purchased!" : "Purchase Pack" }}
        </h2>

        <div v-if="!purchaseComplete" class="purchase-confirmation">
          <img
            v-if="packImage"
            :src="`http://localhost:3000${packImage}`"
            :alt="packName"
            class="pack-artwork"
          />

          <h3>{{ packName }}</h3>

          <p class="pack-price">
            {{ packPrice.toLocaleString() }} DP
          </p>

          <p>Are you sure you want to purchase this pack?</p>

          <p v-if="error" class="purchase-error">
            {{ error }}
          </p>

          <div class="purchase-actions">
            <button
              type="button"
              :disabled="purchasing"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="button"
              :disabled="purchasing"
              @click="confirmPurchase"
            >
              {{ purchasing ? "Purchasing..." : "Confirm Purchase" }}
            </button>
          </div>
        </div>

        <div v-else class="purchase-results">
          <p>Your cards have been added to your collection!</p>

          <p v-if="remainingDuelPoints !== null">
            Remaining Duel Points:
            <strong>{{ remainingDuelPoints.toLocaleString() }} DP</strong>
          </p>

          <PackCardReveal :cards="purchasedCards" />

          <button
            type="button"
            class="done-button"
            @click="closeModal"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </Teleport>

</template>

<style scoped>
.purchase-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
  box-sizing: border-box;

  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
}

.purchase-modal {
  position: relative;

  width: 100%;
  max-width: 1050px;
  max-height: 90vh;
  overflow-y: auto;

  padding: 30px;
  box-sizing: border-box;

  background: linear-gradient(
    135deg,
    #130a21,
    #28163e
  );

  border: 1px solid #986dc6;
  border-radius: 16px;

  color: #f0e6fa;
  text-align: center;

  box-shadow: 0 0 35px rgba(130, 70, 220, 0.3);
}

.purchase-modal h2 {
  margin: 0 0 25px;
  color: #f0dfff;
  font-family: "Cinzel", serif;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 15px;

  width: 36px;
  height: 36px;
  padding: 0;

  background: #38214f;
  color: white;

  border: 1px solid #986dc6;
  border-radius: 50%;

  font-size: 26px;
  cursor: pointer;
}

.pack-artwork {
  display: block;
  max-width: 220px;
  max-height: 300px;
  object-fit: contain;
  margin: 0 auto 20px;
}

.purchase-confirmation h3 {
  color: #f0dfff;
}

.pack-price {
  color: #f4cf65;
  font-size: 1.5rem;
  font-weight: bold;
}

.purchase-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.purchase-actions button,
.done-button {
  padding: 12px 24px;

  background: #644198;
  border: 1px solid #986dc6;
  border-radius: 8px;

  color: white;
  font-weight: bold;
  cursor: pointer;
}

.purchase-actions button:hover:not(:disabled),
.done-button:hover {
  background: #8054ad;
}

.purchase-actions button:disabled,
.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.purchase-error {
  color: #ff8888;
}

@media (max-width: 600px) {
  .purchase-modal {
    padding: 25px 15px;
  }

  .purchase-actions {
    flex-direction: column;
  }
}
</style>