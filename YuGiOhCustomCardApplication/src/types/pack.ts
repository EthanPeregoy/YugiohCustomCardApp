export type Rarity =
  | "Common"
  | "Rare"
  | "Super Rare"
  | "Ultra Rare"
  | "Secret Rare";

export type RarityProbabilities = Record<Rarity, number>;

export type ConditionalRule = {
  id: string;
  dependsOnSlot: number;
  triggerRarities: Rarity[];
  probabilities: RarityProbabilities;
};

export type CardSlot = {
  position: number;
  probabilities: RarityProbabilities;
  conditions: ConditionalRule[];
};

export type Card = {
  id: number;
  card_name: string;
  image_path: string;
};

export type PulledCard = {
  position: number;
  card: Card;
  rarity: Rarity;
};

export const rarities: Rarity[] = [
  "Common",
  "Rare",
  "Super Rare",
  "Ultra Rare",
  "Secret Rare"
];
