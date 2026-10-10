<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { RouterLink, useRoute, useRouter } from "vue-router";
  import { useAuth } from "../composables/useAuth";
  import "../styles/home-page.css";

  const route = useRoute();
  const router = useRouter();

  const {
    isAdmin,
    loggingOut,
    checkAdmin,
    logoutUser
  } = useAuth();

  const shouldFadeIn = ref(route.query.transition === "login");

  onMounted(() => {
    checkAdmin();

    if (shouldFadeIn.value) {
      router.replace("/home");
    }
  });
</script>

<template>
  <main
    class="home-container"
    :class="{ 'home-screen': shouldFadeIn }"
  >
    <!-- Logout Button -->
    <button
      class="logout-button"
      type="button"
      :disabled="loggingOut"
      :title="loggingOut ? 'Logging Out...' : 'Log Out'"
      aria-label="Log Out"
      @click="logoutUser"
    >
      &times;
    </button>

    <!-- Title -->
    <header class="home-header">
      <h1 class="home-title">Welcome Duelist!</h1>

      <div class="title-divider">
        <span class="divider-diamond"></span>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="home-navigation">
      <div class="navigation-grid">
        <RouterLink to="/cards" class="home-button">
          Card Search
        </RouterLink>

        <RouterLink to="/shop" class="home-button">
          Card Shop
        </RouterLink>

        <RouterLink to="/packs" class="home-button">
          Pack Shop
        </RouterLink>

        <RouterLink to="/collection" class="home-button">
          Collection
        </RouterLink>

        <RouterLink to="/decks" class="home-button">
          Decks
        </RouterLink>

        <RouterLink to="/user" class="home-button">
          User
        </RouterLink>
      </div>

      <!-- Admin Only -->
      <RouterLink
        v-if="isAdmin"
        to="/pack-creator"
        class="home-button admin-button"
      >
        Create Pack
      </RouterLink>
    </nav>
  </main>
</template>