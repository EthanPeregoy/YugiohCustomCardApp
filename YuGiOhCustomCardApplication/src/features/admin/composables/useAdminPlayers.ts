import { ref, computed, onMounted } from "vue";
import {
  getAdminPlayers,
  type AdminPlayer,
} from "../services/adminService";

export function useAdminPlayers() {
  const players = ref<AdminPlayer[]>([]);
  const loading = ref(true);
  const error = ref("");
  const searchQuery = ref("");

  const filteredPlayers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) {
      return players.value;
    }

    return players.value.filter((player) =>
      player.username.toLowerCase().includes(query) ||
      String(player.id).includes(query)
    );
  });

  async function loadPlayers() {
    loading.value = true;
    error.value = "";

    try {
      players.value = await getAdminPlayers();
    } catch (err) {
      console.error("Failed to load players:", err);
      error.value = "Could not load players.";
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadPlayers);

  return {
    players,
    loading,
    error,
    searchQuery,
    filteredPlayers,
    loadPlayers,
  };
}