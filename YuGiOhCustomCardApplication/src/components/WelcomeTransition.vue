<script setup lang="ts">
defineProps<{
  username: string;
  show: boolean;
}>();
</script>

<template>
  <Transition name="login-fade">
    <div v-if="show" class="login-transition">
      <h1>Welcome, {{ username }}</h1>
      <p>Your journey awaits...</p>
    </div>
  </Transition>
</template>

<style scoped>
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