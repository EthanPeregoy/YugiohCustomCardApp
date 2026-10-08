<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const route = useRoute();
const router = useRouter();

const shouldFadeIn = ref(route.query.transition === "login");

const loggingOut = ref(false);
const isAdmin = ref(false);

async function logoutUser() {
  if (loggingOut.value) return;

  loggingOut.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    await router.push("/");

  } catch (err) {
    console.error("Logout error:", err);
    alert("Could not log out. Please try again.");
  } finally {
    loggingOut.value = false;
  }
}

async function checkAdmin() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/me", {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve user");
    }

    const user = await response.json();

    isAdmin.value = user.role === "admin";
  } catch (err) {
    console.error("Admin check error:", err);
    isAdmin.value = false;
  }
}

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