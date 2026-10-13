<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  getCollectionImportDetails,
  reviewImportItem,
  approveAllEligible,
  finalizeImport,
  rejectImport,
  STANDARD_RARITIES,
  type CollectionImport,
  type CollectionImportItem,
} from "../services/collectionImportAdminService";
import "../styles/collection-import-review.css";

const props = defineProps<{
  request: CollectionImport;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "completed"): void;
}>();

const items = ref<CollectionImportItem[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const searchQuery = ref("");
const statusFilter = ref("all");

const raritySelections = ref<Record<number, string>>({});

const pendingCount = computed(
  () => items.value.filter(i => i.review_status === "pending").length
);

const approvedCount = computed(
  () => items.value.filter(i => i.review_status === "approved").length
);

const rejectedCount = computed(
  () => items.value.filter(i => i.review_status === "rejected").length
);

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return items.value.filter(item => {
    const matchesSearch =
      item.card_name.toLowerCase().includes(query) ||
      item.passcode.includes(query);

    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "flagged" && item.requires_review) ||
      item.review_status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

async function loadDetails() {
  loading.value = true;
  error.value = "";

  try {
    const result = await getCollectionImportDetails(props.request.id);

    items.value = result.cards;

    raritySelections.value = Object.fromEntries(
      result.cards.map(item => [
        item.id,
        item.approved_rarity ??
          (item.is_standard_rarity ? item.rarity : ""),
      ])
    );
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to load import details.";
  } finally {
    loading.value = false;
  }
}

async function reviewItem(
  item: CollectionImportItem,
  decision: "approved" | "rejected"
) {
  if (busy.value) return;

  busy.value = true;
  error.value = "";

  try {
    await reviewImportItem(
      props.request.id,
      item.id,
      decision,
      decision === "approved"
        ? raritySelections.value[item.id]
        : undefined
    );

    await loadDetails();
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to review card.";
  } finally {
    busy.value = false;
  }
}

async function bulkApprove() {
  if (busy.value) return;

  busy.value = true;
  error.value = "";

  try {
    await approveAllEligible(props.request.id);
    await loadDetails();
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to bulk approve cards.";
  } finally {
    busy.value = false;
  }
}

async function finalize() {
  if (busy.value || pendingCount.value > 0) return;

  if (!confirm(
    "Finalize this import? The player's existing collection " +
    "will be replaced, and excess cards will be removed from decks."
  )) return;

  busy.value = true;
  error.value = "";

  try {
    await finalizeImport(props.request.id);
    emit("completed");
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to finalize import.";
  } finally {
    busy.value = false;
  }
}

async function rejectEntireImport() {
  if (busy.value) return;

  if (!confirm(
    "Reject this entire collection import? The player's collection will remain unchanged."
  )) return;

  busy.value = true;
  error.value = "";

  try {
    await rejectImport(props.request.id);
    emit("completed");
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Failed to reject import.";
  } finally {
    busy.value = false;
  }
}

watch(() => props.request.id, loadDetails, { immediate: true });
</script>

<template>
  <div class="import-modal-overlay" @click.self="emit('close')">
    <div
      class="import-review-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-review-title"
    >
      <header class="import-modal-header">
        <div>
          <h2 id="import-review-title">Review Collection Import</h2>
          <p>{{ request.username }} · Import #{{ request.id }}</p>
        </div>

        <button class="import-close-button" @click="emit('close')">
          ×
        </button>
      </header>

      <div class="import-review-summary">
        <div><strong>{{ request.total_entries }}</strong><span>Entries</span></div>
        <div><strong>{{ pendingCount }}</strong><span>Pending</span></div>
        <div><strong>{{ approvedCount }}</strong><span>Approved</span></div>
        <div><strong>{{ rejectedCount }}</strong><span>Rejected</span></div>
      </div>

      <p v-if="error" class="import-review-error" role="alert">
        {{ error }}
      </p>

      <div class="import-review-toolbar">
        <input
          v-model="searchQuery"
          placeholder="Search cards or passcodes..."
        />

        <select v-model="statusFilter">
          <option value="all">All Cards</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button :disabled="busy || loading" @click="bulkApprove">
          Approve All Unflagged
        </button>
      </div>

      <div class="import-review-card-list">
        <p v-if="loading">Loading cards...</p>

        <p v-else-if="filteredItems.length === 0">
          No cards match the selected filters.
        </p>

        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="import-review-card"
        >
          <div class="import-review-card-info">
            <h3>{{ item.card_name }}</h3>
            <p>
              Quantity: {{ item.quantity }}
              · Original: {{ item.rarity }}
            </p>
            <p v-if="item.requires_review" class="import-review-flag">
              Requires review
              <span v-if="!item.exists_in_pack">· Not in any pack</span>
              <span v-if="!item.is_standard_rarity">· Nonstandard rarity</span>
            </p>
            <p v-if="item.card_id === null" class="import-review-flag">
              Card not found in database
            </p>
          </div>

          <div class="import-review-card-actions">
            <span
              class="import-review-status"
              :class="item.review_status"
            >
              {{ item.review_status }}
            </span>

            <select
              v-model="raritySelections[item.id]"
              :disabled="busy || item.card_id === null"
            >
              <option value="">Choose Rarity</option>
              <option
                v-for="rarity in STANDARD_RARITIES"
                :key="rarity"
                :value="rarity"
              >
                {{ rarity }}
              </option>
            </select>

            <button
              :disabled="
                busy ||
                item.card_id === null ||
                !raritySelections[item.id]
              "
              @click="reviewItem(item, 'approved')"
            >
              Approve
            </button>

            <button
              class="import-reject-button"
              :disabled="busy"
              @click="reviewItem(item, 'rejected')"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <footer class="import-modal-footer">
        <button
          class="import-reject-button"
          :disabled="busy || loading"
          @click="rejectEntireImport"
        >
          Reject Entire Import
        </button>

        <button
          class="import-finalize-button"
          :disabled="busy || loading || pendingCount > 0"
          @click="finalize"
        >
          Finalize Import
        </button>
      </footer>
    </div>
  </div>
</template>