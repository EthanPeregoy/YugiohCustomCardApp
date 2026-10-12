<script setup lang="ts">
import { computed } from "vue";
import "../styles/pagination.css";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (event: "change-page", page: number): void;
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];

  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.totalPages, props.currentPage + 2);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return pages;
});

function goToPage(page: number) {
  if (page < 1 || page > props.totalPages) return;

  emit("change-page", page);
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="pagination"
    aria-label="Page navigation"
  >
    <button
      type="button"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      ← Previous
    </button>

    <button
      v-if="visiblePages[0] > 1"
      type="button"
      @click="goToPage(1)"
    >
      1
    </button>

    <span v-if="visiblePages[0] > 2">...</span>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      :class="{ active: page === currentPage }"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <span
      v-if="visiblePages[visiblePages.length - 1] < totalPages - 1"
    >
      ...
    </span>

    <button
      v-if="visiblePages[visiblePages.length - 1] < totalPages"
      type="button"
      @click="goToPage(totalPages)"
    >
      {{ totalPages }}
    </button>

    <button
      type="button"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      Next →
    </button>
  </nav>
</template>