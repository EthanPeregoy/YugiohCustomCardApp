<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const checkingSession = ref(false);
const isTransitioning = ref(false);
const username = ref("");

async function startApp() {
  if (checkingSession.value) return;

  checkingSession.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/auth/me", {
      credentials: "include"
    });

    if (response.ok) {
      const user = await response.json();

      username.value = user.username;

      // Play the welcome transition
      isTransitioning.value = true;

      await new Promise(resolve => setTimeout(resolve, 3000));

      await router.push({
        path: "/home",
        query: { transition: "login" }
      });

    } else if (response.status === 401) {
      // No active session: go straight to Login
      await router.push("/login");

    } else {
      throw new Error(`Session check failed: ${response.status}`);
    }

  } catch (error) {
    console.error("Error checking session:", error);
    alert("Unable to connect to the server. Please try again.");

    isTransitioning.value = false;
  } finally {
    checkingSession.value = false;
  }
}
</script>

<template>
  <main
    class="title-screen galaxy-background"
  >
    <div class="title-content">
        <div class="game-title">
            <h1>Yu-Gi-Oh!</h1>
            <h2>The Shadow's Light</h2>
        </div>

        <button
            class="start-button"
            :disabled="checkingSession"
            @click="startApp"
            >
            {{ checkingSession ? "CONNECTING..." : "CLICK TO START" }}
        </button>
    </div>
    <Transition name="login-fade">
        <div v-if="isTransitioning" class="login-transition">
            <h1>Welcome, {{ username }}</h1>
            <p>Your journey awaits...</p>
        </div>
    </Transition>
  </main>
</template>

<style scoped>
.title-screen {
  position: fixed;
  inset: 0;

  background-size: cover;
  background-position: center;

  display: flex;
  justify-content: center;
  align-items: center;
}

.title-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-title {
  text-align: center;
}

.game-title h1 {
  margin: 0;
  font-size: 5rem;
  line-height: 1;

  color: white;

  text-shadow:
    0 0 8px black,
    0 0 16px black,
    0 0 30px rgba(0, 0, 0, 0.9);
}

.game-title h2 {
  margin: 0.75rem 0 0;
  font-size: 2rem;

  color: white;

  text-shadow:
    0 0 6px black,
    0 0 14px black;
}

.start-button {
  margin-top: 6rem;
  padding: 0.8rem 2.5rem;

  background: rgba(0, 0, 0, 0.45);

  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;

  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 0.15rem;

  text-shadow: 0 0 8px black;

  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.1);

  cursor: pointer;

  animation: pulse 1.5s ease-in-out infinite;

  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.start-button:hover {
  background: rgba(0, 0, 0, 0.85);

  box-shadow:
    0 0 15px rgba(255, 255, 255, 0.7),
    0 0 30px rgba(255, 255, 255, 0.3);

  transform: scale(1.05);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0.65;
  }
}

.login-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: rgba(0, 0, 0, 0.97);
  color: white;
}

.login-transition h1 {
  position: static;
  padding: 0;
  margin: 0;

  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(180, 130, 255, 0.9);

  animation: welcome-glow 2s ease-in-out infinite alternate;
}

.login-transition p {
  color: #bbb;
  margin-top: 1rem;
  letter-spacing: 2px;
}

.login-fade-enter-active {
  transition: opacity 1s ease-in-out;
}

.login-fade-enter-from {
  opacity: 0;
}

.login-fade-enter-to {
  opacity: 1;
}

@keyframes welcome-glow {
  from {
    text-shadow: 0 0 10px rgba(180, 130, 255, 0.4);
  }

  to {
    text-shadow: 0 0 30px rgba(180, 130, 255, 1);
  }
}
</style>