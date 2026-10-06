<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { RouterLink } from "vue-router";


const greetMsg = ref("");
const name = ref("");

async function greet() {
  greetMsg.value = await invoke("greet", { name: name.value });
}
</script>

<template>
  <main class="container">
    <h1>Welcome Duelist!</h1>

    <form class="row" @submit.prevent="greet">
      <input
        id="greet-input"
        v-model="name"
        placeholder="Enter a name..."
      />
      <button type="submit">Greet</button>
    </form>

    <p>{{ greetMsg }}</p>

    <RouterLink to="/cards" class="nav-button">
        Card Search
    </RouterLink>
  </main>
</template>