<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { RouterLink } from "vue-router";


</script>

<template>
  <main class="container">
    <h1>Welcome Duelist!</h1>

    <RouterLink to="/cards" class="nav-button">
        Card Search
    </RouterLink>
  </main>
</template>