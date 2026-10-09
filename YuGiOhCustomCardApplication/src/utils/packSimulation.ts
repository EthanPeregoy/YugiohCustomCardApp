import {
  rarities,
  type Card,
  type CardSlot,
  type PulledCard,
  type Rarity,
  type RarityProbabilities
} from "../types/pack";

type CardPools = Record<Rarity, Card[]>;

function validateProbabilities(
  probabilities: RarityProbabilities,
  label: string,
  cardPools: CardPools
) {
  const values = rarities.map(
    rarity => probabilities[rarity]
  );

  if (
    values.some(
      value =>
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
    )
  ) {
    throw new Error(`${label} has invalid probabilities.`);
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  if (Math.abs(total - 100) > 0.000001) {
    throw new Error(`${label} must total 100%.`);
  }

  for (const rarity of rarities) {
    if (
      probabilities[rarity] > 0 &&
      cardPools[rarity].length === 0
    ) {
      throw new Error(
        `${label} uses ${rarity}, but its card pool is empty.`
      );
    }
  }
}

function rollRarity(
  probabilities: RarityProbabilities
): Rarity {
  const roll = Math.random() * 100;
  let cumulativeProbability = 0;

  for (const rarity of rarities) {
    cumulativeProbability += probabilities[rarity];

    if (roll < cumulativeProbability) {
      return rarity;
    }
  }

  throw new Error(
    "Invalid rarity probability distribution."
  );
}

function getEffectiveRarity(
  slot: CardSlot,
  rolledRarities: Map<number, Rarity>
): Rarity {
  for (const rule of slot.conditions) {
    const dependencyRarity = rolledRarities.get(
      rule.dependsOnSlot
    );

    if (dependencyRarity === rule.conditionRarity) {
      return rule.resultRarity;
    }
  }

  return rollRarity(slot.probabilities);
}

function generatePackRarities(
  cardSlots: CardSlot[]
): Map<number, Rarity> {
  const rolledRarities = new Map<number, Rarity>();
  const processing = new Set<number>();

  function rollSlot(position: number): Rarity {
    const existing = rolledRarities.get(position);

    if (existing) {
      return existing;
    }

    if (processing.has(position)) {
      throw new Error(
        `Circular conditional dependency detected at Card ${position}.`
      );
    }

    const slot = cardSlots.find(
      s => s.position === position
    );

    if (!slot) {
      throw new Error(`Card ${position} does not exist.`);
    }

    processing.add(position);

    try {
      // Resolve dependencies before rolling this slot.
      for (const rule of slot.conditions) {
        if (
          rule.dependsOnSlot === position ||
          !cardSlots.some(
            s => s.position === rule.dependsOnSlot
          )
        ) {
          throw new Error(
            `Card ${position} has an invalid dependency.`
          );
        }

        rollSlot(rule.dependsOnSlot);
      }

      const rarity = getEffectiveRarity(
        slot,
        rolledRarities
      );

      rolledRarities.set(position, rarity);

      return rarity;
    } finally {
      processing.delete(position);
    }
  }

  for (const slot of cardSlots) {
    rollSlot(slot.position);
  }

  return rolledRarities;
}

function rollCard(
  rarity: Rarity,
  cardPools: CardPools
): Card {
  const pool = cardPools[rarity];

  if (pool.length === 0) {
    throw new Error(
      `The ${rarity} card pool is empty.`
    );
  }

  const randomIndex = Math.floor(
    Math.random() * pool.length
  );

  return pool[randomIndex];
}

export function simulatePack(
  cardSlots: CardSlot[],
  cardPools: CardPools
): PulledCard[] {
  // Validate default and conditional probabilities.
  for (const slot of cardSlots) {
    validateProbabilities(
      slot.probabilities,
      `Card ${slot.position}`,
      cardPools
    );

    for (const [index, rule] of slot.conditions.entries()) {
      if (
        !rarities.includes(rule.conditionRarity) ||
        !rarities.includes(rule.resultRarity)
      ) {
        throw new Error(
          `Card ${slot.position}, Rule ${index + 1} has an invalid rarity.`
        );
      }


      if (cardPools[rule.resultRarity].length === 0) {
        throw new Error(
          `Card ${slot.position}, Rule ${index + 1} requires ${rule.resultRarity}, but its card pool is empty.`
        );
      }
    }
  }

  // Resolve conditional rarities in dependency order.
  const rolledRarities = generatePackRarities(
    cardSlots
  );

  // Select cards in their original slot order.
  return cardSlots.map(slot => {
    const rarity = rolledRarities.get(slot.position);

    if (!rarity) {
      throw new Error(
        `Failed to generate Card ${slot.position}.`
      );
    }

    return {
      position: slot.position,
      rarity,
      card: rollCard(rarity, cardPools)
    };
  });
}