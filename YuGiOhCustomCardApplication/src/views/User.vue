<script setup lang="ts">
import { ref, onMounted } from "vue";

const user = ref<any>(null);
const loading = ref(true);
const error = ref("");

async function fetchUser() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/me", {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    user.value = await response.json();

    console.log(user.value);

  } catch (err) {
    console.error(err);
    error.value = "Could not load user information.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <main class="container">
    <h1>User</h1>

    <p v-if="loading">Loading user information...</p>
    <p v-else-if="error">{{ error }}</p>
    <div v-else>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Duel Points:</strong> {{ user.duel_points }}</p>
    </div>

    <RouterLink to="/home" class="nav-button">
        Home
    </RouterLink>
  </main>
</template>