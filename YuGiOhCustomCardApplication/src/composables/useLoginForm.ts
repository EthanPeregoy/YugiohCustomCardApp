import { ref } from "vue";
import { useRouter } from "vue-router";
import { login, register } from "../services/authService";

export function useLoginForm() {
  const router = useRouter();

  const username = ref("");
  const password = ref("");

  const error = ref("");
  const success = ref("");
  const loading = ref(false);

  const isRegistering = ref(false);
  const isTransitioning = ref(false);

  function toggleForm() {
    if (loading.value || isTransitioning.value) return;

    isRegistering.value = !isRegistering.value;

    username.value = "";
    password.value = "";
    error.value = "";
    success.value = "";
  }

  async function registerUser() {
    if (loading.value) return;

    error.value = "";
    success.value = "";
    loading.value = true;

    try {
      await register(username.value, password.value);

      success.value =
        "Account created successfully! You can now log in.";

      isRegistering.value = false;
      password.value = "";
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Registration failed.";
    } finally {
      loading.value = false;
    }
  }

  async function loginUser() {
    if (loading.value || isTransitioning.value) return;

    error.value = "";
    success.value = "";
    loading.value = true;

    try {
      await login(username.value, password.value);

      isTransitioning.value = true;

      // Preserve the existing 3-second welcome transition.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, 3000)
      );

      await router.push({
        path: "/home",
        query: { transition: "login" }
      });
    } catch (err) {
      isTransitioning.value = false;

      error.value =
        err instanceof Error
          ? err.message
          : "Login failed.";
    } finally {
      loading.value = false;
    }
  }

  return {
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
  };
}