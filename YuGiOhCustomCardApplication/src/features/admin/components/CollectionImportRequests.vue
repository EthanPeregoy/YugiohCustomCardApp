<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getCollectionImports,
  type CollectionImport,
} from "../services/collectionImportAdminService";
import CollectionImportReviewModal from "./CollectionImportReviewModal.vue";

const imports = ref<CollectionImport[]>([]);
const loading = ref(false);
const error = ref("");

const selectedImport = ref<CollectionImport | null>(null);

async function loadImports() {
  loading.value = true;
  error.value = "";

  try {
    const result = await getCollectionImports();

    imports.value = result.filter(
      (request) => request.status === "pending"
    );
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to load collection imports.";
  } finally {
    loading.value = false;
  }
}

function reviewImport(request: CollectionImport) {
  selectedImport.value = request;
}

async function handleImportCompleted() {
  selectedImport.value = null;
  await loadImports();
}

onMounted(loadImports);
</script>

<template>
  <section class="admin-player-panel collection-import-panel">
    <div class="admin-player-toolbar">
      <h2>
        Collection Import Requests
        <span v-if="imports.length" class="import-request-count">
          {{ imports.length }}
        </span>
      </h2>

      <button
        class="admin-view-button"
        :disabled="loading"
        @click="loadImports"
      >
        Refresh
      </button>
    </div>

    <p v-if="loading" class="admin-message">
      Loading import requests...
    </p>

    <div v-else-if="error" class="admin-message">
      <p>{{ error }}</p>
      <button @click="loadImports">Retry</button>
    </div>

    <p
      v-else-if="imports.length === 0"
      class="admin-message"
    >
      No pending collection imports.
    </p>

    <div v-else class="admin-player-list">
      <div
        v-for="request in imports"
        :key="request.id"
        class="admin-player-card"
      >
        <div class="admin-player-avatar">
          {{ request.username?.charAt(0).toUpperCase() || "?" }}
        </div>

        <div class="admin-player-info">
          <h3>{{ request.username }}</h3>
          <p>
            {{ request.total_entries }} entries
            · {{ request.total_copies }} copies
          </p>
          <p>
            Submitted:
            {{ new Date(request.submitted_at).toLocaleString() }}
          </p>
        </div>

        <button
          class="admin-view-button"
          @click="reviewImport(request)"
        >
          Review Import
        </button>
      </div>
    </div>

    <CollectionImportReviewModal
        v-if="selectedImport"
        :request="selectedImport"
        @close="selectedImport = null"
        @completed="handleImportCompleted"
    />
  </section>
</template>