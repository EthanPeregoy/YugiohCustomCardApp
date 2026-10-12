<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

import type { CardTag } from "../types/cardFilters";

import {
  getCollectionTags,
  createCollectionTag,
  updateCollectionTag,
  deleteCollectionTag,
  saveCardTags
} from "../services/collectionTagService";

const props = defineProps<{
  open: boolean;
  cardId: number | null;
  cardName: string;
  assignedTags: CardTag[];
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  changed: [];
}>();

const dialogElement = ref<HTMLDialogElement | null>(null);

const tags = ref<CardTag[]>([]);
const selectedTagIds = ref<number[]>([]);

const newTagName = ref("");
const newTagColor = ref("#b87aef");

const busy = ref(false);
const error = ref("");
const message = ref("");

const deletingTagId = ref<number | null>(null);

watch(
  () => props.open,
  async open => {
    if (!open) {
      dialogElement.value?.close();
      return;
    }

    selectedTagIds.value = props.assignedTags.map(
      tag => tag.id
    );

    newTagName.value = "";
    newTagColor.value = "#b87aef";
    deletingTagId.value = null;
    error.value = "";
    message.value = "";

    await nextTick();

    if (!dialogElement.value?.open) {
      dialogElement.value?.showModal();
    }

    busy.value = true;
    tags.value = [];

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

async function runAction(
  action: () => Promise<void>
) {
  if (busy.value) return;

  busy.value = true;
  error.value = "";
  message.value = "";

  try {
    await action();
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "Could not update tags";
  } finally {
    busy.value = false;
  }
}

async function createTag() {
  await runAction(async () => {
    const tag = await createCollectionTag(
      newTagName.value.trim(),
      newTagColor.value
    );

    tags.value.push(tag);
    newTagName.value = "";

    message.value = "Tag created.";
    emit("changed");
  });
}

async function updateTag(tag: CardTag) {
  await runAction(async () => {
    const updated = await updateCollectionTag(
      tag.id,
      tag.name.trim(),
      tag.color
    );

    const index = tags.value.findIndex(
      entry => entry.id === tag.id
    );

    if (index !== -1) {
      tags.value[index] = updated;
    }

    message.value = "Tag updated.";
    emit("changed");
  });
}

async function deleteTag(tagId: number) {
  await runAction(async () => {
    await deleteCollectionTag(tagId);

    tags.value = tags.value.filter(
      tag => tag.id !== tagId
    );

    selectedTagIds.value = selectedTagIds.value.filter(
      id => id !== tagId
    );

    deletingTagId.value = null;

    message.value = "Tag deleted.";
    emit("changed");
  });
}

async function saveAssignments() {
  const cardId = props.cardId;
  if (cardId === null) return;

  await runAction(async () => {
    await saveCardTags(
      cardId,
      selectedTagIds.value
    );

    emit("changed");
    emit("update:open", false);
  });
}
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogElement"
      class="tag-modal"
      aria-labelledby="tag-modal-title"
      @cancel.prevent="closeModal"
      @close="closeModal"
    >
      <header class="tag-modal-header">
        <h2 id="tag-modal-title">
          {{ cardId === null
            ? "Manage Custom Tags"
            : "Edit Card Tags" }}
        </h2>

        <button
          type="button"
          aria-label="Close tag manager"
          :disabled="busy"
          @click="closeModal"
        >
          ✕
        </button>
      </header>

      <p v-if="cardId !== null">
        {{ cardName }}
      </p>

      <p class="tag-hint">
        Tags apply to all owned copies of a card,
        across rarities.
      </p>

      <form
        class="tag-create-form"
        @submit.prevent="createTag"
      >
        <label>
          New Tag Name

          <input
            v-model="newTagName"
            type="text"
            maxlength="50"
            required
            :disabled="busy"
            placeholder="Favorites, Trade, Deck Ideas..."
          />
        </label>

        <label>
          Color

          <input
            v-model="newTagColor"
            type="color"
            :disabled="busy"
          />
        </label>

        <button
          type="submit"
          :disabled="busy || !newTagName.trim()"
        >
          Create Tag
        </button>
      </form>

      <p v-if="cardId !== null" class="tag-hint">
        Check the tags to assign, then select Save Card Tags.
      </p>

      <div
        v-for="tag in tags"
        :key="tag.id"
        class="tag-entry"
      >
        <div class="tag-row">
          <input
            v-if="cardId !== null"
            v-model="selectedTagIds"
            type="checkbox"
            :value="tag.id"
            :disabled="busy"
            :aria-label="`Assign ${tag.name}`"
          />

          <input
            v-model="tag.name"
            type="text"
            maxlength="50"
            :disabled="busy"
            :aria-label="`Name for tag ${tag.id}`"
          />

          <input
            v-model="tag.color"
            type="color"
            :disabled="busy"
            :aria-label="`Color for ${tag.name}`"
          />

          <button
            type="button"
            :disabled="busy || !tag.name.trim()"
            @click="updateTag(tag)"
          >
            Update
          </button>

          <button
            type="button"
            :disabled="busy"
            @click="deletingTagId = tag.id"
          >
            Delete
          </button>
        </div>

        <div
          v-if="deletingTagId === tag.id"
          class="tag-delete-confirmation"
        >
          <p>
            Delete this tag from all your cards?
            Your cards will remain in your collection.
          </p>

          <button
            type="button"
            :disabled="busy"
            @click="deletingTagId = null"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="busy"
            @click="deleteTag(tag.id)"
          >
            Confirm Delete
          </button>
        </div>
      </div>

      <p v-if="busy">Loading or saving tags...</p>

      <p v-else-if="tags.length === 0">
        No tags yet. Create your first one above.
      </p>

      <p v-if="error" class="tag-error" role="alert">
        {{ error }}
      </p>

      <p v-if="message" role="status">
        {{ message }}
      </p>

      <footer class="tag-modal-footer">
        <button
          type="button"
          :disabled="busy"
          @click="closeModal"
        >
          Close
        </button>

        <button
          v-if="cardId !== null"
          type="button"
          :disabled="busy"
          @click="saveAssignments"
        >
          Save Card Tags
        </button>
      </footer>
    </dialog>
  </Teleport>
</template>

<style scoped>
.tag-modal {
  width: min(760px, calc(100vw - 32px));
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

.tag-modal::backdrop {
  background: rgba(5, 2, 12, 0.75);
  backdrop-filter: blur(4px);
}

.tag-modal-header,
.tag-modal-footer,
.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-modal-header {
  justify-content: space-between;
}

.tag-modal-header h2 {
  margin: 0;
}

.tag-modal-footer {
  justify-content: flex-end;
  margin-top: 24px;
}

.tag-create-form {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin: 24px 0;
}

.tag-create-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-create-form label:first-child {
  flex: 1;
  min-width: 180px;
}

.tag-entry {
  padding: 12px 0;
  border-bottom: 1px solid #513467;
}

.tag-row input[type="text"] {
  flex: 1;
  min-width: 0;
}

.tag-modal input[type="text"] {
  box-sizing: border-box;
  padding: 10px 12px;

  font: inherit;
  color: #ffffff;
  background: #2b1b3c;

  border: 1px solid #73508e;
  border-radius: 8px;
}

.tag-modal input[type="color"] {
  width: 44px;
  height: 40px;
  padding: 3px;
  background: #2b1b3c;
  border: 1px solid #73508e;
  border-radius: 6px;
}

.tag-modal input[type="checkbox"] {
  accent-color: #b87aef;
}

.tag-modal button {
  padding: 9px 14px;

  font: inherit;
  color: #ffffff;
  background: #59317a;

  border: 1px solid #a570cd;
  border-radius: 8px;

  cursor: pointer;
}

.tag-modal button:disabled {
  opacity: 0.5;
  cursor: default;
}

.tag-hint {
  color: #cbb5df;
  font-size: 0.9rem;
  line-height: 1.5;
}

.tag-error {
  color: #ffaaaa;
}

.tag-delete-confirmation {
  margin-top: 12px;
  color: #e2c68d;
}

.tag-delete-confirmation button {
  margin-right: 8px;
}

@media (max-width: 600px) {
  .tag-row {
    flex-wrap: wrap;
  }

  .tag-row input[type="text"] {
    flex-basis: 65%;
  }

  .tag-modal {
    padding: 18px;
  }
}
</style>