<script setup lang="ts">
import { ref, computed } from "vue";
import {
  adjustPlayerDuelPoints,
  type DuelPointAction,
} from "../services/adminService";

const props = defineProps<{
  userId: number;
  username: string;
  currentPoints: number;
}>();

const emit = defineEmits<{
  close: [];
  saved: [newBalance: number];
}>();

const action = ref<DuelPointAction>("award");
const amount = ref<number | null>(null);
const saving = ref(false);
const error = ref("");

const validAmount = computed(() => {
  const value = amount.value;

  return (
    value !== null &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    (action.value === "award" ||
      value <= props.currentPoints)
  );
});

const newBalance = computed(() => {
  if (!validAmount.value || amount.value === null) {
    return null;
  }

  return (
    props.currentPoints +
    (action.value === "award"
      ? amount.value
      : -amount.value)
  );
});

async function submitAdjustment() {
  if (!validAmount.value || amount.value === null) {
    return;
  }

  if (saving.value) return;

  saving.value = true;
  error.value = "";

  try {
    const result = await adjustPlayerDuelPoints(
      props.userId,
      action.value,
      amount.value
    );

    emit("saved", result.duel_points);
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to adjust Duel Points.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div
    class="admin-modal-overlay"
    @click.self="!saving && emit('close')"
  >
    <div
      class="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-dp-title"
    >
      <h2 id="manage-dp-title">
        Manage Duel Points
      </h2>

      <p>
        Adjusting Duel Points for
        <strong>{{ username }}</strong>
      </p>

      <div class="admin-dp-balance">
        <span>Current Balance</span>
        <strong>
          {{ currentPoints.toLocaleString() }} DP
        </strong>
      </div>

      <form @submit.prevent="submitAdjustment">
        <div class="admin-dp-actions">
          <button
            type="button"
            :class="{ active: action === 'award' }"
            :disabled="saving"
            @click="action = 'award'"
          >
            Award DP
          </button>

          <button
            type="button"
            :class="{ active: action === 'remove' }"
            :disabled="saving"
            @click="action = 'remove'"
          >
            Remove DP
          </button>
        </div>

        <label for="admin-dp-amount">
          Amount
        </label>

        <input
          id="admin-dp-amount"
          v-model.number="amount"
          type="number"
          min="1"
          step="1"
          placeholder="Enter amount..."
          :disabled="saving"
          required
        />

        <p
          v-if="
            action === 'remove' &&
            amount !== null &&
            amount > currentPoints
          "
          class="admin-modal-error"
        >
          Player does not have enough Duel Points.
        </p>

        <div class="admin-dp-preview">
          <span>New Balance</span>

          <strong>
            {{
              newBalance === null
                ? "—"
                : newBalance.toLocaleString() + " DP"
            }}
          </strong>
        </div>

        <p v-if="error" class="admin-modal-error">
          {{ error }}
        </p>

        <div class="admin-modal-actions">
          <button
            type="button"
            class="admin-modal-cancel"
            :disabled="saving"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="admin-modal-save"
            :disabled="!validAmount || saving"
          >
            {{
              saving
                ? "Saving..."
                : action === "award"
                  ? "Award Points"
                  : "Remove Points"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>