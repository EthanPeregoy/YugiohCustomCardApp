<script setup lang="ts">
    import { useLoginForm } from "../composables/useLoginForm";
    import WelcomeTransition from "../components/WelcomeTransition.vue";
    import "../styles/login.css";

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
