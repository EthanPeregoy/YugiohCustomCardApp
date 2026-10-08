
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const packName = ref("");
const packDescription = ref("");
const packPrice = ref(0);
const cardsPerPack = ref(5);

const selectedSlot = ref(1);
const copyStart = ref(1);
const copyEnd = ref(5);

function createSlot(position: number): CardSlot {
  return {
    position,
    probabilities: {
      "Common": 100,
      "Rare": 0,
      "Super Rare": 0,
      "Ultra Rare": 0,
      "Secret Rare": 0
    },
    conditions: []
  };
}

async function fetchCards() {
  try {
    const response = await fetch("http://localhost:3000/api/cards", {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    allCards.value = await response.json();

  } catch (err) {
    console.error("Error fetching cards:", err);
  }
}

const filteredCards = computed(() => {
  const query = cardSearch.value.trim().toLowerCase();

  if (!query) return allCards.value.slice(0, 30);

  return allCards.value
    .filter(card => card.card_name.toLowerCase().includes(query))
    .slice(0, 30);
});

function addCardToPool(card: Card) {
  const pool = cardPools.value[selectedRarity.value];

  if (pool.some(existing => existing.id === card.id)) {
    return;
  }

  pool.push(card);
}

function removeCardFromPool(cardId: number, rarity: Rarity) {
  cardPools.value[rarity] = cardPools.value[rarity].filter(
    card => card.id !== cardId
  );
}

function isCardInPool(cardId: number): boolean {
  return cardPools.value[selectedRarity.value].some(
    card => card.id === cardId
  );
}

onMounted(() => {
  fetchCards();
});

const cardSlots = ref<CardSlot[]>(
  Array.from({ length: cardsPerPack.value }, (_, index) =>
    createSlot(index + 1)
  )
);

const currentSlot = computed(() => {
  return cardSlots.value.find(
    slot => slot.position === selectedSlot.value
  );
});

const totalProbability = computed(() => {
  if (!currentSlot.value) return 0;

  return rarities.reduce((total, rarity) => {
    return total + currentSlot.value!.probabilities[rarity];
  }, 0);
});

function selectSlot(slot: number) {
  selectedSlot.value = slot;
}

function updateCardCount() {
  cardsPerPack.value = Math.max(
    1,
    Math.min(100, Math.trunc(cardsPerPack.value) || 1)
  );

  const currentCount = cardSlots.value.length;
  const newCount = cardsPerPack.value;

  if (newCount > currentCount) {
    for (let i = currentCount + 1; i <= newCount; i++) {
      cardSlots.value.push(createSlot(i));
    }
  } else if (newCount < currentCount) {
    cardSlots.value.splice(newCount);
  }

  if (selectedSlot.value > newCount) {
    selectedSlot.value = newCount;
  }
}

function copySlotSettings() {
  const sourceSlot = currentSlot.value;

  if (!sourceSlot) return;

  const start = copyStart.value;
  const end = copyEnd.value;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 1 ||
    end > cardSlots.value.length ||
    start > end
  ) {
    alert("Please enter a valid slot range.");
    return;
  }

  for (let i = start; i <= end; i++) {
    const targetSlot = cardSlots.value.find(
      slot => slot.position === i
    );

    if (targetSlot) {
      targetSlot.probabilities = {
        ...sourceSlot.probabilities
      };
    }
  }
}

function addConditionalRule() {
  const slot = currentSlot.value;

  if (!slot) return;

  const otherSlot = cardSlots.value.find(
    candidate => candidate.position !== slot.position
  );

  if (!otherSlot) {
    alert("A conditional rule requires at least two card slots.");
    return;
  }

  slot.conditions.push({
    id: crypto.randomUUID(),
    dependsOnSlot: otherSlot.position,
    triggerRarities: ["Super Rare"],

    probabilities: {
      "Common": 0,
      "Rare": 100,
      "Super Rare": 0,
      "Ultra Rare": 0,
      "Secret Rare": 0
    }
  });
}

function removeConditionalRule(ruleId: string) {
  const slot = currentSlot.value;

  if (!slot) return;

  slot.conditions = slot.conditions.filter(
    rule => rule.id !== ruleId
  );
}

type Rarity =
  | "Common"
  | "Rare"
  | "Super Rare"
  | "Ultra Rare"
  | "Secret Rare";

type RarityProbabilities = Record<Rarity, number>;

type ConditionalRule = {
  id: string;
  dependsOnSlot: number;
  triggerRarities: Rarity[];
  probabilities: RarityProbabilities;
};

type CardSlot = {
  position: number;
  probabilities: RarityProbabilities;
  conditions: ConditionalRule[];
};

const rarities: Rarity[] = [
  "Common",
  "Rare",
  "Super Rare",
  "Ultra Rare",
  "Secret Rare"
];

type Card = {
  id: number;
  card_name: string;
  image_path: string;
};

type PulledCard = {
  position: number;
  card: Card;
  rarity: Rarity;
};

const allCards = ref<Card[]>([]);
const cardSearch = ref("");
const selectedRarity = ref<Rarity>("Common");

const cardPools = ref<Record<Rarity, Card[]>>({
  "Common": [],
  "Rare": [],
  "Super Rare": [],
  "Ultra Rare": [],
  "Secret Rare": []
});
const pulledCards = ref<PulledCard[]>([]);
const simulationError = ref("");

function rollRarity(probabilities: RarityProbabilities): Rarity {
  const roll = Math.random() * 100;
  let cumulativeProbability = 0;

  for (const rarity of rarities) {
    cumulativeProbability += probabilities[rarity];

    if (roll < cumulativeProbability) {
      return rarity;
    }
  }

  throw new Error("Invalid rarity probability distribution.");
}

function getEffectiveProbabilities(
  slot: CardSlot,
  rolledRarities: Map<number, Rarity>
): RarityProbabilities {
  for (const rule of slot.conditions) {
    const dependencyRarity = rolledRarities.get(rule.dependsOnSlot);

    if (
      dependencyRarity &&
      rule.triggerRarities.includes(dependencyRarity)
    ) {
      return rule.probabilities;
    }
  }

  return slot.probabilities;
}

function generatePackRarities(): Map<number, Rarity> {
  const rolledRarities = new Map<number, Rarity>();
  const processing = new Set<number>();

  function rollSlot(position: number): Rarity {
    const existing = rolledRarities.get(position);

    if (existing) {
      return existing;
    }

    if (processing.has(position)) {
      throw new Error(
        `Circular conditional dependency detected at Card ${position}.`
      );
    }

    const slot = cardSlots.value.find(
      s => s.position === position
    );

    if (!slot) {
      throw new Error(`Card ${position} does not exist.`);
    }

    processing.add(position);

    try {
      // Resolve dependencies before rolling this slot.
      for (const rule of slot.conditions) {
        if (
          rule.dependsOnSlot === position ||
          !cardSlots.value.some(
            s => s.position === rule.dependsOnSlot
          )
        ) {
          throw new Error(
            `Card ${position} has an invalid dependency.`
          );
        }

        rollSlot(rule.dependsOnSlot);
      }

      const probabilities = getEffectiveProbabilities(
        slot,
        rolledRarities
      );

      const rarity = rollRarity(probabilities);

      rolledRarities.set(position, rarity);

      return rarity;
    } finally {
      processing.delete(position);
    }
  }

  for (const slot of cardSlots.value) {
    rollSlot(slot.position);
  }

  return rolledRarities;
}

function rollCard(rarity: Rarity): Card {
  const pool = cardPools.value[rarity];

  if (pool.length === 0) {
    throw new Error(`The ${rarity} card pool is empty.`);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);

  return pool[randomIndex];
}

function testOpenPack() {
  simulationError.value = "";
  pulledCards.value = [];

  try {
    function validateProbabilities(
      probabilities: RarityProbabilities,
      label: string
    ) {
      const values = rarities.map(
        rarity => probabilities[rarity]
      );

      if (
        values.some(
          value =>
            !Number.isFinite(value) ||
            value < 0 ||
            value > 100
        )
      ) {
        throw new Error(`${label} has invalid probabilities.`);
      }

      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      if (Math.abs(total - 100) > 0.000001) {
        throw new Error(`${label} must total 100%.`);
      }

      for (const rarity of rarities) {
        if (
          probabilities[rarity] > 0 &&
          cardPools.value[rarity].length === 0
        ) {
          throw new Error(
            `${label} uses ${rarity}, but its card pool is empty.`
          );
        }
      }
    }

    // Validate all default and conditional probabilities.
    for (const slot of cardSlots.value) {
      validateProbabilities(
        slot.probabilities,
        `Card ${slot.position}`
      );

      for (const [index, rule] of slot.conditions.entries()) {
        if (
          rule.triggerRarities.length === 0 ||
          rule.triggerRarities.some(
            rarity => !rarities.includes(rarity)
          )
        ) {
          throw new Error(
            `Card ${slot.position}, Rule ${index + 1} needs valid trigger rarities.`
          );
        }

        validateProbabilities(
          rule.probabilities,
          `Card ${slot.position}, Rule ${index + 1}`
        );
      }
    }

    // Roll rarities in dependency order.
    const rolledRarities = generatePackRarities();

    // Select cards and display them in their original slot order.
    const results: PulledCard[] = cardSlots.value.map(slot => {
      const rarity = rolledRarities.get(slot.position);

      if (!rarity) {
        throw new Error(
          `Failed to generate Card ${slot.position}.`
        );
      }

      return {
        position: slot.position,
        rarity,
        card: rollCard(rarity)
      };
    });

    pulledCards.value = results;

  } catch (err) {
    simulationError.value =
      err instanceof Error
        ? err.message
        : "Could not simulate pack.";
  }
}
</script>

<template>
  <div class="pack-creator">
    <h1>Create New Pack</h1>

    <section class="pack-section">
      <h2>Pack Information</h2>

      <label>Pack Name</label>
      <input
        v-model="packName"
        type="text"
        placeholder="Enter pack name"
      />

      <label>Description</label>
      <textarea
        v-model="packDescription"
        placeholder="Enter pack description"
      ></textarea>

      <label>Pack Price</label>
      <input
        v-model.number="packPrice"
        type="number"
        min="0"
      />

      <label>Cards Per Pack</label>
      <input
        v-model.number="cardsPerPack"
        type="number"
        min="1"
        max="100"
        @change="updateCardCount"
      />
    </section>

    <section class="pack-section">
      <h2>Card Slots</h2>

      <p>Select a card slot to configure its rarity.</p>

      <div class="slot-grid">
        <button
            v-for="slot in cardSlots"
            :key="slot.position"
            class="slot-button"
            :class="{ active: selectedSlot === slot.position }"
            @click="selectSlot(slot.position)"
            >
            Card {{ slot.position }}
        </button>
      </div>
    </section>

    <section v-if="currentSlot" class="pack-section">
        <h2>Card {{ selectedSlot }} Settings</h2>

        <p>Set the probability of each rarity appearing in this slot.</p>

        <div
            v-for="rarity in rarities"
            :key="rarity"
            class="rarity-row"
        >
            <label>{{ rarity }}</label>

            <input
            v-model.number="currentSlot.probabilities[rarity]"
            type="number"
            min="0"
            max="100"
            step="0.01"
            />

            <span>%</span>
        </div>

        <div class="probability-total">
            <strong>Total Probability:</strong>

            <span
            :class="{
                valid: Math.abs(totalProbability - 100) < 0.000001,
                invalid: Math.abs(totalProbability - 100) >= 0.000001
            }"
            >
            {{ totalProbability.toFixed(2) }}%
            </span>
        </div>

        <p
            v-if="Math.abs(totalProbability - 100) >= 0.000001"
            class="warning"
        >
            The total probability must equal 100%.
        </p>

        <div class="conditional-rules">
            <h3>Conditional Rarity Rules</h3>

            <p>
                Override this slot's probabilities based on
                the rarity pulled by another card slot.
            </p>

            <div
                v-for="rule in currentSlot.conditions"
                :key="rule.id"
                class="conditional-rule"
            >
                <label>Depends on Card</label>

                <select v-model.number="rule.dependsOnSlot">
                <option
                    v-for="slot in cardSlots.filter(
                    slot => slot.position !== selectedSlot
                    )"
                    :key="slot.position"
                    :value="slot.position"
                >
                    Card {{ slot.position }}
                </option>
                </select>

                <h4>Trigger When Rarity Is:</h4>

                <div
                v-for="rarity in rarities"
                :key="rarity"
                class="trigger-row"
                >
                <label>
                    <input
                    type="checkbox"
                    :value="rarity"
                    v-model="rule.triggerRarities"
                    />
                    {{ rarity }}
                </label>
                </div>

                <h4>Override Probabilities</h4>

                <div
                v-for="rarity in rarities"
                :key="rarity"
                class="rarity-row"
                >
                <label>{{ rarity }}</label>

                <input
                    v-model.number="rule.probabilities[rarity]"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                />

                <span>%</span>
                </div>

                <button
                type="button"
                class="remove-rule-button"
                @click="removeConditionalRule(rule.id)"
                >
                Remove Rule
                </button>
            </div>

            <button
                type="button"
                class="copy-button"
                @click="addConditionalRule"
            >
                Add Conditional Rule
            </button>
            </div>
    </section>

    <section class="pack-section">
        <h2>Copy Slot Settings</h2>

        <p>
            Copy Card {{ selectedSlot }}'s rarity probabilities
            to another slot or range of slots.
        </p>

        <div class="copy-range">
            <div>
            <label>Starting Slot</label>
            <input
                v-model.number="copyStart"
                type="number"
                min="1"
                :max="cardsPerPack"
            />
            </div>

            <div>
            <label>Ending Slot</label>
            <input
                v-model.number="copyEnd"
                type="number"
                min="1"
                :max="cardsPerPack"
            />
            </div>
        </div>

        <button
            type="button"
            class="copy-button"
            @click="copySlotSettings"
        >
            Copy Settings
        </button>
    </section>

    <section class="pack-section">
        <h2>Rarity Card Pools</h2>

        <div class="pool-layout">

            <!-- LEFT: Rarity pools -->
            <div class="pool-list">
            <h3>Current Card Pools</h3>

            <div
                v-for="rarity in rarities"
                :key="rarity"
                class="rarity-pool"
            >
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
                    :title="card.card_name"
                >
                    <img
                    :src="card.image_path"
                    :alt="card.card_name"
                    loading="lazy"
                    />

                    <button
                    type="button"
                    class="remove-card-button"
                    :aria-label="`Remove ${card.card_name}`"
                    @click="removeCardFromPool(card.id, rarity)"
                    >
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
                v-model="cardSearch"
                type="text"
                placeholder="Search cards..."
            />

            <label>Add Cards To:</label>

            <select v-model="selectedRarity">
                <option
                v-for="rarity in rarities"
                :key="rarity"
                :value="rarity"
                >
                {{ rarity }}
                </option>
            </select>

            <div class="search-results">
                <div
                v-for="card in filteredCards"
                :key="card.id"
                class="search-card"
                >
                <div class="card-info">
                    <img
                        :src="card.image_path"
                        :alt="card.card_name"
                        class="card-thumbnail"
                        loading="lazy"
                    />

                    <span>{{ card.card_name }}</span>
                </div>
                <button
                    type="button"
                    :disabled="isCardInPool(card.id)"
                    @click="addCardToPool(card)"
                >
                    {{ isCardInPool(card.id) ? "Added" : "Add" }}
                </button>
                </div>
            </div>
            </div>

        </div>
    </section>

    <section class="pack-section">
        <h2>Pack Simulator</h2>

        <p>
            Test your pack's rarity probabilities and card pools
            without saving the pack.
        </p>

        <button
            type="button"
            class="simulate-button"
            @click="testOpenPack"
        >
            Test Open Pack
        </button>

        <p v-if="simulationError" class="warning">
            {{ simulationError }}
        </p>

        <div v-if="pulledCards.length > 0" class="simulated-pack">
            <div
            v-for="pulled in pulledCards"
            :key="pulled.position"
            class="simulated-card"
            >
            <img
                :src="pulled.card.image_path"
                :alt="pulled.card.card_name"
            />

            <p>{{ pulled.card.card_name }}</p>

            <span class="pulled-rarity">
                {{ pulled.rarity }}
            </span>

            <small>Card {{ pulled.position }}</small>
            </div>
        </div>
    </section>
  </div>
</template>

<style scoped>
.pack-creator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  color: white;
}

.pack-section {
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid #777;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
}

.pack-section h2 {
  margin-bottom: 15px;
}

.pack-section label {
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
}

.pack-section input,
.pack-section textarea {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.slot-button {
  padding: 15px;
  border: 1px solid #777;
  background: #252525;
  color: white;
  cursor: pointer;
  border-radius: 6px;
}

.slot-button:hover {
  background: #444;
}

.slot-button.active {
  background: #365b9d;
  border-color: #82b6ff;
}

.rarity-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.rarity-row label {
  flex: 1;
  margin: 0;
}

.rarity-row input {
  width: 100px;
}

.probability-total {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #777;
}

.valid {
  color: #4caf50;
}

.invalid,
.warning {
  color: #ff6666;
}

.warning {
  margin-top: 10px;
}

.copy-range {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.copy-range > div {
  flex: 1;
}

.copy-range input {
  width: 100%;
}

.copy-button {
  margin-top: 20px;
  padding: 12px 24px;
  background: #365b9d;
  color: white;
  border: 1px solid #82b6ff;
  border-radius: 6px;
  cursor: pointer;
}

.copy-button:hover {
  background: #4774bd;
}

.pool-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 25px;
  margin-top: 20px;
}

.pool-list,
.pool-search {
  min-width: 0;
}

.rarity-pool {
  max-height: 350px;
  overflow-y: auto;
  background: #202020;
  border: 1px solid #666;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.rarity-pool h4 {
  margin: 0 0 10px;
}

.pool-card,
.search-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #444;
}

.pool-card span,
.search-card span {
  overflow-wrap: anywhere;
}

.pool-card button,
.search-card button {
  padding: 6px 12px;
  cursor: pointer;
}

.pool-search input,
.pool-search select {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.search-results {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #666;
  border-radius: 8px;
}

.search-card button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .pool-layout {
    grid-template-columns: 1fr;
  }
}

.card-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.card-thumbnail {
  width: 50px;
  height: 73px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 3px;
}

.card-info span {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.pool-card-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.pool-card-item {
  position: relative;
  min-width: 0;
}

.pool-card-item img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 421 / 614;
  object-fit: contain;
  border-radius: 3px;
}

.remove-card-button {
  position: absolute;
  top: 0;
  right: 0;

  width: 20px;
  height: 20px;
  padding: 0;

  background: rgba(180, 0, 0, 0.9);
  color: white;
  border: none;
  border-radius: 4px;

  cursor: pointer;
  font-size: 16px;
  line-height: 20px;
}

.remove-card-button:hover {
  background: red;
}

.simulate-button {
  margin-top: 15px;
  padding: 12px 24px;
  background: #365b9d;
  color: white;
  border: 1px solid #82b6ff;
  border-radius: 6px;
  cursor: pointer;
}

.simulate-button:hover {
  background: #4774bd;
}

.simulated-pack {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 15px;
  margin-top: 25px;
}

.simulated-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
  padding: 10px;
  background: #202020;
  border: 1px solid #666;
  border-radius: 8px;
}

.simulated-card img {
  width: 100%;
  max-width: 120px;
  height: auto;
  aspect-ratio: 421 / 614;
  object-fit: contain;
}

.simulated-card p {
  font-size: 13px;
  margin: 8px 0;
  overflow-wrap: anywhere;
}

.pulled-rarity {
  font-size: 12px;
  font-weight: bold;
  color: #e5c56b;
}

.simulated-card small {
  color: #aaa;
  margin-top: 5px;
}

@media (max-width: 700px) {
  .simulated-pack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.conditional-rules {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #777;
}

.conditional-rule {
  background: #202020;
  border: 1px solid #666;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.conditional-rule select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
}

.conditional-rule h4 {
  margin: 15px 0 10px;
}

.trigger-row {
  margin: 8px 0;
}

.trigger-row label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.trigger-row input {
  width: auto;
}

.remove-rule-button {
  margin-top: 15px;
  padding: 10px 15px;
  background: #922;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.remove-rule-button:hover {
  background: #c33;
}
</style>
