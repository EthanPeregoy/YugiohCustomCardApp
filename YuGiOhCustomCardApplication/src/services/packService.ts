const API_URL = "http://localhost:3000/api/packs";

export interface ShopPack {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  price: number;
  restricted: boolean;
}

export interface PoolCard {
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  price: number;
  restricted: boolean;
  card_pool: PoolCard[];
}

export interface PulledCard {
  slot_number: number;
  card_id: number;
  card_name: string;
  image_path: string | null;
  rarity: string;
}

interface TestPullResponse {
  cards: PulledCard[];
}

export async function getShopPacks(): Promise<ShopPack[]> {
  const response = await fetch(API_URL, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to load packs");
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : data.packs ?? [];
}

export async function createPack(packData: object) {
  const response = await fetch(
    `${API_URL}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(packData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create pack."
    );
  }

  return data;
}

export async function uploadPackArtwork(file: File) {
  const formData = new FormData();

  formData.append("artwork", file);

  const response = await fetch(
    `${API_URL}/artwork`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload pack artwork.");
  }

  return data;
}

export async function getPackDetails(
  packId: string | number
): Promise<Pack> {
  const response = await fetch(
    `${API_URL}/${packId}`,
    {
      credentials: "include"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load pack");
  }

  return response.json();
}

export async function generateTestPack(
  packId: number
): Promise<TestPullResponse> {
  const response = await fetch(
    `${API_URL}/${packId}/test-open`,
    {
      credentials: "include"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate test pack");
  }

  return response.json();
}
