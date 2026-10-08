<script setup lang="ts">
  import { RouterLink } from "vue-router";

  import { useCardDetails } from "../composables/useCardDetails";

  import {
    formatDescription,
    getMonsterTypes,
    getSpellTrapTypes
  } from "../utils/cardFormatting";

  const {
    route,
    cardDetails,
    loading,
    error,
    monsterStats
  } = useCardDetails();
</script>


<template>
  <main class="container">
    <h1>Card Details</h1>

    <p v-if="loading">
      Loading card...
    </p>

    <div v-else-if="cardDetails" class="card-details">

      <!-- Card Image -->
      <div class="card-details-image">
        <img
          :src="cardDetails.image_path"
          :alt="cardDetails.card_name"
        />
      </div>

      <!-- Card Information -->
      <div class="card-details-info">

        <h2>{{ cardDetails.card_name }}</h2>

        <!-- Monster Stats -->
        <p
        v-if="cardDetails.card_type?.includes('Monster')"
        class="card-stats"
        >
        [{{ monsterStats?.top }}]
        </p>

        <p v-if="monsterStats?.scale">
            {{ monsterStats?.scale }}
        </p>

        <p v-if="monsterStats?.bottom">
            {{ monsterStats?.bottom }}
        </p>


       <!-- Monster Type -->
        <p
        v-if="cardDetails.card_type?.includes('Monster')"
        class="card-type"
        >
        [{{ getMonsterTypes(cardDetails) }}]
        </p>

        <!-- Spell / Trap Type -->
        <p
        v-else-if="
            cardDetails.card_type === 'Spell Card' ||
            cardDetails.card_type === 'Trap Card'
        "
        class="card-type"
        >
        [{{ getSpellTrapTypes(cardDetails) }}]
        </p>

        <!-- Card Description -->
        <div class="card-description">
          <p
            v-for="(effect, index) in formatDescription(cardDetails.description)"
            :key="index"
            :class="{ 'bullet-effect': effect.startsWith('●') }"
          >
            {{ effect }}
          </p>
        </div>


      </div>

    </div>

    <p v-else-if="error">
      {{ error }}
    </p>

    <RouterLink
        :to="{
            path: '/cards',
            query: {
            search: route.query.search,
            page: route.query.page
            }
        }"
        class="nav-button"
        >
    Back to Card Search
    </RouterLink>
  </main>
</template>

<style scoped>
.card-details {
  display: flex;
  justify-content: center;
  align-items: flex-start;

  gap: 40px;

  width: 90%;
  max-width: 1000px;
  margin: 20px auto;
}

.card-details-image img {
  width: 300px;
  height: auto;
}

.card-details-info {
  width: 450px;
  text-align: left;

  background-color: #1d1d1dbf;

  border-radius: 8px;

  padding: 15px 20px;
}

.card-details-info h2 {
  margin-top: 0;
}

.card-type {
  margin-top: 5px;
  margin-bottom: 20px;

  font-weight: bold;
}

.card-description p {
  margin: 0 0 16px 0;
}

.card-description p:last-child {
  margin-bottom: 0;
}

.card-description .bullet-effect {
  margin-top: -12px;
  margin-bottom: 16px;
  margin-left: 20px;
  padding-left: 5px;
}
</style>