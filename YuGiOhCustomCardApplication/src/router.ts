import { createRouter, createWebHistory } from "vue-router";

import HomeView from "./views/HomeView.vue";
import CardSearchView from "./views/CardSearchView.vue";
import CardShopView from "./views/CardShop.vue";
import PackShopView from "./views/PackShop.vue";
import CollectionView from "./views/Collection.vue";
import DecksView from "./views/Decks.vue";
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
      path: "/user",
      component: () => import("./views/User.vue"),
    },
    {
      path: "/shop",
      component: CardShopView,
    },
    {
      path: "/packs",
      component: PackShopView,
    },
    {
      path: "/collection",
      component: CollectionView,
    },
    {
      path: "/decks",
      component: DecksView,
    },
    {
      path: "/cards/:id",
      component: CardView,
    },
  ],
});

export default router;