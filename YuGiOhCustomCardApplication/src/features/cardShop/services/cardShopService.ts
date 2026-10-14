import { API_URL } from "@/global/config/api";
const API_BASE_URL = `${API_URL}/card-shop`;
import type { FilterableCard } from "@/global/utils/cardFiltering";

export interface ShopCard extends FilterableCard {
  id: number;
  image_path: string;
  rarity: string;
  price: number;
  base_price: number;
  discount_percent: number;
}

export interface PurchaseResult {
  remainingDuelPoints: number;
}

export async function getShopCards(): Promise<ShopCard[]> {
  const response = await fetch(API_BASE_URL, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to load shop cards");
  }

  return response.json();
}

export async function purchaseShopCard(
  cardId: number
): Promise<PurchaseResult> {
  const response = await fetch(
    `${API_BASE_URL}/${cardId}/purchase`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Purchase failed");
  }

  return data;
}