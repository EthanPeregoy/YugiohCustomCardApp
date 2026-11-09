import { API_BASE_URL } from "@/global/config/api";

export function getCardImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("/card-assets/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  return imagePath;
}