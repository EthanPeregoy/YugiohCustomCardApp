
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import "../styles/user.css";

interface UserProfile {
  id: number;
  username: string;
  duel_points: number;
  job: string | null;
  role: string;
  created_at: string;
}

const user = ref<UserProfile | null>(null);
const loading = ref(true);
const error = ref("");

const formattedDate = computed(() => {
  if (!user.value?.created_at) return "Unknown";

  const date = new Date(user.value.created_at);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
});

const formattedDP = computed(() =>
  Number(user.value?.duel_points ?? 0).toLocaleString()
);

async function fetchUser() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/me",
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    user.value = await response.json();
  } catch (err) {
    console.error("Failed to load profile:", err);
    error.value = "Could not load user information.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUser);
</script>

<template>
  <main class="user-page">
    <header class="user-header">
      <h1>Duelist Profile</h1>
    </header>

    <p v-if="loading" class="user-status">
      Loading duelist profile...
    </p>

    <div v-else-if="error" class="user-status">
      <p>{{ error }}</p>
      <button type="button" @click="fetchUser">
        Try Again
      </button>
    </div>

    <template v-else-if="user">
      <section class="user-profile-card">
        <div class="user-profile-top">
          <div class="user-avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <div class="user-identity">
            <h2>{{ user.username }}</h2>
            <p>{{ user.job || "No Job Assigned" }}</p>
            <span class="user-role">
              {{ user.role }}
            </span>
          </div>
        </div>

        <div class="user-stats">
          <div class="user-stat">
            <span class="user-stat-label">
              Duel Points
            </span>
            <strong>{{ formattedDP }} DP</strong>
          </div>

          <div class="user-stat">
            <span class="user-stat-label">
              Duelist ID
            </span>
            <strong>#{{ user.id }}</strong>
          </div>
        </div>
      </section>

      <section class="user-info-card">
        <h2>Duelist Information</h2>

        <div class="user-info-row">
          <span>Username</span>
          <strong>{{ user.username }}</strong>
        </div>

        <div class="user-info-row">
          <span>Job</span>
          <strong>{{ user.job || "Unassigned" }}</strong>
        </div>

        <div class="user-info-row">
          <span>Account Role</span>
          <strong>{{ user.role }}</strong>
        </div>

        <div class="user-info-row">
          <span>Joined</span>
          <strong>{{ formattedDate }}</strong>
        </div>
      </section>

      <section class="user-navigation">
        <h2>Duelist Activities</h2>

        <div class="user-navigation-grid">
          <RouterLink
            to="/collection"
            class="user-navigation-button"
          >
            <span class="user-navigation-icon">✦</span>
            <span>My Collection</span>
            <small>View your owned cards</small>
          </RouterLink>

          <RouterLink
            to="/decks"
            class="user-navigation-button"
          >
            <span class="user-navigation-icon">▣</span>
            <span>My Decks</span>
            <small>Manage your decks</small>
          </RouterLink>
        </div>
      </section>
    </template>
  </main>
</template>