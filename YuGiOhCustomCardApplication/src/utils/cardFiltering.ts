import type { CardFilters, CardFilterMode, CardTag } from "../types/cardFilters";

export interface FilterableCard {
  card_name: string;
  card_type: string;
  card_subtype: string | null;
  frame_type: string | null;
  description: string | null;
  attribute: string | null;

  attack: number | null;
  defense: number | null;
  level: number | null;
  link_value: number | null;

  is_custom: boolean;

  quantity?: number;
  rarity?: string;
  tags?: CardTag[];
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getCardCategory(card: FilterableCard) {
  const type = normalize(card.card_type);

  if (type.startsWith("spell")) return "spell";
  if (type.startsWith("trap")) return "trap";

  return "monster";
}

function matchesMonsterType(
  card: FilterableCard,
  selectedType: string
) {
  const type = normalize(card.card_type);
  const frame = normalize(card.frame_type);
  const selected = normalize(selectedType);

  return type.includes(selected) || frame.includes(selected);
}

function matchesFilters(
  card: FilterableCard,
  filters: CardFilters,
  mode: CardFilterMode
) {
  const category = getCardCategory(card);

  const supportsRarity =
    mode === "shop" || mode === "collection";

    const supportsTags =
    mode === "collection" || mode === "deck";

    if (
    supportsRarity &&
    filters.rarities.length > 0 &&
    !filters.rarities.includes(card.rarity ?? "")
    ) {
    return false;
    }

    if (
    supportsTags &&
    filters.tagIds.length > 0 &&
    !filters.tagIds.every(tagId =>
        card.tags?.some(tag => tag.id === tagId)
    )
    ) {
    return false;
    }

  // General filters
  if (
    filters.category !== "all" &&
    category !== filters.category
  ) {
    return false;
  }

  if (
    filters.origin === "custom" &&
    card.is_custom !== true
  ) {
    return false;
  }

  if (
    filters.origin === "official" &&
    card.is_custom !== false
  ) {
    return false;
  }

  if (
    !normalize(card.description).includes(
      normalize(filters.effectText)
    )
  ) {
    return false;
  }

  // Spell and Trap subtype
  if (
    filters.spellTrapSubtype &&
    (
      category === "monster" ||
      normalize(card.card_subtype) !==
        normalize(filters.spellTrapSubtype)
    )
  ) {
    return false;
  }

  // Monster classifications: match every selected option
  if (
    filters.monsterTypes.length > 0 &&
    (
      category !== "monster" ||
      !filters.monsterTypes.every(selectedType =>
        matchesMonsterType(card, selectedType)
      )
    )
  ) {
    return false;
  }

  // Monster race, such as Dragon or Spellcaster
  if (
    filters.monsterSubtype &&
    (
      category !== "monster" ||
      normalize(card.card_subtype) !==
        normalize(filters.monsterSubtype)
    )
  ) {
    return false;
  }

  if (
    filters.attribute &&
    (
      category !== "monster" ||
      normalize(card.attribute) !==
        normalize(filters.attribute)
    )
  ) {
    return false;
  }

  // Only apply rating filtering when a bound is entered.
  const hasRatingRange =
    filters.ratingMin !== "" ||
    filters.ratingMax !== "";

  if (hasRatingRange) {
    if (category !== "monster") return false;

    const frame = normalize(card.frame_type);

    const ratingType = frame.includes("link")
      ? "link"
      : frame.includes("xyz")
        ? "rank"
        : "level";

    if (ratingType !== filters.ratingType) {
      return false;
    }

    const rating = ratingType === "link"
      ? card.link_value
      : card.level;

    if (rating === null || rating === undefined) {
      return false;
    }

    if (
      filters.ratingMin !== "" &&
      Number(rating) < Number(filters.ratingMin)
    ) {
      return false;
    }

    if (
      filters.ratingMax !== "" &&
      Number(rating) > Number(filters.ratingMax)
    ) {
      return false;
    }
  }

  return true;
}

function getSortValue(
  card: FilterableCard,
  sortBy: string
): string | number | null {
  switch (sortBy) {
    case "attack":
      return card.attack;

    case "defense":
      return card.defense;

    case "level":
      return card.level;

    case "link_value":
      return card.link_value;

    case "quantity":
      return card.quantity === undefined
        ? null
        : Number(card.quantity);

    case "rarity": {
      const rarityOrder = [
        "Common",
        "Rare",
        "Super Rare",
        "Ultra Rare",
        "Secret Rare"
      ];

      const index = rarityOrder.indexOf(
        card.rarity ?? ""
      );

      return index === -1 ? null : index;
    }

    case "tags":
      return card.tags?.length
        ? card.tags
            .map(tag => tag.name)
            .sort((a, b) => a.localeCompare(b))
            .join(", ")
        : null;

    default:
      return card.card_name;
  }
}

export function filterAndSortCards<T extends FilterableCard>(
  cards: T[],
  filters: CardFilters,
  mode: CardFilterMode = "search"
): T[] {
  const filtered = cards.filter(card =>
    matchesFilters(card, filters, mode)
  );
  
  const direction =
    filters.sortDirection === "asc" ? 1 : -1;

  return filtered.sort((a, b) => {
    const aValue = getSortValue(a, filters.sortBy);
    const bValue = getSortValue(b, filters.sortBy);

    // Missing stats appear last in either direction.
    const aMissing = aValue === null || aValue === undefined;
    const bMissing = bValue === null || bValue === undefined;

    if (aMissing && bMissing) {
      return a.card_name.localeCompare(b.card_name);
    }

    if (aMissing) return 1;
    if (bMissing) return -1;

    const comparison =
      typeof aValue === "number" &&
      typeof bValue === "number"
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue));

    return (
      comparison * direction ||
      a.card_name.localeCompare(b.card_name)
    );
  });
}