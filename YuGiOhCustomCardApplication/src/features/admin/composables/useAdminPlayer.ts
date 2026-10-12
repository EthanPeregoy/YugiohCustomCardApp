import { ref, watch, type Ref } from "vue";
import {
  getAdminPlayer,
  type AdminPlayer,
} from "../services/adminService";

export function useAdminPlayer(userId: Ref<number>) {
  const player = ref<AdminPlayer | null>(null);
  const loading = ref(true);
  const error = ref("");

  async function loadPlayer() {
    const requestedId = userId.value;

    if (!Number.isSafeInteger(requestedId) || requestedId <= 0) {
      player.value = null;
      error.value = "Invalid player ID.";
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = "";
    player.value = null;

    try {
      const result = await getAdminPlayer(requestedId);

      // Ignore an outdated response if navigation changed.
      if (userId.value !== requestedId) return;

      player.value = result;
    } catch (err) {
      if (userId.value !== requestedId) return;

      console.error("Failed to load player:", err);
      error.value = "Could not load player information.";
    } finally {
      if (userId.value === requestedId) {
        loading.value = false;
      }
    }
  }

  watch(userId, loadPlayer, { immediate: true });

  return {
    player,
    loading,
    error,
    loadPlayer,
  };
}