<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import CardDetails from "./CardDetails.vue";

const props = defineProps<{
  cardId: string | number | null;
  price?: number;
  rarity?: string;
}>();

const emit = defineEmits<{
  close: [];
  purchase: [];
}>();

function closeModal() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.cardId !== null) {
    closeModal();
  }
}

watch(
  () => props.cardId,
  (id) => {
    if (id !== null) {
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.removeEventListener("keydown", handleKeydown);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="cardId !== null"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-label="Card Details"
      >
        <button
          class="modal-close"
          type="button"
          aria-label="Close card details"
          @click="closeModal"
        >
          &times;
        </button>

        <CardDetails :card-id="cardId" />

        <div v-if="price !== undefined" class="modal-purchase">
          <div class="modal-purchase-info">
            <span>{{ rarity }}</span>
            <strong>{{ price }} DP</strong>
          </div>

          <button
            type="button"
            class="modal-purchase-button"
            @click="emit('purchase')"
          >
            Purchase Card
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 25px;
  box-sizing: border-box;

  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.modal-container {
  position: relative;

  width: 100%;
  max-width: 1100px;
  max-height: 90vh;

  overflow-y: auto;

  border-radius: 16px;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 15px;
  z-index: 10;

  width: 36px;
  height: 36px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(35, 20, 60, 0.95);
  color: #ffffff;

  border: 1px solid rgba(170, 110, 255, 0.5);
  border-radius: 50%;

  font-size: 26px;
  cursor: pointer;
}

.modal-close:hover {
  background: rgba(110, 60, 170, 0.95);
}

@media (max-width: 750px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-container {
    max-height: 95vh;
  }
}


.modal-purchase {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;

  padding: 20px;
  margin-top: 10px;

  background: rgba(25, 15, 45, 0.95);
  border: 1px solid rgba(170, 110, 255, 0.4);
  border-radius: 12px;
}

.modal-purchase-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  color: #d6b8ff;
}

.modal-purchase-info strong {
  color: #ffd76a;
  font-size: 22px;
}

.modal-purchase-button {
  padding: 12px 25px;

  background: #673ab7;
  color: white;

  border: 1px solid #a66cff;
  border-radius: 8px;

  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.modal-purchase-button:hover {
  background: #8050d0;
}

@media (max-width: 600px) {
  .modal-purchase {
    flex-direction: column;
    gap: 12px;
  }
}
</style>