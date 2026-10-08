import { createRouter, createWebHistory } from "vue-router";

import TitleScreenView from "../views/TitleScreenView.vue";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import CardSearchView from "../views/CardSearchView.vue";
import CardView from "../views/CardView.vue";
import CardShopView from "../views/CardShop.vue";
import PackShopView from "../views/PackShop.vue";
import CollectionView from "../views/Collection.vue";
import DecksView from "../views/Decks.vue";
import UserView from "../views/User.vue";
import PackCreator from "../views/PackCreator.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: TitleScreenView,
    },{
      path: "/login",
      component: LoginView,
    },
    {
      path: "/home",
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
    {
      path: "/user",
      component: UserView,
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
      path: "/pack-creator",
      component: PackCreator,
    }
  ],
});

export default router;