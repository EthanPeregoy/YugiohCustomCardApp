const API_URL = "http://localhost:3000/api/collections";

export interface CollectionImportSubmission {
  message?: string;
  importId: number;
  totalEntries?: number;
  totalCopies?: number;
  flaggedEntries?: number;
}

export async function submitCollectionImport(
  file: File
): Promise<CollectionImportSubmission> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/import/submit`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Failed to submit collection import."
    );
  }

  return data;
}