<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuth } from "@/features/auth/composables/useAuth";
  import "./styles/home-page.css";

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

    <!-- User Profile Button -->
    <RouterLink
      to="/user"
      class="profile-button"
      title="My Profile"
      aria-label="My Profile"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    </RouterLink>

    <!-- Title -->
    <header class="home-header">
      <h1 class="home-title">Welcome Duelist!</h1>

      <div class="home-divider">
        <span class="home-divider-diamond"></span>
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

        <RouterLink to="/trade" class="home-button">
          Trade
        </RouterLink>

        <!-- Admin Only -->
        <template v-if="isAdmin">
          <RouterLink
            to="/card-creator"
            class="home-button"
          >
            Card Creator
          </RouterLink>

          <RouterLink
            to="/pack-creator"
            class="home-button"
          >
            Create Pack
          </RouterLink>

          <RouterLink
            to="/admin"
            class="home-button"
          >
            DM Dashboard
          </RouterLink>
        </template>
      </div>
    </nav>

  </main>
</template>