const API_URL = "http://localhost:3000/api/cards";

export async function getAllCards() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

export async function searchCardsByName(query: string) {
  const encodedQuery = encodeURIComponent(query);

  const response = await fetch(
    `${API_URL}/name/${encodedQuery}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

export async function getCardById(id: string | number) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(String(id))}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}