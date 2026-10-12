<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAdminPlayer } from "../composables/useAdminPlayer";
import "../styles/admin-player.css";
import EditPlayerJobModal from "../components/EditPlayerJobModal.vue";
import "../styles/admin-modal.css";
import ManageDuelPointsModal from "../components/ManageDuelPointsModal.vue";
import AdminPlayerCollection from "../components/AdminPlayerCollection.vue";
import "../styles/admin-collection.css";
import AdminPlayerDecks from "../components/AdminPlayerDecks.vue";

type PlayerTab = "profile" | "collection" | "decks";

const route = useRoute();

const userId = computed(() => Number(route.params.userId));

const {
  player,
  loading,
  error,
  loadPlayer,
} = useAdminPlayer(userId);

const activeTab = ref<PlayerTab>("profile");

const showEditJobModal = ref(false);

const showDuelPointsModal = ref(false);

function handleDuelPointsSaved(newBalance: number) {
  if (player.value) {
    player.value.duel_points = newBalance;
  }

  showDuelPointsModal.value = false;
}

function handleJobSaved(job: string | null) {
  if (player.value) {
    player.value.job = job;
  }

  showEditJobModal.value = false;
}

const formattedDate = computed(() => {
  if (!player.value?.created_at) return "Unknown";

  const date = new Date(player.value.created_at);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString();
});
</script>

<template>
  <main class="admin-player-page">
    <RouterLink to="/admin" class="admin-player-back">
      ← Back to DM Dashboard
    </RouterLink>

    <div v-if="loading" class="admin-player-message">
      Loading player...
    </div>

    <div v-else-if="error" class="admin-player-message">
      <p>{{ error }}</p>
      <button @click="loadPlayer">Retry</button>
    </div>

    <template v-else-if="player">
      <header class="admin-player-header">
        <div class="admin-player-header-avatar">
          {{ player.username.charAt(0).toUpperCase() }}
        </div>

        <div>
          <h1>{{ player.username }}</h1>
          <p>
            Duelist #{{ player.id }}
            · {{ player.role === "admin" ? "Dungeon Master" : "Player" }}
          </p>
        </div>
      </header>

      <nav class="admin-player-tabs" aria-label="Player details">
        <button
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>

        <button
          :class="{ active: activeTab === 'collection' }"
          @click="activeTab = 'collection'"
        >
          Collection
        </button>

        <button
          :class="{ active: activeTab === 'decks' }"
          @click="activeTab = 'decks'"
        >
          Decks
        </button>
      </nav>

      <section
        v-if="activeTab === 'profile'"
        class="admin-player-panel"
      >
        <h2>Player Profile</h2>

        <div class="admin-player-detail">
          <span>Username</span>
          <strong>{{ player.username }}</strong>
        </div>

        <div class="admin-player-detail">
          <span>Duelist ID</span>
          <strong>{{ player.id }}</strong>
        </div>

        <div class="admin-player-detail">
          <span>Role</span>
          <strong>
            {{ player.role === "admin" ? "Dungeon Master" : "Player" }}
          </strong>
        </div>

        <div class="admin-player-detail">
            <span>Job</span>

            <div class="admin-job-controls">
                <strong>{{ player.job || "No Job Assigned" }}</strong>

                <button
                class="admin-edit-job-button"
                @click="showEditJobModal = true"
                >
                Edit Job
                </button>
            </div>
        </div>

        <div class="admin-player-detail">
          <span>Account Created</span>
          <strong>{{ formattedDate }}</strong>
        </div>

        <div class="admin-player-dp-section">
          <div>
            <h3>Duel Points</h3>
            <p>{{ player.duel_points.toLocaleString() }} DP</p>
          </div>

          <button @click="showDuelPointsModal = true">
            Manage Duel Points
          </button>
        </div>
      </section>

      <section
        v-else-if="activeTab === 'collection'"
        class="admin-player-panel"
      >
        <AdminPlayerCollection :user-id="player.id" :username="player.username"/>
      </section>

      <AdminPlayerDecks
        v-if="activeTab === 'decks'"
        :user-id="player.id"
      />
    </template>

    <EditPlayerJobModal
        v-if="showEditJobModal && player"
        :user-id="player.id"
        :username="player.username"
        :current-job="player.job"
        @close="showEditJobModal = false"
        @saved="handleJobSaved"
    />

    <ManageDuelPointsModal
        v-if="showDuelPointsModal && player"
        :user-id="player.id"
        :username="player.username"
        :current-points="player.duel_points"
        @close="showDuelPointsModal = false"
        @saved="handleDuelPointsSaved"
    />

  </main>
</template>