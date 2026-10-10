<script setup lang="ts">
  import { usePackDetails } from "../composables/usePackDetails";

  import PackCardPool from "../components/PackCardPool.vue";
  import PurchasePackModal from "../components/PurchasePackModal.vue";
  import PackCardReveal from "../components/PackCardReveal.vue";

  import "../styles/pack-details.css";

  const {
    pack,
    loading,
    error,
    showPurchaseModal,
    pulledCards,
    pulling,
    pullError,
    hasPulled,
    openPurchaseModal,
    closePurchaseModal,
    handlePurchase,
    testPull
  } = usePackDetails();
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