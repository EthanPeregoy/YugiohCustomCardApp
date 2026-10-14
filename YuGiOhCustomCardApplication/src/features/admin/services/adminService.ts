export interface AdminPlayer {
  id: number;
  username: string;
  duel_points: number;
  role: string;
  job: string | null;
  created_at: string;
}

import { API_URL } from "@/global/config/api";

const ADMIN_URL = `${API_URL}/admin`;

export async function getAdminPlayers(): Promise<AdminPlayer[]> {
  const response = await fetch(`${ADMIN_URL}/players`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve players (${response.status})`);
  }

  return response.json();
}

export async function getAdminPlayer(
  userId: number
): Promise<AdminPlayer> {
  const response = await fetch(`${ADMIN_URL}/players/${userId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve player (${response.status})`);
  }

  return response.json();
}

export async function updatePlayerJob(
  userId: number,
  job: string
): Promise<Pick<AdminPlayer, "id" | "username" | "job">> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/job`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to update player job"
    );
  }

  return response.json();
}

export type DuelPointAction = "award" | "remove";

export interface DuelPointAdjustment {
  id: number;
  username: string;
  duel_points: number;
}

export async function adjustPlayerDuelPoints(
  userId: number,
  action: DuelPointAction,
  amount: number
): Promise<DuelPointAdjustment> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/duel-points`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        amount,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to adjust Duel Points"
    );
  }

  return response.json();
}

import type { CollectionCard } from "@/global/services/collectionService";

export async function getAdminPlayerCollection(
  userId: number
): Promise<CollectionCard[]> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/collection`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve player collection (${response.status})`
    );
  }

  return response.json();
}

export type CollectionEditAction = "add" | "remove";

export interface CollectionEditResult {
  success: boolean;
  action: CollectionEditAction;
  card_id: number;
  rarity: string;
  quantity: number;
}

export async function editPlayerCollection(
  userId: number,
  action: CollectionEditAction,
  cardId: number,
  rarity: string,
  quantity: number
): Promise<CollectionEditResult> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/collection`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        cardId,
        rarity,
        quantity,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to edit player collection"
    );
  }

  return response.json();
}

import type {
  Deck,
  DeckDetails
} from "@/features/decks/services/deckService";

export async function getAdminPlayerDecks(
  userId: number
): Promise<Deck[]> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/decks`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve player decks");
  }

  return response.json();
}

export async function getAdminPlayerDeck(
  userId: number,
  deckId: number
): Promise<DeckDetails> {
  const response = await fetch(
    `${ADMIN_URL}/players/${userId}/decks/${deckId}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve player deck");
  }

  return response.json();
}