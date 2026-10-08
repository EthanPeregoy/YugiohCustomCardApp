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