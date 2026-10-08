
export function formatDescription(description: string): string[] {
  if (!description) {
    return [];
  }

  // Put every bullet point onto its own line.
  description = description.replace(/\s*●\s*/g, "\n● ");

  // Put "During" effects onto a new line.
  description = description.replace(
    /\s+(During\s)/g,
    "\n$1"
  );

  const lines = description
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const effects: string[] = [];

  for (const line of lines) {
    if (line.startsWith("●")) {
      effects.push(line);
      continue;
    }

    const sentences =
      line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    let currentEffect = "";

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      const startsNewEffect =
        trimmed.startsWith("When ") ||
        trimmed.startsWith("If ") ||
        trimmed.startsWith("During ") ||
        trimmed.startsWith("Once ") ||
        trimmed.startsWith("You can only activate 1") ||
        trimmed.startsWith("You can only use each effect ") ||
        trimmed.startsWith("You can only use 1 ") ||
        trimmed.startsWith("\"") ||
        trimmed.startsWith("Reduce ") ||
        trimmed.startsWith("Increase ") ||
        trimmed.startsWith("Negate ") ||
        trimmed.startsWith("Pay ") ||
        trimmed.startsWith("Banish ") ||
        trimmed.startsWith("Send ") ||
        trimmed.startsWith("Destroy ") ||
        trimmed.startsWith("Discard ") ||
        trimmed.startsWith("Tribute ") ||
        trimmed.startsWith("Target ") ||
        trimmed.startsWith("Choose ") ||
        trimmed.startsWith("Monsters ") ||
        trimmed.startsWith("Return ") ||
        trimmed.startsWith("Reveal ") ||
        trimmed.startsWith("The first time ");

      if (startsNewEffect && currentEffect) {
        effects.push(currentEffect.trim());
        currentEffect = trimmed;
      } else {
        currentEffect +=
          (currentEffect ? " " : "") + trimmed;
      }
    }

    if (currentEffect) {
      effects.push(currentEffect.trim());
    }
  }

  return effects;
}

export function hasMonsterEffect(card: any): boolean {
  if (!card.description) {
    return false;
  }

  const formattedText = formatDescription(card.description);

  return formattedText.length > 1;
}

export function getMonsterTypes(card: any): string {
  const types: string[] = [];

  if (card.card_subtype) {
    types.push(card.card_subtype);
  }

  if (!card.card_type) {
    return types.join(" / ");
  }

  const typeWords: string[] = card.card_type
    .replace(/\bMonster\b/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const extraDeckTypes = [
    "Fusion",
    "Synchro",
    "Xyz",
    "Link"
  ];

  for (const type of typeWords) {
    if (!types.includes(type)) {
      types.push(type);
    }
  }

  const isExtraDeckMonster = typeWords.some(type =>
    extraDeckTypes.includes(type)
  );

  if (
    card.frame_type?.toLowerCase().includes("pendulum") &&
    !types.includes("Pendulum")
  ) {
    types.push("Pendulum");
  }

  if (
    card.card_type?.includes("Tuner") &&
    !types.includes("Tuner")
  ) {
    types.push("Tuner");
  }

  if (
    isExtraDeckMonster &&
    !types.includes("Effect") &&
    hasMonsterEffect(card)
  ) {
    types.push("Effect");
  }

  return types.join(" / ");
}

export function getSpellTrapTypes(card: any): string {
  const types: string[] = [];

  if (card.card_type) {
    const cardType = card.card_type
      .replace(/\bCard\b/g, "")
      .trim();

    types.push(cardType);
  }

  if (card.card_subtype) {
    types.push(card.card_subtype);
  }

  return types.join(" / ");
}

export function getMonsterStats(card: any) {
  if (!card.card_type?.includes("Monster")) {
    return null;
  }

  const topStats: string[] = [];
  const bottomStats: string[] = [];

  const cardType = card.card_type.toLowerCase();

  if (cardType.includes("link")) {
    if (card.link_value != null) {
      topStats.push(`Link ${card.link_value}`);
    }
  }
  else if (cardType.includes("xyz")) {
    if (card.level != null) {
      topStats.push(`Rank ${card.level}`);
    }
  }
  else if (card.level != null) {
    topStats.push(`Level ${card.level}`);
  }

  if (card.attribute) {
    topStats.push(card.attribute);
  }

  if (card.attack != null) {
    bottomStats.push(`ATK ${card.attack}`);
  }

  if (
    !cardType.includes("link") &&
    card.defense != null
  ) {
    bottomStats.push(`DEF ${card.defense}`);
  }

  let scale = "";

  if (
    cardType.includes("pendulum") &&
    card.scale != null
  ) {
    scale = `Scale ${card.scale}`;
  }

  return {
    top: topStats.join(" "),
    scale,
    bottom: bottomStats.join(" / ")
  };
}
