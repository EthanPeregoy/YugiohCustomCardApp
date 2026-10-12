import type { CardTag } from "../../global/types/cardFilters";

const API_URL = "http://localhost:3000/api/collection-tags";

async function tagRequest(
  path: string,
  method: string,
  body?: unknown
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",

    headers: {
      "Content-Type": "application/json"
    },

    body: body === undefined
      ? undefined
      : JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Tag request failed"
    );
  }

  return data;
}

export async function getCollectionTags(): Promise<CardTag[]> {
  return tagRequest("", "GET");
}

export async function createCollectionTag(
  name: string,
  color: string
): Promise<CardTag> {
  return tagRequest("", "POST", { name, color });
}

export async function updateCollectionTag(
  id: number,
  name: string,
  color: string
): Promise<CardTag> {
  return tagRequest(`/${id}`, "PATCH", { name, color });
}

export async function deleteCollectionTag(
  id: number
): Promise<void> {
  await tagRequest(`/${id}`, "DELETE");
}

export async function saveCardTags(
  cardId: number,
  tagIds: number[]
): Promise<void> {
  await tagRequest(`/cards/${cardId}`, "PUT", { tagIds });
}

export async function updateCardsTags(
  cardIds: number[],
  tagIds: number[],
  action: "add" | "remove"
): Promise<void> {
  await tagRequest("/bulk", "POST", {
    cardIds,
    tagIds,
    action
  });
}