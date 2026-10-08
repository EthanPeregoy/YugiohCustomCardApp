export type PackArtworkSettings = {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  titleY: number;
  imageZoom: number;
  imageX: number;
  imageY: number;
  borderColor: string;
  borderWidth: number;
};

export const defaultPackArtworkSettings: PackArtworkSettings = {
  fontFamily: "Georgia",
  fontSize: 48,
  textColor: "#e8c978",
  outlineColor: "#000000",
  outlineWidth: 3,
  titleY: 740,
  imageZoom: 1,
  imageX: 0,
  imageY: 0,
  borderColor: "#ffffff",
  borderWidth: 4
};