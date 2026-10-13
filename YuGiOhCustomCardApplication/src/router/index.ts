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
import TradeView from "@/features/trading/TradeView.vue";
import CardCreatorView from "@/features/cardCreator/CardCreatorView.vue";
import AdminDashboardView from "@/features/admin/views/AdminDashboardView.vue";
import AdminPlayerView from "@/features/admin/views/AdminPlayerView.vue";
import { getCurrentUser } from "@/features/auth/services/authService";

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
      path: "/trade",
      component: TradeView,
    },
    {
      path: "/pack-creator",
      component: PackCreator,
    },
    {
      path: "/packs/:id",
      component: PackDetailsView,
    },
    {
      path: "/card-creator",
      component: CardCreatorView,
    },
    {
      path: "/admin",
      component: AdminDashboardView,
    },
    {
      path: "/admin/players/:userId",
      component: AdminPlayerView,
      meta: { requiresAdmin: true },
    },
    {
      path: "/packs/:id/edit",
      name: "pack-edit",
      component: () => import(
        "@/features/packs/creator/PackCreator.vue"
      ),
      meta: { requiresAdmin: true }
    },

  ],
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true;

  try {
    const user = await getCurrentUser();

    if (user.role === "admin") {
      return true;
    }

    return "/home";
  } catch {
    return "/login";
  }
});

export default router;