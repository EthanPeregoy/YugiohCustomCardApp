export async function createPack(packData: object) {
  const response = await fetch(
    "http://localhost:3000/api/packs",
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
    "http://localhost:3000/api/packs/artwork",
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