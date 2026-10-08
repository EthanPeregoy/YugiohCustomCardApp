<script setup lang="ts">
    import { useLoginForm } from "../composables/useLoginForm";
    import WelcomeTransition from "../components/WelcomeTransition.vue";

    const {
    router,
    username,
    password,
    error,
    success,
    loading,
    isRegistering,
    isTransitioning,
    toggleForm,
    registerUser,
    loginUser
    } = useLoginForm();
</script>

<template>
  <main class="login-screen galaxy-background">
    <div class="login-panel">
      <h1>
        {{ isRegistering ? "Create Account" : "Welcome Duelist" }}
      </h1>

      <p class="login-subtitle">
        {{
          isRegistering
            ? "Begin your journey as a duelist."
            : "Enter the world of The Shadow's Light."
        }}
      </p>

      <form
        class="login-form"
        @submit.prevent="isRegistering ? registerUser() : loginUser()"
        >
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Enter your username"
          autocomplete="username"
          required
        />

        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          :autocomplete="isRegistering ? 'new-password' : 'current-password'"
          required
        />

        <button
        class="submit-button"
        type="submit"
        :disabled="loading"
        >
        {{
            loading
            ? "Please wait..."
            : isRegistering
                ? "Create Account"
                : "Login"
        }}
        </button>
      </form>

      <p v-if="error" class="error-message">
          {{ error }}
      </p>

      <p v-if="success" class="success-message">
          {{ success }}
      </p>

      <button class="toggle-button" type="button" @click="toggleForm">
        {{
          isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"
        }}
      </button>

      <button
        class="back-button"
        type="button"
        @click="router.push('/')"
      >
        Back to Title
      </button>
    </div>

    <WelcomeTransition
      :username="username"
      :show="isTransitioning"
    />
  </main>
</template>

<style scoped>
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-panel {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;

  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;

  box-shadow:
    0 0 25px rgba(0, 0, 0, 0.7),
    0 0 15px rgba(255, 255, 255, 0.15);

  color: white;
  text-align: center;
}

.login-panel h1 {
  position: static;
  padding-top: 0;
  margin: 0 0 1rem;
  font-size: 2rem;
}

.login-subtitle {
  color: #ccc;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.login-form input {
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.65);
  color: white;

  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
}

.login-form input:focus {
  border-color: white;
}

.submit-button {
  margin-top: 1rem;
  padding: 0.9rem;

  background: rgba(50, 35, 100, 0.85);
  color: white;
  font-weight: bold;

  border: 1px solid rgba(180, 150, 255, 0.6);

  transition: background 0.2s, transform 0.2s;
}

.submit-button:hover {
  background: rgba(90, 60, 160, 0.95);
  transform: translateY(-2px);
}

.toggle-button,
.back-button {
  display: block;
  margin: 1.25rem auto 0;

  background: transparent;
  color: #ddd;
  border: none;
  box-shadow: none;
}

.toggle-button:hover,
.back-button:hover {
  color: white;
  text-decoration: underline;
}

.back-button {
  font-size: 0.85rem;
  opacity: 0.7;
}

.error-message {
  color: #ff7777;
  margin-top: 1rem;
}

.success-message {
  color: #77ffbb;
  margin-top: 1rem;
}
</style>