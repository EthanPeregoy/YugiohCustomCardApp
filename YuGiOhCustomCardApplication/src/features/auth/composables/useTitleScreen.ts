import { ref } from "vue";
import { useRouter } from "vue-router";
import { checkSession } from "../services/authService";

export function useTitleScreen() {
  const router = useRouter();

  const checkingSession = ref(false);
  const isTransitioning = ref(false);
  const username = ref("");

  async function startApp() {
    if (checkingSession.value) return;

    checkingSession.value = true;

    try {
      const user = await checkSession();

      if (user) {
        username.value = user.username;

        // Play the welcome transition.
        isTransitioning.value = true;

        await new Promise<void>((resolve) =>
          setTimeout(resolve, 3000)
        );

        await router.push({
          path: "/home",
          query: { transition: "login" }
        });
      } else {
        // No active session: go to Login.
        await router.push("/login");
      }
    } catch (err) {
      console.error("Error checking session:", err);

      alert(
        "Unable to connect to the server. Please try again."
      );

      isTransitioning.value = false;
    } finally {
      checkingSession.value = false;
    }
  }

  return {
    checkingSession,
    isTransitioning,
    username,
    startApp
  };
}