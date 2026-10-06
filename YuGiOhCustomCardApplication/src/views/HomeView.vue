<script setup lang="ts">
import { RouterLink } from "vue-router";


</script>

<template>
  <main class="container">
    <h1>Welcome Duelist!</h1>

    <RouterLink to="/cards" class="nav-button">
        Card Search
    </RouterLink>
    <RouterLink to="/shop" class="nav-button">
        Card Shop
    </RouterLink>
    <RouterLink to="/packs" class="nav-button">
        Pack Shop
    </RouterLink>
    <RouterLink to="/collection" class="nav-button">
        Collection
    </RouterLink>
    <RouterLink to="/decks" class="nav-button">
        Decks
    </RouterLink>
    <RouterLink to="/user" class="nav-button">
        User
    </RouterLink>
  </main>
</template>