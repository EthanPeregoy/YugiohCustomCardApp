import { ref } from "vue";
import { useRouter } from "vue-router";
import { getCurrentUser, logout } from "../services/authService";

export function useAuth() {
  const router = useRouter();
  const isAdmin = ref(false);
  const loggingOut = ref(false);

  async function checkAdmin() {
    try {
      const user = await getCurrentUser();

      isAdmin.value = user.role === "admin";
    } catch (err) {
      console.error("Admin check error:", err);
      isAdmin.value = false;
    }
  }

  async function logoutUser() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
      await logout();
      await router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Could not log out. Please try again.");
    } finally {
      loggingOut.value = false;
    }
  }

  return {
    isAdmin,
    loggingOut,
    checkAdmin,
    logoutUser
  };
}
