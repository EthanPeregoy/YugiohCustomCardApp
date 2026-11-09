<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from "vue";

import CardPreview from "./components/CardPreview.vue";
import CardArtworkEditor from "./components/CardArtworkEditor.vue";

import { uploadCardImage, createCustomCard, type CreateCardPayload } from "./services/cardCreatorService";

import "./styles/card-creator.css";


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

const selectedFrame = ref<FrameType>("normal");

const artworkUrl = ref<string | null>(null);

const artworkX = ref(0);
const artworkY = ref(0);
const artworkScale = ref(1);

function handleArtworkUpload(file: File) {
  if (artworkUrl.value) {
    URL.revokeObjectURL(artworkUrl.value);
  }

  artworkUrl.value = URL.createObjectURL(file);

  resetArtwork();
}

function resetArtwork() {
  artworkX.value = 0;
  artworkY.value = 0;
  artworkScale.value = 1;
}

onUnmounted(() => {
  if (artworkUrl.value) {
    URL.revokeObjectURL(artworkUrl.value);
  }
});

const cardName = ref("");

type CardAttribute =
  | "DARK"
  | "LIGHT"
  | "EARTH"
  | "WATER"
  | "FIRE"
  | "WIND"
  | "DIVINE";

const selectedAttribute = ref<CardAttribute>("DARK");

const cardLevel = ref(4);

const monsterRace = ref("Dragon");
const monsterTypesInput = ref("Effect");

const monsterTypes = computed(() =>
  monsterTypesInput.value
    .split("/")
    .map(type => type.trim())
    .filter(Boolean)
);

const cardATK = ref("2500");
const cardDEF = ref("2000");

type LinkMarker =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

const linkMarkers = ref<LinkMarker[]>([]);

const linkRating = computed(() => linkMarkers.value.length);

function toggleLinkMarker(marker: LinkMarker) {
  if (linkMarkers.value.includes(marker)) {
    linkMarkers.value = linkMarkers.value.filter(
      (selected) => selected !== marker
    );
  } else {
    linkMarkers.value = [...linkMarkers.value, marker];
  }
}

const cardEffect = ref("");

type SpellTrapSubtype =
  | "Normal"
  | "Continuous"
  | "Quick-Play"
  | "Equip"
  | "Field"
  | "Ritual"
  | "Counter";

const spellTrapSubtype = ref<SpellTrapSubtype>("Normal");

const availableSubtypes = computed<SpellTrapSubtype[]>(() => {
  if (selectedFrame.value === "spell") {
    return [
      "Normal",
      "Continuous",
      "Quick-Play",
      "Equip",
      "Field",
      "Ritual",
    ];
  }

  if (selectedFrame.value === "trap") {
    return ["Normal", "Continuous", "Counter"];
  }

  return [];
});

watch(selectedFrame, (frame) => {
  if (frame === "spell" || frame === "trap") {
    spellTrapSubtype.value = "Normal";
  }
});

const cardPreviewRef = ref<InstanceType<typeof CardPreview> | null>(null);

async function testCardExport() {
  try {
    const blob = await cardPreviewRef.value?.exportCardImage();

    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "custom-card.png";
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export card:", error);
  }
}

const isSaving = ref(false);
const saveError = ref("");
const saveSuccess = ref("");

async function saveCustomCard() {
  if (isSaving.value) return;

  saveError.value = "";
  saveSuccess.value = "";

  if (!cardName.value.trim()) {
    saveError.value = "Please enter a card name.";
    return;
  }

  if (!artworkUrl.value) {
    saveError.value = "Please upload card artwork.";
    return;
  }

  if (selectedFrame.value === "link" && linkRating.value === 0) {
    saveError.value = "Link Monsters require at least one Link Marker.";
    return;
  }

  isSaving.value = true;

  try {
    const imageBlob = await cardPreviewRef.value?.exportCardImage();

    if (!imageBlob) {
      throw new Error("Failed to generate card image.");
    }

    const isSpell = selectedFrame.value === "spell";
    const isTrap = selectedFrame.value === "trap";
    const isMonster = !isSpell && !isTrap;
    const isLink = selectedFrame.value === "link";

    const payload: CreateCardPayload = {
      card_name: cardName.value.trim(),

      card_type: isSpell
        ? "Spell Card"
        : isTrap
          ? "Trap Card"
          : [
              ...(selectedFrame.value === "normal"
                ? ["Normal"]
                : selectedFrame.value !== "effect"
                  ? [selectedFrame.value.charAt(0).toUpperCase() +
                    selectedFrame.value.slice(1)]
                  : []),
              ...monsterTypes.value
            ].filter((type, index, types) =>
              types.indexOf(type) === index
            ).join(" ") + " Monster",

      card_subtype: isMonster
        ? monsterRace.value
        : spellTrapSubtype.value,

      frame_type: selectedFrame.value,
      description: cardEffect.value,
      image_path: "",

      attribute: isMonster ? selectedAttribute.value : null,
      atk: isMonster ? cardATK.value : null,
      def: isMonster && !isLink ? cardDEF.value : null,
      level: isMonster && !isLink ? cardLevel.value : null,
      link_value: isLink ? linkRating.value : null
    };

    const imagePath = await uploadCardImage(imageBlob);

    payload.image_path = imagePath;

    const createdCard = await createCustomCard(payload);

    saveSuccess.value =
      `Successfully created ${createdCard.card_name}!`;

    console.log("Created custom card:", createdCard);

  } catch (error) {
    console.error("Failed to create card:", error);

    saveError.value =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="card-creator-page">
    <h1>Card Creator</h1>

    <div class="card-creator-workspace">
      <!-- Left: Artwork Editor -->
      <aside class="card-creator-left">
        <CardArtworkEditor
          :artwork-url="artworkUrl"
          v-model:artwork-x="artworkX"
          v-model:artwork-y="artworkY"
          v-model:artwork-scale="artworkScale"
          @upload="handleArtworkUpload"
          @reset="resetArtwork"
        />

        <div
          v-if="selectedFrame === 'link'"
          class="card-link-marker-panel"
        >
          <label>Link Markers (LINK-{{ linkRating }})</label>

          <div class="link-marker-selector">
            <button
              v-for="marker in [
                { id: 'top-left', symbol: '↖' },
                { id: 'top', symbol: '↑' },
                { id: 'top-right', symbol: '↗' },
                { id: 'left', symbol: '←' },
                { id: 'right', symbol: '→' },
                { id: 'bottom-left', symbol: '↙' },
                { id: 'bottom', symbol: '↓' },
                { id: 'bottom-right', symbol: '↘' }
              ]"
              :key="marker.id"
              type="button"
              class="link-marker-button"
              :class="{ active: linkMarkers.includes(marker.id as LinkMarker) }"
              @click="toggleLinkMarker(marker.id as LinkMarker)"
            >
              {{ marker.symbol }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Center: Card Preview -->
      <main class="card-creator-center">
        <CardPreview 
          ref="cardPreviewRef"
          :selected-frame="selectedFrame"
          :artwork-url="artworkUrl"
          :artwork-x="artworkX"
          :artwork-y="artworkY"
          :artwork-scale="artworkScale"
          :card-name="cardName"
          :selected-attribute="selectedAttribute"
          :card-level="cardLevel"
          :monster-race="monsterRace"
          :monster-types="monsterTypes"
          :card-atk="cardATK"
          :card-def="cardDEF"
          :link-markers="linkMarkers"
          :link-rating="linkRating"
          :card-effect="cardEffect"
          :spell-trap-subtype="spellTrapSubtype"
        />
        <div class="card-creator-save">
          <button
            type="button"
            :disabled="isSaving"
            @click="saveCustomCard"
          >
            {{ isSaving ? "Creating Card..." : "Create Card" }}
          </button>

          <p v-if="saveError" class="card-creator-save-error">
            {{ saveError }}
          </p>

          <p v-if="saveSuccess" class="card-creator-save-success">
            {{ saveSuccess }}
          </p>
        </div>
      </main>

      <!-- Right: Card Details -->
      <aside class="card-creator-right">
        <h3>Card Details</h3>

        <label class="card-detail-field">
          Card Type

          <select v-model="selectedFrame" class="card-frame-selector">
            <option value="normal">Normal Monster</option>
            <option value="effect">Effect Monster</option>
            <option value="ritual">Ritual Monster</option>
            <option value="fusion">Fusion Monster</option>
            <option value="synchro">Synchro Monster</option>
            <option value="xyz">Xyz Monster</option>
            <option value="link">Link Monster</option>
            <option value="spell">Spell Card</option>
            <option value="trap">Trap Card</option>
          </select>
        </label>

        <label class="card-detail-field">
          Card Name

          <input
            v-model="cardName"
            type="text"
            maxlength="100"
            placeholder="Enter card name"
            class="card-detail-input"
          />
        </label>

        <label
          v-if="selectedFrame !== 'spell' && selectedFrame !== 'trap'"
          class="card-detail-field"
        >
          Attribute

          <select
            v-model="selectedAttribute"
            class="card-frame-selector"
          >
            <option value="DARK">DARK</option>
            <option value="LIGHT">LIGHT</option>
            <option value="EARTH">EARTH</option>
            <option value="WATER">WATER</option>
            <option value="FIRE">FIRE</option>
            <option value="WIND">WIND</option>
            <option value="DIVINE">DIVINE</option>
          </select>
        </label>

        <label
          v-if="selectedFrame === 'spell' || selectedFrame === 'trap'"
          class="card-detail-field"
        >
          {{ selectedFrame === "spell" ? "Spell Type" : "Trap Type" }}

          <select
            v-model="spellTrapSubtype"
            class="card-frame-selector"
          >
            <option
              v-for="subtype in availableSubtypes"
              :key="subtype"
              :value="subtype"
            >
              {{ subtype }}
            </option>
          </select>
        </label>

        <label
          v-if="!['spell', 'trap', 'link'].includes(selectedFrame)"
          class="card-detail-field"
        >
          {{ selectedFrame === "xyz" ? "Rank" : "Level" }}

          <select v-model.number="cardLevel" class="card-frame-selector">
            <option
              v-for="level in 14"
              :key="level - 1"
              :value="level - 1"
            >
              {{ level - 1 }}
            </option>
          </select>
        </label>

        <template v-if="!['spell', 'trap'].includes(selectedFrame)">
          <label class="card-detail-field">
            Monster Type
            <input v-model="monsterRace" type="text" />
          </label>

          <label class="card-detail-field">
            Classification

            <input
              v-model="monsterTypesInput"
              type="text"
              placeholder="Effect / Tuner"
            />
          </label>

          <label class="card-detail-field">
            ATK
            <input v-model="cardATK" type="text" />
          </label>

          <label v-if="selectedFrame !== 'link'" class="card-detail-field">
            DEF
            <input v-model="cardDEF" type="text" />
          </label>
        </template>

        <label class="card-detail-field">
          {{ selectedFrame === "normal" ? "Card Description" : "Effect Text" }}

          <textarea
            v-model="cardEffect"
            class="card-effect-input"
            placeholder="Enter card effect or description..."
            rows="8"
          ></textarea>
        </label>
      </aside>
    </div>
  </div>
</template>