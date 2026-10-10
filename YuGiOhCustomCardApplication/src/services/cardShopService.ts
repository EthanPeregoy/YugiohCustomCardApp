const API_BASE_URL = "http://localhost:3000/api/card-shop";

export interface ShopCard {
  id: number;
  card_name: string;
  image_path: string;
  rarity: string;
  price: number;
}

export interface PurchaseResult {
  remainingDuelPoints: number;
}

export async function getShopCards(): Promise<ShopCard[]> {
  const response = await fetch(API_BASE_URL);

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