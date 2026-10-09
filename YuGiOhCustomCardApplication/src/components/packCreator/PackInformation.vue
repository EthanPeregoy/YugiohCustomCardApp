<script setup lang="ts">
    const packName = defineModel<string>("packName", {
        required: true
    });

    const packDescription = defineModel<string>("packDescription", {
        required: true
    });

    const packPrice = defineModel<number>("packPrice", {
        required: true
    });
    const packRestricted = defineModel<boolean>("packRestricted", {
        required: true
    });

    const cardsPerPack = defineModel<number>("cardsPerPack", {
        required: true
    });

    const emit = defineEmits<{
        (event: "updateCardCount"): void;
    }>();
</script>

<template>
  <section class="pack-section">
    <h2>Pack Information</h2>

    <label for="pack-name">Pack Name</label>
    <input
      id="pack-name"
      v-model="packName"
      type="text"
      placeholder="Enter pack name"/>

    <label for="pack-description">Description</label>
    <textarea
      id="pack-description"
      v-model="packDescription"
      placeholder="Enter pack description"></textarea>

    <label for="pack-price">Pack Price</label>
    <input
      id="pack-price"
      v-model.number="packPrice"
      type="number"
      min="0"/>
      <label class="restricted-option" for="pack-restricted">
        <input
          id="pack-restricted"
          v-model="packRestricted"
          type="checkbox"
        />

        <span class="restricted-option-text">
          <strong>Restricted Pack</strong>
          <small>
            Mark this pack as restricted for players.
          </small>
        </span>
      </label>

    <label for="cards-per-pack">Cards Per Pack</label>
    <input
      id="cards-per-pack"
      v-model.number="cardsPerPack"
      type="number"
      min="1"
      max="100"
      @change="emit('updateCardCount')"/>
  </section>
</template>

<style scoped>
.restricted-option {
  display: flex;
  align-items: center;
  gap: 14px;

  width: 100%;
  box-sizing: border-box;
  padding: 16px 20px;
  margin: 12px 0 20px;

  background: rgba(35, 20, 65, 0.65);
  border: 1px solid rgba(181, 138, 255, 0.45);
  border-radius: 10px;

  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.restricted-option:hover {
  background: rgba(60, 35, 100, 0.75);
  border-color: #b58aff;
}

.restricted-option input[type="checkbox"] {
  appearance: auto;

  width: 20px;
  height: 20px;
  min-width: 20px;

  margin: 0;
  padding: 0;

  flex: 0 0 auto;
  accent-color: #b58aff;
  cursor: pointer;
  box-shadow: none;
}

.restricted-option-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.restricted-option-text strong {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.restricted-option-text small {
  font-size: 0.85rem;
  color: #c9b9df;
}
</style>