import { computed, ref, watch, type Ref } from "vue";

export function usePagination<T>(
  items: Ref<T[]>,
  pageSize: Ref<number>
) {
  const currentPage = ref(1);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(items.value.length / pageSize.value))
  );

  const displayedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;

    return items.value.slice(start, end);
  });

  function changePage(page: number) {
    if (page < 1 || page > totalPages.value) return;

    currentPage.value = page;
  }

  function resetPage() {
    currentPage.value = 1;
  }

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages;
    }
  });

  return {
    currentPage,
    totalPages,
    displayedItems,
    changePage,
    resetPage
  };
}