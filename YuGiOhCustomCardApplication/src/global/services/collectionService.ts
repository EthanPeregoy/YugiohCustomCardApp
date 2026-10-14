import type { FilterableCard } from "../utils/cardFiltering";
import type { CardTag } from "../types/cardFilters";

import { API_URL as BASE_API_URL } from "@/global/config/api";

const API_URL = `${BASE_API_URL}/collections`;

export interface CollectionCard extends FilterableCard {
  id: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  card_type: string;
  frame_type: string;
  rarity: string;
  quantity: number;
  obtained_at: string | null;
  tags: CardTag[];
}

export interface CardSaleResult {
  message: string;
  cardId: number;
  cardName: string;
  rarity: string;
  quantitySold: number;
  pricePerCopy: number;
  earnedDP: number;
  remainingOwned: number;
  remainingDuelPoints: number;

  affectedDecks: {
    id: number;
    name: string;
    removedCopies: number;
  }[];
}

export async function getCollection(): Promise<CollectionCard[]> {
  const response = await fetch(
    `${API_URL}`,
    {
      credentials: "include"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve collection");
  }

  return response.json();
}

export async function sellCollectionCard(
  collectionId: number,
  quantity: number
): Promise<CardSaleResult> {
  const response = await fetch(
    `${API_URL}/${collectionId}/sell`,
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ quantity })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to sell cards"
    );
  }

  return data;
}