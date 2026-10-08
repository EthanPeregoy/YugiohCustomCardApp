<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import { RouterLink, useRoute, useRouter } from "vue-router";

    import { useAuth } from "../composables/useAuth";

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
  <main class="container"
  :class="{ 'home-screen': shouldFadeIn }">
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
    <RouterLink
        v-if="isAdmin"
        to="/pack-creator"
        class="nav-button"
        >
        Create Pack
    </RouterLink>
    <button
        class="nav-button"
        type="button"
        :disabled="loggingOut"
        @click="logoutUser"
        >
        {{ loggingOut ? "Logging Out..." : "Log Out" }}
    </button>
  </main>
</template>

<style scoped>
.home-screen {
  animation: home-fade-in 1.5s ease-in-out both;
}

@keyframes home-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

</style>