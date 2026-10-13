const API_URL = "http://localhost:3000/api/admin/collection-imports";

export const STANDARD_RARITIES = [
  "Common",
  "Rare",
  "Super Rare",
  "Ultra Rare",
  "Secret Rare",
] as const;

export type ImportStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface CollectionImport {
  id: number;
  user_id: number;
  username: string;
  status: ImportStatus;
  total_entries: number;
  total_copies: number;
  submitted_at: string;
}

export interface CollectionImportItem {
  id: number;
  import_id: number;
  card_id: number | null;
  card_name: string;
  passcode: string;
  rarity: string;
  approved_rarity: string | null;
  quantity: number;
  exists_in_pack: boolean;
  is_standard_rarity: boolean;
  requires_review: boolean;
  review_status: ReviewStatus;
}

export interface CollectionImportDetails {
  import: CollectionImport;
  cards: CollectionImportItem[];
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Collection import request failed."
    );
  }

  return data as T;
}

export async function getCollectionImports() {
  return apiRequest<CollectionImport[]>("");
}

export async function getCollectionImportDetails(
  importId: number
) {
  return apiRequest<CollectionImportDetails>(
    `/${importId}`
  );
}

export async function reviewImportItem(
  importId: number,
  itemId: number,
  decision: "approved" | "rejected",
  approvedRarity?: string
) {
  return apiRequest(
    `/${importId}/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        decision,
        approvedRarity,
      }),
    }
  );
}

export async function approveAllEligible(
  importId: number
) {
  return apiRequest(
    `/${importId}/items/approve-all`,
    { method: "POST" }
  );
}

export async function finalizeImport(
  importId: number
) {
  return apiRequest(
    `/${importId}/approve`,
    { method: "POST" }
  );
}

export async function rejectImport(
  importId: number
) {
  return apiRequest(
    `/${importId}/reject`,
    { method: "POST" }
  );
}