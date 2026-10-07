<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const route = useRoute();
const router = useRouter();

const shouldFadeIn = ref(route.query.transition === "login");

onMounted(() => {
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
    <RouterLink to="/" class="nav-button">
        Log Out
    </RouterLink>
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