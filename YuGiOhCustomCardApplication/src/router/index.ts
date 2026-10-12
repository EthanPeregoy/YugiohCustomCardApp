import { createRouter, createWebHistory } from "vue-router";

import TitleScreenView from "@/features/auth/views/TitleScreenView.vue";
import LoginView from "@/features/auth/views/LoginView.vue";
import HomeView from "@/features/home/HomeView.vue";
import CardSearchView from "@/features/cards/CardSearchView.vue";
import CardShopView from "@/features/cardShop/CardShop.vue";
import PackShopView from "@/features/packs/shop/PackShop.vue";
import CollectionView from "@/features/collection/Collection.vue";
import DecksView from "@/features/decks/views/Decks.vue";
import DeckEditorView from "@/features/decks/views/DeckEditor.vue";
import UserView from "@/features/user/User.vue";
import PackCreator from "@/features/packs/creator/PackCreator.vue";
import PackDetailsView from "@/features/packs/details/PackDetails.vue";

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
      path: "/decks/:id",
      component: DeckEditorView,
    },
    {
      path: "/pack-creator",
      component: PackCreator,
    },
    {
      path: "/packs/:id",
      component: PackDetailsView,
    }
  ],
});

export default router;