<script setup lang="ts">
    import { useRouter } from "vue-router";

    const router = useRouter();

    const props = withDefaults(
    defineProps<{
        destination?: string;
        useHistory?: boolean;
    }>(),
    {
        destination: "/home",
        useHistory: false
    }
    );

    function goBack() {
    if (props.useHistory && window.history.state?.back) {
        router.back();
    } else {
        router.push(props.destination);
    }
    }
</script>

<template>
  <button
    class="back-button"
    type="button"
    aria-label="Go Back"
    title="Go Back"
    @click="goBack"
  >
    &#8592;
  </button>
</template>

<style scoped>
.back-button {
  position: fixed;
  top: 20px;
  left: 25px;
  z-index: 100;

  width: 52px;
  height: 52px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 32px;
  font-weight: bold;

  color: #f4eaff;
  background: rgba(5, 3, 18, 0.92);

  border: 2px solid #b99aff;
  border-radius: 10px;

  cursor: pointer;

  box-shadow:
    0 0 8px #8a42ff,
    inset 0 0 10px rgba(138, 66, 255, 0.25);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.back-button:hover {
  transform: translateX(-3px);
  background: rgba(55, 25, 100, 0.95);

  box-shadow:
    0 0 15px #a56bff,
    0 0 30px rgba(138, 66, 255, 0.7);
}

.back-button:focus-visible {
  outline: 3px solid white;
  outline-offset: 4px;
}
</style>