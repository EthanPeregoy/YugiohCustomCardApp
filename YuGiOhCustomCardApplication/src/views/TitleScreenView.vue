
<script setup lang="ts">
  import { useTitleScreen } from "../composables/useTitleScreen";
  import WelcomeTransition from "../components/WelcomeTransition.vue";
  import "../styles/title-screen.css";

  const {
    checkingSession,
    isTransitioning,
    username,
    startApp
  } = useTitleScreen();
</script>

<template>
  <main class="title-screen galaxy-background">
    <div class="title-content">

      <!-- Game Title -->
      <div class="game-title">
        <h1>Yu-Gi-Oh!</h1>
        <h2>The Shadow's Light</h2>

        <!-- Decorative Divider -->
        <div class="title-divider">
          <span class="divider-diamond"></span>
        </div>
      </div>

      <!-- Start Button -->
      <button
        class="start-button"
        type="button"
        :disabled="checkingSession"
        @click="startApp"
      >
        {{ checkingSession ? "CONNECTING..." : "CLICK TO START" }}
      </button>

    </div>

    <WelcomeTransition
      :username="username"
      :show="isTransitioning"
    />
  </main>
</template>