import { createRouter, createWebHistory } from "vue-router";

import HomeView from "./views/HomeView.vue";
import CardSearchView from "./views/CardSearchView.vue";
import CardView from "./views/CardView.vue";

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
    {
      path: "/cards/:id",
      component: CardView,
    },
  ],
});

export default router;