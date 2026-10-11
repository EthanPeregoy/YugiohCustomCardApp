<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import {
  sellCollectionCard,
  type CollectionCard,
  type CardSaleResult
} from "../services/collectionService";

const props = defineProps<{
  open: boolean;
  card: CollectionCard | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  sold: [result: CardSaleResult];
}>();

const dialogElement = ref<HTMLDialogElement | null>(null);

const quantity = ref(1);
const selling = ref(false);
const error = ref("");

const sellPrices: Record<string, number> = {
  Common: 2,
  Rare: 5,
  "Super Rare": 10
};

const pricePerCopy = computed(() =>
  props.card
    ? sellPrices[props.card.rarity] ?? 0
    : 0
);

const validQuantity = computed(() =>
  props.card !== null &&
  Number.isSafeInteger(quantity.value) &&
  quantity.value >= 1 &&
  quantity.value <= Number(props.card.quantity)
);

const totalPayout = computed(() =>
  validQuantity.value
    ? quantity.value * pricePerCopy.value
    : 0
);

watch(
  () => props.open,
  async open => {
    if (open) {
      quantity.value = 1;
      error.value = "";

      await nextTick();

      if (!dialogElement.value?.open) {
        dialogElement.value?.showModal();
      }
    } else {
      dialogElement.value?.close();
    }
  }
);

function closeModal() {
  if (selling.value) return;

  emit("update:open", false);
}

async function confirmSale() {
  if (
    !props.card ||
    selling.value ||
    !validQuantity.value ||
    pricePerCopy.value <= 0
  ) {
    return;
  }

  selling.value = true;
  error.value = "";

  try {
    const result = await sellCollectionCard(
      props.card.id,
      quantity.value
    );

    emit("sold", result);
    emit("update:open", false);
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to sell cards";
  } finally {
    selling.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogElement"
      class="sell-card-modal"
      aria-labelledby="sell-card-title"
      @cancel.prevent="closeModal"
      @close="closeModal"
    >
      <form
        v-if="card"
        @submit.prevent="confirmSale"
      >
        <h2 id="sell-card-title">Sell Cards</h2>

        <p class="sell-card-name">
          {{ card.card_name }}
        </p>

        <p>
          {{ card.rarity }} ·
          {{ pricePerCopy }} DP per copy
        </p>

        <p>Owned at this rarity: {{ card.quantity }}</p>

        <label class="sell-quantity">
          Quantity to sell

          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="card.quantity"
            step="1"
            required
            :disabled="selling"
          />
        </label>

        <p class="sell-payout">
          You will receive {{ totalPayout }} DP.
        </p>

        <p class="sell-warning">
          If selling leaves a saved deck with more copies
          than you own, excess copies will be removed and
          that deck will be marked invalid.
        </p>

        <p
          v-if="error"
          class="sell-error"
          role="alert"
        >
          {{ error }}
        </p>

        <div class="sell-actions">
          <button
            type="button"
            :disabled="selling"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="
              selling ||
              !validQuantity ||
              pricePerCopy <= 0
            "
          >
            {{ selling ? "Selling..." : "Confirm Sale" }}
          </button>
        </div>
      </form>
    </dialog>
  </Teleport>
</template>

<style scoped>
.sell-card-modal {
  width: min(480px, calc(100vw - 32px));
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px;

  color: #f0dfff;
  background: #190f29;

  border: 1px solid #a675d2;
  border-radius: 16px;

  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.6);
}

.sell-card-modal::backdrop {
  background: rgba(5, 2, 12, 0.75);
  backdrop-filter: blur(4px);
}

.sell-card-modal h2 {
  margin-top: 0;
}

.sell-card-name {
  font-size: 1.15rem;
  font-weight: 600;
}

.sell-quantity {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 20px 0;
}

.sell-quantity input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;

  font: inherit;
  color: #ffffff;
  background: #2b1b3c;

  border: 1px solid #73508e;
  border-radius: 8px;
}

.sell-payout {
  font-weight: 700;
  color: #d8b1ff;
}

.sell-warning {
  color: #e2c68d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.sell-error {
  color: #ffaaaa;
}

.sell-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.sell-actions button {
  padding: 10px 16px;

  font: inherit;
  color: #ffffff;
  background: #59317a;

  border: 1px solid #a570cd;
  border-radius: 8px;

  cursor: pointer;
}

.sell-actions button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>