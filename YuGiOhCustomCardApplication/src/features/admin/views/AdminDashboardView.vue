<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAdminPlayers } from "../composables/useAdminPlayers";
import CollectionImportRequests from "../components/CollectionImportRequests.vue";
import "../styles/admin-dashboard.css";

const router = useRouter();

const {
  loading,
  error,
  searchQuery,
  filteredPlayers,
  loadPlayers,
} = useAdminPlayers();

function viewPlayer(userId: number) {
  router.push(`/admin/players/${userId}`);
}
</script>

<template>
  <main class="admin-dashboard">
    <header class="admin-dashboard-header">
      <h1>DM Dashboard</h1>
    </header>

    <CollectionImportRequests />

    <section class="admin-player-panel">
      <div class="admin-player-toolbar">
        <h2>Player Directory</h2>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by username or ID..."
          class="admin-player-search"
        />
      </div>

      <p v-if="loading" class="admin-message">
        Loading players...
      </p>

      <div v-else-if="error" class="admin-message">
        <p>{{ error }}</p>
        <button @click="loadPlayers">Retry</button>
      </div>

      <p
        v-else-if="filteredPlayers.length === 0"
        class="admin-message"
      >
        No players found.
      </p>

      <div v-else class="admin-player-list">
        <div
          v-for="player in filteredPlayers"
          :key="player.id"
          class="admin-player-card"
        >
          <div class="admin-player-avatar">
            {{ player.username.charAt(0).toUpperCase() }}
          </div>

          <div class="admin-player-info">
            <h3>{{ player.username }}</h3>
            <p>
              Duelist #{{ player.id }}
              <span class="admin-player-role">
                {{ player.role === "admin" ? "DM" : "Player" }}
              </span>
            </p>
          </div>

          <div class="admin-player-points">
            {{ player.duel_points.toLocaleString() }} DP
          </div>

          <button
            class="admin-view-button"
            @click="viewPlayer(player.id)"
          >
            View Player
          </button>
        </div>
      </div>
    </section>
  </main>
</template>