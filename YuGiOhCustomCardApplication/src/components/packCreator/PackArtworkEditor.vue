
<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";

import {
  defaultPackArtworkSettings,
  type PackArtworkSettings
} from "../../types/packArtwork";

import { renderPackArtwork } from "../../utils/renderPackArtwork";

const props = defineProps<{
  packName: string;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const artworkFile = ref<File | null>(null);
const artworkPreview = ref<string | null>(null);
const loadedImage = ref<HTMLImageElement | null>(null);
const error = ref("");

const settings = ref<PackArtworkSettings>({
  ...defaultPackArtworkSettings
});

async function uploadArtwork(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    error.value = "Please select a PNG, JPG, or WebP image.";
    input.value = "";
    return;
  }

  error.value = "";

  const url = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load image."));
      image.src = url;
    });

    if (artworkPreview.value) {
      URL.revokeObjectURL(artworkPreview.value);
    }

    artworkFile.value = file;
    artworkPreview.value = url;
    loadedImage.value = image;

    await nextTick();
    updatePreview();
  } catch {
    URL.revokeObjectURL(url);
    error.value = "Could not load the selected image.";
  }
}

function updatePreview() {
  if (!canvas.value || !loadedImage.value) return;

  renderPackArtwork(
    canvas.value,
    loadedImage.value,
    props.packName,
    settings.value
  );
}

function exportArtwork() {
  if (!canvas.value || !loadedImage.value) return;

  const link = document.createElement("a");

  link.download =
    `${props.packName.trim() || "Custom Pack"}.png`;

  link.href = canvas.value.toDataURL("image/png");
  link.click();
}

function resetSettings() {
  settings.value = { ...defaultPackArtworkSettings };
}

watch(
  [settings, () => props.packName],
  () => updatePreview(),
  { deep: true, flush: "post" }
);

onBeforeUnmount(() => {
  if (artworkPreview.value) {
    URL.revokeObjectURL(artworkPreview.value);
  }
});
</script>

<template>
  <section class="pack-artwork-editor">
    <div class="artwork-header">
      <h2>Pack Artwork Editor</h2>
      <p>
        Upload an illustration and customize how your pack looks.
        The pack name will be added automatically.
      </p>
    </div>

    <div class="editor-layout">

      <!-- LEFT PANEL -->
      <div class="editor-controls">

        <!-- UPLOAD -->
        <div class="editor-section">
          <h3>1. Upload Illustration</h3>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="uploadArtwork"
          />

          <p v-if="error" class="error">
            {{ error }}
          </p>

          <div v-if="artworkFile" class="file-details">
            {{ artworkFile.name }}
          </div>
        </div>

        <template v-if="artworkPreview">

          <!-- TITLE SETTINGS -->
          <div class="editor-section">
            <h3>2. Title Settings</h3>

            <div class="font-color-row">
              <div class="font-field">
                <label>Font</label>

                <select v-model="settings.fontFamily">
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Impact">Impact</option>
                  <option value="Times New Roman">
                    Times New Roman
                  </option>
                </select>
              </div>

              <div class="color-field">
                <label>Title Color</label>
                <input
                  v-model="settings.textColor"
                  type="color"
                />
              </div>

              <div class="color-field">
                <label>Outline Color</label>
                <input
                  v-model="settings.outlineColor"
                  type="color"
                />
              </div>
            </div>

            <div class="setting-row">
              <label>Font Size</label>

              <input
                v-model.number="settings.fontSize"
                type="range"
                min="20"
                max="100"
              />

              <input
                v-model.number="settings.fontSize"
                type="number"
                min="20"
                max="100"
                step="1"
                class="setting-number"
              />
            </div>

            <div class="setting-row">
              <label>Outline Width</label>

              <input
                v-model.number="settings.outlineWidth"
                type="range"
                min="0"
                max="12"
              />

              <input
                v-model.number="settings.outlineWidth"
                type="number"
                min="0"
                max="12"
                step="1"
                class="setting-number"
              />
            </div>

            <div class="setting-row">
              <label>Title Position</label>

              <input
                v-model.number="settings.titleY"
                type="range"
                min="40"
                max="800"
              />

              <input
                v-model.number="settings.titleY"
                type="number"
                min="40"
                max="800"
                step="1"
                class="setting-number"
              />
            </div>
          </div>

          <!-- ILLUSTRATION SETTINGS -->
          <div class="editor-section">
            <h3>3. Illustration Settings</h3>

            <div class="setting-row">
              <label>Zoom</label>

              <input
                v-model.number="settings.imageZoom"
                type="range"
                min="1"
                max="3"
                step="0.05"
              />

              <input
                v-model.number="settings.imageZoom"
                type="number"
                min="1"
                max="3"
                step="0.05"
                class="setting-number"
              />
            </div>

            <div class="setting-row">
              <label>Horizontal Position</label>

              <input
                v-model.number="settings.imageX"
                type="range"
                min="-500"
                max="500"
              />

              <input
                v-model.number="settings.imageX"
                type="number"
                min="-500"
                max="500"
                step="1"
                class="setting-number"
              />
            </div>

            <div class="setting-row">
              <label>Vertical Position</label>

              <input
                v-model.number="settings.imageY"
                type="range"
                min="-500"
                max="500"
              />

              <input
                v-model.number="settings.imageY"
                type="number"
                min="-500"
                max="500"
                step="1"
                class="setting-number"
              />
            </div>
          </div>

          <!-- BORDER SETTINGS -->
          <div class="editor-section">
            <h3>4. Border Settings</h3>

            <div class="setting-row">
              <label>Border Color</label>

              <div class="border-color-control">
                <input
                  v-model="settings.borderColor"
                  type="color"
                />
              </div>

              <span class="setting-placeholder">
                {{ settings.borderColor }}
              </span>
            </div>

            <div class="setting-row">
              <label>Border Width</label>

              <input
                v-model.number="settings.borderWidth"
                type="range"
                min="0"
                max="20"
              />

              <input
                v-model.number="settings.borderWidth"
                type="number"
                min="0"
                max="20"
                step="1"
                class="setting-number"
              />
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="editor-actions">
            <button
              type="button"
              class="reset-button"
              @click="resetSettings"
            >
              Reset Settings
            </button>

            <button
              type="button"
              class="export-button"
              @click="exportArtwork"
            >
              Export Pack Artwork
            </button>
          </div>

        </template>
      </div>

      <!-- RIGHT PANEL -->
      <div class="preview-container">
        <div class="preview-header">
          <h3>Live Preview</h3>
          <p>
            This is how your pack artwork will look
            with the current settings.
          </p>
        </div>

        <canvas
          v-show="artworkPreview"
          ref="canvas"
          width="600"
          height="840"
        ></canvas>

        <div v-if="!artworkPreview" class="empty-preview">
          Upload an illustration to preview your pack.
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.pack-artwork-editor {
  margin-top: 30px;
  padding: 20px;
  box-sizing: border-box;

  background: #101722;
  color: #f5f5f5;

  border: 1px solid #34445a;
  border-radius: 12px;
}

.artwork-header {
  margin-bottom: 20px;
}

.artwork-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  color: white;
}

.artwork-header p {
  margin: 0;
  color: #b8c4d5;
  font-size: 14px;
}

/* MAIN LAYOUT */

.editor-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1.35fr);

  gap: 20px;
  align-items: start;
}

.editor-controls,
.preview-container {
  min-width: 0;
  box-sizing: border-box;

  background: #111924;
  border: 1px solid #34445a;
  border-radius: 8px;
}

.editor-controls {
  padding: 0;
  overflow: hidden;
}

/* EDITOR SECTIONS */

.editor-section {
  padding: 16px 18px;
  border-bottom: 1px solid #34445a;
}

.editor-section h3 {
  margin: 0 0 16px;
  font-size: 15px;
  color: white;
}

.editor-section label {
  font-size: 12px;
  font-weight: 500;
  color: #dce4f0;
}

/* FILE UPLOAD */

.editor-section input[type="file"] {
  display: block;
  width: 100%;
  box-sizing: border-box;

  padding: 10px;

  background: #1d2939;
  color: white;

  border: 1px solid #48566b;
  border-radius: 6px;
}

.file-details {
  margin-top: 8px;
  font-size: 12px;
  color: #b8c4d5;
  overflow-wrap: anywhere;
}

/* FONT AND COLOR ROW */

.font-color-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 75px 85px;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.font-field,
.color-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.font-field select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  padding: 9px;

  background: #1d2939;
  color: white;

  border: 1px solid #48566b;
  border-radius: 6px;
}

.color-field input[type="color"],
.border-color-control input[type="color"] {
  width: 55px;
  height: 37px;

  padding: 3px;
  box-sizing: border-box;

  background: #1d2939;
  border: 1px solid #48566b;
  border-radius: 6px;

  cursor: pointer;
}

/* COMPACT SLIDER ROWS */

.setting-row {
  display: grid;
  grid-template-columns:
    125px
    minmax(0, 1fr)
    65px;

  align-items: center;
  gap: 10px;

  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  margin-bottom: 12px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row label {
  margin: 0;
  line-height: 1.4;
}

.setting-row input[type="range"] {
  width: 100%;
  min-width: 0;

  margin: 0;
  padding: 0;

  box-sizing: border-box;
  accent-color: #3478f6;

  cursor: pointer;
}

.setting-number {
  width: 65px;
  min-width: 0;

  box-sizing: border-box;

  padding: 7px 4px;
  text-align: center;

  background: #1d2939;
  color: white;

  border: 1px solid #48566b;
  border-radius: 6px;
}

.setting-number:focus,
.font-field select:focus {
  outline: none;
  border-color: #3478f6;
}

.setting-placeholder {
  font-size: 12px;
  color: #b8c4d5;
  overflow-wrap: anywhere;
}

/* BUTTONS */

.editor-actions {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
}

.editor-actions button {
  padding: 11px 12px;

  border-radius: 6px;
  cursor: pointer;

  font-size: 13px;
  font-weight: 600;
}

.reset-button {
  background: #263345;
  color: white;
  border: 1px solid #48566b;
}

.reset-button:hover {
  background: #34465f;
}

.export-button {
  flex: 1;

  background: #2864d9;
  color: white;

  border: 1px solid #4084ff;
}

.export-button:hover {
  background: #3478f6;
}

/* LIVE PREVIEW */

.preview-container {
  position: sticky;
  top: 20px;

  align-self: start;
  padding: 20px;
}

.preview-header {
  text-align: left;
}

.preview-header h3 {
  margin: 0 0 6px;
  font-size: 17px;
  color: white;
}

.preview-header p {
  margin: 0;
  font-size: 12px;
  color: #b8c4d5;
}

.preview-container canvas {
  display: block;

  width: 100%;
  max-width: 520px;
  height: auto;

  margin: 20px auto 0;

  background: #080b12;
  border: 1px solid #48566b;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 250px;
  margin-top: 20px;
  padding: 20px;

  text-align: center;
  color: #b8c4d5;

  background: #0b111a;
  border: 1px dashed #48566b;
  border-radius: 6px;
}

.error {
  color: #ff7777;
  font-size: 13px;
}

/* RESPONSIVE LAYOUT */

@media (max-width: 950px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .preview-container {
    position: static;
  }
}

@media (max-width: 500px) {
  .pack-artwork-editor {
    padding: 12px;
  }

  .setting-row {
    grid-template-columns:
      100px
      minmax(0, 1fr)
      60px;

    gap: 7px;
  }

  .setting-number {
    width: 60px;
  }

  .font-color-row {
    grid-template-columns:
      minmax(0, 1fr)
      65px
      65px;

    gap: 8px;
  }

  .editor-actions {
    flex-direction: column;
  }
}
</style>