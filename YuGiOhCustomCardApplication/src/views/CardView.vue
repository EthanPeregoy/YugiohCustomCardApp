<script setup lang="ts">
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

    <div class="card-details-header">
      <h2>Card Information</h2>
    </div>

    <div class="card-details-content">

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
    </div>

    <p v-else-if="error">
      {{ error }}
    </p>
  </main>
</template>

<style scoped>
.card-details {
  width: 90%;
  max-width: 1100px;

  margin: 30px auto 50px;
  padding: 25px;

  background: rgba(15, 8, 30, 0.85);

  border: 1px solid rgba(170, 110, 255, 0.5);
  border-radius: 16px;

  box-shadow: 0 0 25px rgba(130, 70, 220, 0.2);
  backdrop-filter: blur(8px);
}

.card-details-header {
  padding-bottom: 15px;
  margin-bottom: 25px;

  border-bottom: 1px solid rgba(170, 110, 255, 0.3);
}

.card-details-header h2 {
  margin: 0;

  color: #e8d5ff;
  font-size: 24px;
}

.card-details-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;

  gap: 40px;
}

.card-details-image {
  flex-shrink: 0;
}

.card-details-image img {
  display: block;
  width: 300px;
  max-width: 100%;
  height: auto;

  border-radius: 6px;

  box-shadow: 0 0 20px rgba(170, 110, 255, 0.25);
}

.card-details-info {
  flex: 1;
  min-width: 0;

  text-align: left;

  background: rgba(35, 20, 60, 0.65);

  border: 1px solid rgba(170, 110, 255, 0.25);
  border-radius: 12px;

  padding: 20px 25px;
}

.card-details-info h2 {
  margin-top: 0;
  margin-bottom: 15px;

  color: #f0e2ff;
  font-size: 24px;
}

.card-stats,
.card-type {
  color: #d7b8ff;
  font-weight: bold;
}

.card-type {
  margin-top: 5px;
  margin-bottom: 20px;
}

.card-description {
  color: #f0eaf8;
  line-height: 1.6;
}

.card-description p {
  margin: 0 0 16px;
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

@media (max-width: 750px) {
  .card-details-content {
    flex-direction: column;
    align-items: center;
  }

  .card-details-image img {
    width: 250px;
  }

  .card-details-info {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>