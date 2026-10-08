<script setup lang="ts">
    import type { PulledCard } from "../../types/pack";

    defineProps<{
        pulledCards: PulledCard[];
        simulationError: string;
    }>();

    const emit = defineEmits<{
        (event: "testOpenPack"): void;
    }>();
</script>

<template>
  <section class="pack-section">
    <h2>Pack Simulator</h2>

    <p>
      Test your pack's rarity probabilities and
      card pools by opening a simulated pack.
    </p>

    <button
      type="button"
      class="simulate-button"
      @click="emit('testOpenPack')">
      Test Open Pack
    </button>

    <!-- Simulation errors -->
    <p
      v-if="simulationError"
      class="simulation-error"
      role="alert">
      {{ simulationError }}
    </p>

    <!-- Pack results -->
    <div
      v-if="pulledCards.length > 0"
      class="simulation-results">
      <h3>Pack Results</h3>

      <div class="pulled-card-grid">
        <div
          v-for="pulled in pulledCards"
          :key="pulled.position"
          class="pulled-card">
          <img
            :src="pulled.card.image_path"
            :alt="pulled.card.card_name"/>

          <p class="pulled-card-name">
            {{ pulled.card.card_name }}
          </p>

          <p class="pulled-card-rarity">
            {{ pulled.rarity }}
          </p>

          <p class="pulled-card-position">
            Card {{ pulled.position }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>