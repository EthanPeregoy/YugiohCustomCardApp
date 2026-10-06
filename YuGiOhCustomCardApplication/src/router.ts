import { createRouter, createWebHistory } from "vue-router";

import HomeView from "./views/HomeView.vue";
import CardSearchView from "./views/CardSearchView.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: HomeView,
    },
    {
      path: "/cards",
      component: CardSearchView,
    },
  ],
});

export default router;