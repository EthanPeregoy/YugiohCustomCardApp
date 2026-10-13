const API_URL = "http://localhost:3000/api/decks";

export interface Deck extends DeckCoverSettings {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  total_cards: number;
  main_count: number;
  extra_count: number;
  side_count: number;
  cover_image_path: string | null;
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

export interface DeckDetails extends DeckCoverSettings {
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

export interface DeckCoverSettings {
  cover_card_id: number | null;
  cover_position_x: number;
  cover_position_y: number;
  cover_zoom: number;
  cover_rotation: number;
}

export type SaveDeckCover = DeckCoverSettings;

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

export async function saveDeckCover(
  deckId: number,
  settings: SaveDeckCover
): Promise<DeckCoverSettings> {
  const response = await fetch(
    `${API_URL}/${deckId}/cover`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(settings)
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to save deck cover"
    );
  }

  return response.json();
}


export interface DeckExportResult {
  exportedCount: number;
  skippedCount: number;
}

export async function exportDeckYdk(
  deckId: number,
  deckName: string
): Promise<DeckExportResult> {
  const response = await fetch(`${API_URL}/${deckId}/export`, {
    credentials: "include"
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to export deck");
  }

  const exportedCount = Number(
    response.headers.get("X-Exported-Cards") ?? 0
  );

  const skippedCount = Number(
    response.headers.get("X-Skipped-Cards") ?? 0
  );

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const safeName =
    deckName
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 80) || `deck_${deckId}`;

  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}.ydk`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { exportedCount, skippedCount };
}