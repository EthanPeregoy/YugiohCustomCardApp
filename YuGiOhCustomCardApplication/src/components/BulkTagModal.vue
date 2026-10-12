<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { CardTag } from "../types/cardFilters";

import {
  getCollectionTags,
  updateCardsTags
} from "../services/collectionTagService";

const props = defineProps<{
  open: boolean;
  cardIds: number[];
  action: "add" | "remove";
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  changed: [];
}>();

const dialogElement = ref<HTMLDialogElement | null>(null);

const tags = ref<CardTag[]>([]);
const selectedTagIds = ref<number[]>([]);

const busy = ref(false);
const error = ref("");

watch(
  () => props.open,
  async open => {
    if (!open) {
      dialogElement.value?.close();
      return;
    }

    selectedTagIds.value = [];
    tags.value = [];
    error.value = "";
    busy.value = true;

    await nextTick();

    if (!dialogElement.value?.open) {
      dialogElement.value?.showModal();
    }

    try {
      tags.value = await getCollectionTags();
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Could not load tags";
    } finally {
      busy.value = false;
    }
  }
);

function closeModal() {
  if (busy.value) return;
  emit("update:open", false);
}

async function applyTags() {
  if (
    busy.value ||
    props.cardIds.length === 0 ||
    selectedTagIds.value.length === 0
  ) {
    return;
  }

  busy.value = true;
  error.value = "";

  try {
    await updateCardsTags(
      props.cardIds,
      selectedTagIds.value,
      props.action
    );

    emit("changed");
    emit("update:open", false);
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Could not update tags";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogElement"
      class="bulk-tag-modal"
      aria-labelledby="bulk-tag-title"
      @cancel.prevent="closeModal"
      @close="closeModal"
    >
      <form @submit.prevent="applyTags">
        <h2 id="bulk-tag-title">
          {{ action === "add" ? "Add Tags" : "Remove Tags" }}
        </h2>

        <p>
          {{ cardIds.length }} unique cards selected.
          Changes apply across their owned rarities.
        </p>

        <p v-if="action === 'add'">
          Existing tags will be preserved.
        </p>

        <div class="bulk-tag-options">
          <label v-for="tag in tags" :key="tag.id">
            <input
              v-model="selectedTagIds"
              type="checkbox"
              :value="tag.id"
              :disabled="busy"
            />

            <span
              class="bulk-tag-label"
              :style="{ borderColor: tag.color }"
            >
              {{ tag.name }}
            </span>
          </label>
        </div>

        <p v-if="busy">Loading or saving tags...</p>

        <p v-else-if="tags.length === 0 && !error">
          Create tags using Manage Tags first.
        </p>

        <p v-if="error" class="bulk-tag-error" role="alert">
          {{ error }}
        </p>

        <footer>
          <button
            type="button"
            :disabled="busy"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="busy || selectedTagIds.length === 0"
          >
            {{ action === "add" ? "Add Tags" : "Remove Tags" }}
          </button>
        </footer>
      </form>
    </dialog>
  </Teleport>
</template>

<style scoped>
.bulk-tag-modal {
  width: min(500px, calc(100vw - 32px));
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px;

  color: #f0dfff;
  background: #190f29;

  border: 1px solid #a675d2;
  border-radius: 16px;
}

.bulk-tag-modal::backdrop {
  background: rgba(5, 2, 12, 0.75);
  backdrop-filter: blur(4px);
}

.bulk-tag-modal h2 {
  margin-top: 0;
}

.bulk-tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.bulk-tag-options label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bulk-tag-options input {
  accent-color: #b87aef;
}

.bulk-tag-label {
  padding: 5px 10px;
  border: 1px solid;
  border-radius: 20px;
}

.bulk-tag-modal footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.bulk-tag-modal button {
  padding: 9px 14px;
  font: inherit;
  color: #ffffff;
  background: #59317a;
  border: 1px solid #a570cd;
  border-radius: 8px;
  cursor: pointer;
}

.bulk-tag-modal button:disabled {
  opacity: 0.5;
  cursor: default;
}

.bulk-tag-error {
  color: #ffaaaa;
}
</style>