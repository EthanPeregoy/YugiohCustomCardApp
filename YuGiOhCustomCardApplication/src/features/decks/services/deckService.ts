const API_URL = "http://localhost:3000/api/decks";

export interface Deck {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  total_cards: number;
}

export interface DeckCard {
  card_id: number;
  card_name: string;
  image_path: string | null;
  card_type: string;
  frame_type: string;
  deck_section: "main" | "extra" | "side";
  quantity: number;
}

export interface DeckDetails {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  cards: DeckCard[];
}

export interface SaveDeckCard {
  card_id: number;
  deck_section: "main" | "extra" | "side";
  quantity: number;
}

// Retrieve all decks
export async function getDecks(): Promise<Deck[]> {
  const response = await fetch(API_URL, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve decks");
  }

  return response.json();
}

// Retrieve one deck
export async function getDeck(
  deckId: number
): Promise<DeckDetails> {
  const response = await fetch(`${API_URL}/${deckId}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve deck");
  }

  return response.json();
}

// Create a deck
export async function createDeck(
  name: string
): Promise<Deck> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error("Failed to create deck");
  }

  const data = await response.json();
  return data.deck;
}

// Rename a deck
export async function renameDeck(
  deckId: number,
  name: string
): Promise<Deck> {
  const response = await fetch(`${API_URL}/${deckId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error("Failed to rename deck");
  }

  const data = await response.json();
  return data.deck;
}

// Delete a deck
export async function deleteDeck(
  deckId: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${deckId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to delete deck");
  }
}

// Save deck contents
export async function saveDeckCards(
  deckId: number,
  cards: SaveDeckCard[]
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${deckId}/cards`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ cards })
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to save deck cards"
    );
  }
}
