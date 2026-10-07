<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="title-screen">
    <h1>Yu-Gi-Oh!</h1>
    <h2>The Shadow's Light</h2>

    <RouterLink to="/login" class="start-button">
      Start
    </RouterLink>
  </main>
</template>