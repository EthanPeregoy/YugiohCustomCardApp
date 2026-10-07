<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function startApp() {
  router.push("/login");
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

      <button class="start-button" @click="startApp">
        CLICK TO START
      </button>
    </div>
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
</style>