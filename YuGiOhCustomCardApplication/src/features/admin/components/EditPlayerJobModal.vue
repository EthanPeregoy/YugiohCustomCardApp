<script setup lang="ts">
import { ref, watch } from "vue";
import { updatePlayerJob } from "../services/adminService";

const props = defineProps<{
  userId: number;
  username: string;
  currentJob: string | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [job: string | null];
}>();

const job = ref("");
const saving = ref(false);
const error = ref("");

watch(
  () => props.currentJob,
  (value) => {
    job.value = value ?? "";
  },
  { immediate: true }
);

async function saveJob() {
  if (saving.value) return;

  error.value = "";

  if (job.value.trim().length > 100) {
    error.value = "Job cannot exceed 100 characters.";
    return;
  }

  saving.value = true;

  try {
    const result = await updatePlayerJob(
      props.userId,
      job.value.trim()
    );

    emit("saved", result.job);
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to update job.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="admin-modal-overlay" @click.self="emit('close')">
    <div
      class="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-job-title"
    >
      <h2 id="edit-job-title">Edit Player Job</h2>

      <p>
        Updating job for
        <strong>{{ username }}</strong>
      </p>

      <form @submit.prevent="saveJob">
        <label for="admin-job-input">Job Name</label>

        <input
          id="admin-job-input"
          v-model="job"
          type="text"
          maxlength="100"
          placeholder="Enter player job..."
          :disabled="saving"
          autofocus
        />

        <p v-if="error" class="admin-modal-error">
          {{ error }}
        </p>

        <div class="admin-modal-actions">
          <button
            type="button"
            class="admin-modal-cancel"
            :disabled="saving"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="admin-modal-save"
            :disabled="saving"
          >
            {{ saving ? "Saving..." : "Save Job" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>