<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";

import BackButton from "./global/components/BackButton.vue";

const route = useRoute();

// Pages that should NOT display a back button
const hiddenBackButtonRoutes = [
  "/",
  "/login",
  "/home"
];

// Determine whether to show the back button
const showBackButton = computed(() => {
  return !hiddenBackButtonRoutes.includes(route.path);
});

// Determine where the back button should lead
const backDestination = computed(() => {
  // Deck Editor returns to My Decks
  if (route.matched.some(record => record.path === "/decks/:id")) {
    return "/decks";
  }
  // Pack Details should return to Pack Shop
  if (route.matched.some(record => record.path === "/packs/:id")) {
    const search = route.query.search;
    const page = route.query.page;

    const params = new URLSearchParams();

    if (typeof search === "string" && search) {
      params.set("search", search);
    }

    if (typeof page === "string" && page) {
      params.set("page", page);
    }

    const queryString = params.toString();

    return queryString
      ? `/packs?${queryString}`
      : "/packs";
  }

  // Every other page returns Home
  return "/home";
});
</script>

<template>
  <BackButton
    v-if="showBackButton"
    :destination="backDestination"
  />

  <RouterView />
</template>