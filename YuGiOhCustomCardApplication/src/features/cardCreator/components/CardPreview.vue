<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { toBlob } from "html-to-image";
import normalFrame from "../assets/frames/normal_frame.webp";
import effectFrame from "../assets/frames/effect_frame.webp";
import ritualFrame from "../assets/frames/ritual_frame.webp";
import fusionFrame from "../assets/frames/fusion_frame.webp";
import synchroFrame from "../assets/frames/synchro_frame.webp";
import xyzFrame from "../assets/frames/xyz_frame.webp";
import linkFrame from "../assets/frames/link_frame.webp";
import spellFrame from "../assets/frames/spell_frame.webp";
import trapFrame from "../assets/frames/trap_frame.webp";
import cardBorder from "../assets/frames/card_border.webp";
import darkAttribute from "../assets/attributes/dark_attribute.webp";
import lightAttribute from "../assets/attributes/light_attribute.webp";
import earthAttribute from "../assets/attributes/earth_attribute.webp";
import waterAttribute from "../assets/attributes/water_attribute.webp";
import fireAttribute from "../assets/attributes/fire_attribute.webp";
import windAttribute from "../assets/attributes/wind_attribute.webp";
import divineAttribute from "../assets/attributes/divine_attribute.webp";
import spellAttribute from "../assets/attributes/spell_attribute.webp";
import trapAttribute from "../assets/attributes/trap_attribute.webp";
import levelStar from "../assets/stars/level.webp";
import rankStar from "../assets/stars/rank.webp";
import redArrowCorner from "../assets/link-markers/red_arrow_corner.webp";
import redArrowEdge from "../assets/link-markers/red_arrow_edge.webp";
import continuousIcon from "../assets/spell-trap-icons/continuous.webp";
import quickPlayIcon from "../assets/spell-trap-icons/quick-play.webp";
import equipIcon from "../assets/spell-trap-icons/equip.webp";
import fieldIcon from "../assets/spell-trap-icons/field.webp";
import ritualIcon from "../assets/spell-trap-icons/ritual.webp";
import counterIcon from "../assets/spell-trap-icons/counter.webp";

const props = defineProps<{
  selectedFrame: FrameType
  artworkUrl: string | null;
  artworkX: number;
  artworkY: number;
  artworkScale: number;
  cardName: string;
  selectedAttribute: CardAttribute;
  cardLevel: number;
  monsterRace: string;
  monsterTypes: string[];
  cardAtk: string;
  cardDef: string;
  linkMarkers: string[];
  linkRating: number;
  cardEffect: string;
  spellTrapSubtype: string;
}>();

type FrameType =
  | "normal"
  | "effect"
  | "ritual"
  | "fusion"
  | "synchro"
  | "xyz"
  | "link"
  | "spell"
  | "trap";


const frames: Record<FrameType, string> = {
  normal: normalFrame,
  effect: effectFrame,
  ritual: ritualFrame,
  fusion: fusionFrame,
  synchro: synchroFrame,
  xyz: xyzFrame,
  link: linkFrame,
  spell: spellFrame,
  trap: trapFrame,
};

const currentFrame = computed(() => frames[props.selectedFrame]);

type CardAttribute =
  | "DARK"
  | "LIGHT"
  | "EARTH"
  | "WATER"
  | "FIRE"
  | "WIND"
  | "DIVINE";

const attributes: Record<CardAttribute, string> = {
  DARK: darkAttribute,
  LIGHT: lightAttribute,
  EARTH: earthAttribute,
  WATER: waterAttribute,
  FIRE: fireAttribute,
  WIND: windAttribute,
  DIVINE: divineAttribute,
};

const currentAttribute = computed(() => {
  if (props.selectedFrame === "spell") {
    return spellAttribute;
  }

  if (props.selectedFrame === "trap") {
    return trapAttribute;
  }

  return attributes[props.selectedAttribute];
});

const artworkStyle = computed(() => ({
  transform: `translate(${props.artworkX}px, ${props.artworkY}px) scale(${props.artworkScale})`,
}));

const nameElement = ref<HTMLElement | null>(null);
const nameScaleX = ref(1);

const NAME_WIDTH = 374;

async function resizeCardName() {
  await nextTick();

  const element = nameElement.value;
  if (!element) return;

  // Measure the text at its natural width.
  const textWidth = element.scrollWidth;

  if (textWidth > NAME_WIDTH) {
    nameScaleX.value = NAME_WIDTH / textWidth;
  } else {
    nameScaleX.value = 1;
  }
}

watch(
  () => props.cardName,
  resizeCardName,
  { immediate: true, flush: "post" }
);

const usesLightName = computed(() =>
  ["xyz", "link", "spell", "trap"].includes(props.selectedFrame)
);

const STAR_SIZE = 30.88;
const STAR_Y = 91.62;
const STAR_SPACING = 33.353;

function getStarX(index: number, count: number, isRank: boolean) {
  const extended = count === 13;

  if (isRank) {
    const startX = extended ? 34.59 : 51.26;
    return startX + index * STAR_SPACING;
  }

  const startX = extended ? 434.82 : 418.14;
  return startX - index * STAR_SPACING;
}

const isRank = computed(() => props.selectedFrame === "xyz");

const showStars = computed(() =>
  !["spell", "trap", "link"].includes(props.selectedFrame)
);

const currentStar = computed(() =>
  isRank.value ? rankStar : levelStar
);

const starPositions = computed(() => {
  if (!showStars.value) return [];

  const count = Math.max(0, Math.min(13, props.cardLevel));

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: getStarX(index, count, isRank.value),
  }));
});

const classificationText = computed(() => {
  const parts = [props.monsterRace];

  if (props.selectedFrame === "link") {
    parts.push("Link");
  } else if (props.selectedFrame === "xyz") {
    parts.push("Xyz");
  } else if (
    ["fusion", "synchro", "ritual"].includes(props.selectedFrame)
  ) {
    const type = props.selectedFrame;
    parts.push(type.charAt(0).toUpperCase() + type.slice(1));
  }

  parts.push(...props.monsterTypes);

  return `[ ${[...new Set(parts.filter(Boolean))].join(" / ")} ]`;
});

const classificationRef = ref<HTMLElement | null>(null);
const classificationScaleX = ref(1);

const CLASSIFICATION_WIDTH = 422;

async function resizeClassification() {
  await nextTick();

  const element = classificationRef.value;
  if (!element) return;

  const textWidth = element.scrollWidth;

  classificationScaleX.value =
    textWidth > CLASSIFICATION_WIDTH
      ? CLASSIFICATION_WIDTH / textWidth
      : 1;
}

watch(
  classificationText,
  resizeClassification,
  { immediate: true, flush: "post" }
);

const linkMarkerPositions = {
  "top-left": {
    image: redArrowCorner,
    left: 44,
    top: 118,
    width: 42,
    height: 42,
    rotate: 0,
  },
  "top": {
    image: redArrowEdge,
    left: 208,
    top: 109,
    width: 88,
    height: 26,
    rotate: 0,
  },
  "top-right": {
    image: redArrowCorner,
    left: 416,
    top: 118,
    width: 43,
    height: 43,
    rotate: 90,
  },
  "right": {
    image: redArrowEdge,
    left: 411,
    top: 314,
    width: 88,
    height: 27,
    rotate: 90,
  },
  "bottom-right": {
    image: redArrowCorner,
    left: 416,
    top: 493,
    width: 43,
    height: 44,
    rotate: 180,
  },
  "bottom": {
    image: redArrowEdge,
    left: 208,
    top: 519,
    width: 88,
    height: 27,
    rotate: 180,
  },
  "bottom-left": {
    image: redArrowCorner,
    left: 44,
    top: 493,
    width: 43,
    height: 44,
    rotate: 270,
  },
  "left": {
    image: redArrowEdge,
    left: 4,
    top: 315,
    width: 88,
    height: 25,
    rotate: 270,
  },
} as const;

const isSpellTrap = computed(() =>
  ["spell", "trap"].includes(props.selectedFrame)
);

const effectContainerRef = ref<HTMLElement | null>(null);
const effectTextRef = ref<HTMLElement | null>(null);

const MAX_EFFECT_FONT_SIZE = 16;
const MIN_EFFECT_FONT_SIZE = 10;
const MAX_SPELL_TRAP_FONT_SIZE = 16;

const effectFontSize = ref(MAX_EFFECT_FONT_SIZE);

async function resizeEffectText() {
  await nextTick();

  const container = effectContainerRef.value;
  const text = effectTextRef.value;

  if (!container || !text) return;

  let size = isSpellTrap.value
    ? MAX_SPELL_TRAP_FONT_SIZE
    : MAX_EFFECT_FONT_SIZE;

  while (size >= MIN_EFFECT_FONT_SIZE) {
    effectFontSize.value = size;
    text.style.fontSize = `${size}px`;

    if (
      text.scrollHeight <= container.clientHeight &&
      text.scrollWidth <= container.clientWidth
    ) {
      break;
    }

    size -= 0.5;
  }

  effectFontSize.value = Math.max(
    MIN_EFFECT_FONT_SIZE,
    size
  );
}

watch(
  [() => props.cardEffect, () => props.selectedFrame],
  resizeEffectText,
  { immediate: true, flush: "post" }
);

const subtypeIcons: Record<string, string> = {
  Continuous: continuousIcon,
  "Quick-Play": quickPlayIcon,
  Equip: equipIcon,
  Field: fieldIcon,
  Ritual: ritualIcon,
  Counter: counterIcon,
};

const currentSubtypeIcon = computed(() => {
  if (!["spell", "trap"].includes(props.selectedFrame)) {
    return null;
  }

  return subtypeIcons[props.spellTrapSubtype] ?? null;
});

const cardCanvasRef = ref<HTMLElement | null>(null);

async function exportCardImage(): Promise<Blob> {
  if (!cardCanvasRef.value) {
    throw new Error("Card preview is not available.");
  }

  await document.fonts.ready;
  await nextTick();

  const canvas = cardCanvasRef.value;

  const artworkImages = Array.from(
    canvas.querySelectorAll("img")
  ).filter((img) => img.src.startsWith("blob:"));

  const originalSources = new Map<HTMLImageElement, string>();

  try {
    for (const img of artworkImages) {
      originalSources.set(img, img.src);

      const dataUrl = await imageUrlToDataUrl(img.src);

      img.src = dataUrl;

      await img.decode();
    }

    const blob = await toBlob(canvas, {
      width: 502,
      height: 739,
      pixelRatio: 1,
      cacheBust: false
    });

    if (!blob) {
      throw new Error("Failed to generate card image.");
    }

    return blob;
  } finally {
    for (const [img, originalSrc] of originalSources) {
      img.src = originalSrc;
    }
  }
}
defineExpose({
  exportCardImage
});

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load card artwork.");
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(blob);
  });
}
</script>

<template>
  <div class="card-preview-container">
    <div class="card-preview-workspace">
        <div ref="cardCanvasRef" class="card-preview-canvas">
            <!-- Border -->
            <img
                :src="cardBorder"
                class="card-preview-border"
                alt="Card Border"
                draggable="false"
            />
            <!-- Frame -->
            <img
                :src="currentFrame"
                class="card-preview-frame"
                alt="Card Frame"
                draggable="false"
            />

            <!-- Artwork -->
            <div class="card-preview-artwork">
                <img
                    v-if="artworkUrl"
                    :src="artworkUrl"
                    :style="artworkStyle"
                    alt="Card Artwork"
                    draggable="false"
                />
            </div>

            <template v-if="selectedFrame === 'link'">
              <img
                v-for="marker in linkMarkers"
                :key="marker"
                :src="linkMarkerPositions[marker as keyof typeof linkMarkerPositions].image"
                class="card-preview-link-marker"
                :style="{
                  left: `${linkMarkerPositions[marker as keyof typeof linkMarkerPositions].left}px`,
                  top: `${linkMarkerPositions[marker as keyof typeof linkMarkerPositions].top}px`,
                  width: `${linkMarkerPositions[marker as keyof typeof linkMarkerPositions].width}px`,
                  height: `${linkMarkerPositions[marker as keyof typeof linkMarkerPositions].height}px`,
                  transform: `rotate(${linkMarkerPositions[marker as keyof typeof linkMarkerPositions].rotate}deg)`
                }"
                alt=""
                draggable="false"
              />
            </template>

            <div
            ref="nameElement"
            class="card-preview-name"
            :class="{ 'card-preview-name-light': usesLightName }"
            :style="{
                transform: `scaleX(${nameScaleX})`
            }"
            >
                {{ cardName }}
            </div>

            <img
                :src="currentAttribute"
                class="card-preview-attribute"
                alt="Card Attribute"
                draggable="false"
            />

            <div
              v-if="selectedFrame === 'spell' || selectedFrame === 'trap'"
              class="card-preview-spell-trap-header"
            >
              <span class="card-preview-spell-trap-bracket">[</span>

              <span class="card-preview-spell-trap-label">
                {{ selectedFrame === "spell" ? "SPELL CARD" : "TRAP CARD" }}
              </span>

              <img
                v-if="currentSubtypeIcon"
                :src="currentSubtypeIcon"
                class="card-preview-spell-trap-icon"
                alt=""
                draggable="false"
              />

              <span class="card-preview-spell-trap-bracket">]</span>
            </div>

            <img
              v-for="star in starPositions"
              :key="star.id"
              :src="currentStar"
              class="card-preview-star"
              :style="{
                left: `${star.x}px`,
                top: `${STAR_Y}px`,
                width: `${STAR_SIZE}px`,
                height: `${STAR_SIZE}px`
              }"
              alt=""
              draggable="false"
            />

          <div
              ref="effectContainerRef"
              class="card-preview-effect"
              :class="{ 'card-preview-effect-spell-trap': isSpellTrap }"
            >
              <div
                ref="effectTextRef"
                class="card-preview-effect-text"
                :style="{ fontSize: `${effectFontSize}px` }"
              >
                {{ cardEffect }}
              </div>
            </div>

            <template v-if="!['spell', 'trap'].includes(selectedFrame)">
              <div class="card-preview-classification-container">
                <div
                  ref="classificationRef"
                  class="card-preview-classification"
                  :style="{
                    transform: `scaleX(${classificationScaleX})`
                  }"
                >
                  {{ classificationText }}
                </div>
              </div>

              <template v-if="!['spell', 'trap'].includes(selectedFrame)">
                <div
                  class="card-preview-atk"
                  :class="{ 'card-preview-atk-link': selectedFrame === 'link' }"
                >
                  <span class="card-stat-label">ATK/</span>
                  <span class="card-stat-value">{{ cardAtk }}</span>
                </div>

                <template v-if="selectedFrame === 'link'">
                  <div class="card-preview-link-rating">
                    {{ linkRating }}
                  </div>
                </template>

                <div v-else class="card-preview-def">
                  <span class="card-stat-label">DEF/</span>
                  <span class="card-stat-value">{{ cardDef }}</span>
                </div>
              </template>
            </template>
            <div
              v-if="!['spell', 'trap'].includes(selectedFrame)"
              class="card-preview-stat-divider"
            ></div>
        </div> 
    </div>
  </div>
</template>