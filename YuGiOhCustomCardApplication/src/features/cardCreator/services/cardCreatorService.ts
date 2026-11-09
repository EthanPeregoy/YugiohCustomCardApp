import { API_URL } from "@/global/config/api";
const API_BASE_URL = `${API_URL}/cards`;

export async function uploadCardImage(image: Blob): Promise<string> {
  const formData = new FormData();

  formData.append("image", image, "custom-card.png");

  const response = await fetch(`${API_BASE_URL}/image`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));

    throw new Error(result.error || "Failed to upload card image.");
  }

  const result = await response.json();

  return result.image_path;
}

export interface CreateCardPayload {
  card_name: string;
  card_type: string;
  card_subtype: string;
  frame_type: string;
  description: string;
  image_path: string;
  attribute?: string | null;
  atk?: string | null;
  def?: string | null;
  level?: number | null;
  link_value?: number | null;
}

export async function createCustomCard(
  card: CreateCardPayload
) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(card)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Failed to create custom card.");
  }

  return result;
}