<script setup lang="ts">
    import { computed } from "vue";
    import { rarities, type Card, type Rarity } from "../../types/pack";

    const props = defineProps<{
        cardPools: Record<Rarity, Card[]>;
        filteredCards: Card[];
        cardSearch: string;
        selectedRarity: Rarity;
    }>();

    const emit = defineEmits<{
        (event: "update:cardSearch", value: string): void;
        (event: "update:selectedRarity", value: Rarity): void;
        (event: "addCardToPool", card: Card): void;
        (event: "removeCardFromPool", cardId: number, rarity: Rarity): void;
    }>();

    const searchModel = computed({
        get: () => props.cardSearch,
        set: value => emit("update:cardSearch", value)
    });

    const rarityModel = computed({
        get: () => props.selectedRarity,
        set: value => emit("update:selectedRarity", value)
    });

    function isCardInPool(cardId: number): boolean {
        return props.cardPools[props.selectedRarity].some(
            card => card.id === cardId
        );
    }
</script>

<template>
  <section class="pack-section">
    <h2>Rarity Card Pools</h2>

    <div class="pool-layout">
      <!-- LEFT: Current rarity pools -->
      <div class="pool-list">
        <h3>Current Card Pools</h3>

        <div
          v-for="rarity in rarities"
          :key="rarity"
          class="rarity-pool">
          <h4>
            {{ rarity }}
            ({{ cardPools[rarity].length }})
          </h4>

          <p v-if="cardPools[rarity].length === 0">
            No cards added.
          </p>

          <div class="pool-card-grid">
            <div
              v-for="card in cardPools[rarity]"
              :key="card.id"
              class="pool-card-item"
              :title="card.card_name">
              <img
                :src="card.image_path"
                :alt="card.card_name"
                loading="lazy"/>

              <button
                type="button"
                class="remove-card-button"
                :aria-label="`Remove ${card.card_name}`"
                @click="emit('removeCardFromPool', card.id, rarity)">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Card search -->
      <div class="pool-search">
        <h3>Search Cards</h3>

        <input
          v-model="searchModel"
          type="text"
          placeholder="Search cards..."/>

        <label>Add Cards To:</label>

        <select v-model="rarityModel">
          <option
            v-for="rarity in rarities"
            :key="rarity"
            :value="rarity">
            {{ rarity }}
          </option>
        </select>

        <div class="search-results">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="search-card">
            <div class="card-info">
              <img
                :src="card.image_path"
                :alt="card.card_name"
                class="card-thumbnail"
                loading="lazy"/>

              <span>{{ card.card_name }}</span>
            </div>

            <button
              type="button"
              :disabled="isCardInPool(card.id)"
              @click="emit('addCardToPool', card)">
              {{ isCardInPool(card.id) ? "Added" : "Add" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>