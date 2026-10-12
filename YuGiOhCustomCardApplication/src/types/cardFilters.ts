export type CardFilterMode =
  | "search"
  | "shop"
  | "collection"
  | "deck";

export interface CardTag {
  id: number;
  name: string;
  color: string;
}

export interface CardFilters {
  category: "all" | "monster" | "spell" | "trap";
  origin: "all" | "official" | "custom";

  effectText: string;

  monsterTypes: string[];
  monsterSubtype: string;
  attribute: string;

  ratingType: "level" | "rank" | "link";
  ratingMin: string;
  ratingMax: string;

  spellTrapSubtype: string;

  rarities: string[];
  tagIds: number[];

  sortBy: string;
  sortDirection: "asc" | "desc";
}

export function createDefaultCardFilters(): CardFilters {
  return {
    category: "all",
    origin: "all",

    effectText: "",

    monsterTypes: [],
    monsterSubtype: "",
    attribute: "",

    ratingType: "level",
    ratingMin: "",
    ratingMax: "",

    spellTrapSubtype: "",

    rarities: [],
    tagIds: [],

    sortBy: "name",
    sortDirection: "asc"
  };
}