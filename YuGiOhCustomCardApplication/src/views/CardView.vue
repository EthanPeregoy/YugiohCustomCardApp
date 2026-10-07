<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const cardId = route.params.id;

const cardDetails = ref<any>(null);
const loading = ref(true);
const error = ref("");

async function fetchCardDetails() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/cards/${cardId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    cardDetails.value = await response.json();

    console.log(cardDetails.value);
  } catch (err) {
    console.error(err);
    error.value = "Could not load card.";
  } finally {
    loading.value = false;
  }
}

function formatDescription(description: string) {
  if (!description) {
    return [];
  }

  // Put every bullet point onto its own line before processing.
  description = description.replace(/\s*●\s*/g, "\n● ");

  // Put "During" effects onto a new line.
  description = description.replace(
    /\s+(During\s)/g,
    "\n$1"
  );

  // Split existing/newly-created lines.
  const lines = description
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const effects: string[] = [];

  for (const line of lines) {

    // Bullet effects always get their own paragraph.
    if (line.startsWith("●")) {
      effects.push(line);
      continue;
    }

    // Break normal text into sentences.
    const sentences =
      line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    let currentEffect = "";

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      const startsNewEffect =
        trimmed.startsWith("When ") ||
        trimmed.startsWith("If ") ||
        trimmed.startsWith("During ") ||
        trimmed.startsWith("Once ") ||
        trimmed.startsWith("You can only activate 1") ||
        trimmed.startsWith("You can only use each effect ") ||
        trimmed.startsWith("You can only use 1 ") ||
        trimmed.startsWith("\"") ||
        trimmed.startsWith("Reduce ") ||
        trimmed.startsWith("Increase ") ||
        trimmed.startsWith("Negate ") ||
        trimmed.startsWith("Pay ") ||
        trimmed.startsWith("Banish ") ||
        trimmed.startsWith("Send ") ||
        trimmed.startsWith("Destroy ") ||
        trimmed.startsWith("Discard ") ||
        trimmed.startsWith("Tribute ") ||
        trimmed.startsWith("Target ") ||
        trimmed.startsWith("Choose ") ||
        trimmed.startsWith("Monsters ") ||
        trimmed.startsWith("Return ") ||
        trimmed.startsWith("Reveal ") ||
        trimmed.startsWith("The first time ");

      if (startsNewEffect && currentEffect) {
        effects.push(currentEffect.trim());
        currentEffect = trimmed;
      } else {
        currentEffect +=
          (currentEffect ? " " : "") + trimmed;
      }
    }

    if (currentEffect) {
      effects.push(currentEffect.trim());
    }
  }

  return effects;
}

function hasMonsterEffect(card: any) {
  if (!card.description) {
    return false;
  }

  const formattedText = formatDescription(card.description);

  return formattedText.length > 1;
}

function getMonsterTypes(card: any) {
  const types: string[] = [];

  // Zombie, Dragon, Warrior, Fiend, etc.
  if (card.card_subtype) {
    types.push(card.card_subtype);
  }

  if (!card.card_type) {
    return types.join(" / ");
  }

  const typeWords: string[] = card.card_type
    .replace(/\bMonster\b/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const extraDeckTypes = [
    "Fusion",
    "Synchro",
    "Xyz",
    "Link"
  ];

  // Add types contained directly in card_type.
  for (const type of typeWords) {
    if (!types.includes(type)) {
      types.push(type);
    }
  }

  const isExtraDeckMonster = typeWords.some((type: string) =>
    extraDeckTypes.includes(type)
  );

  // Add Pendulum if your frame_type identifies it.
  if (
    card.frame_type?.toLowerCase().includes("pendulum") &&
    !types.includes("Pendulum")
  ) {
    types.push("Pendulum");
  }

  // Add Tuner if your data identifies the card as one.
  if (
    card.card_type?.includes("Tuner") &&
    !types.includes("Tuner")
  ) {
    types.push("Tuner");
  }

  // Determine Effect for Extra Deck monsters when the API
  // doesn't explicitly provide it.
  if (
    isExtraDeckMonster &&
    !types.includes("Effect") &&
    hasMonsterEffect(card)
  ) {
    types.push("Effect");
  }

  return types.join(" / ");
}

function getSpellTrapTypes(card: any) {
  const types: string[] = [];

  if (card.card_type) {
    const cardType = card.card_type
      .replace(/\bCard\b/g, "")
      .trim();

    types.push(cardType);
  }

  if (card.card_subtype) {
    types.push(card.card_subtype);
  }

  return types.join(" / ");
}

onMounted(() => {
  fetchCardDetails();
});
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

    <RouterLink to="/cards" class="nav-button">
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