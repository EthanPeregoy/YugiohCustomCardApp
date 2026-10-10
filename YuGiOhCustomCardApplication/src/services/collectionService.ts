const API_URL = "http://localhost:3000/api/collections";

export interface CollectionCard {
  id: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  card_type: string;
  frame_type: string;
  rarity: string;
  quantity: number;
  obtained_at: string | null;
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