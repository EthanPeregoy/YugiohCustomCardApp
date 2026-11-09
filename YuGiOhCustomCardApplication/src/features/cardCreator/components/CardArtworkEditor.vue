<script setup lang="ts">
defineProps<{
  artworkUrl: string | null;
  artworkX: number;
  artworkY: number;
  artworkScale: number;
}>();

const emit = defineEmits<{
  "upload": [file: File];
  "update:artworkX": [value: number];
  "update:artworkY": [value: number];
  "update:artworkScale": [value: number];
  "reset": [];
}>();

function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    emit("upload", file);
  }
}
</script>

<template>
  <div class="card-artwork-editor">
    <h3>Artwork Editor</h3>

    <label>
      Upload Artwork
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="handleUpload"
      />
    </label>

    <label>
      Horizontal Position: {{ artworkX }}
      <input
        type="range"
        min="-200"
        max="200"
        step="1"
        :value="artworkX"
        @input="
          emit(
            'update:artworkX',
            Number(($event.target as HTMLInputElement).value)
          )
        "
      />
    </label>

    <label>
      Vertical Position: {{ artworkY }}
      <input
        type="range"
        min="-200"
        max="200"
        step="1"
        :value="artworkY"
        @input="
          emit(
            'update:artworkY',
            Number(($event.target as HTMLInputElement).value)
          )
        "
      />
    </label>

    <label>
      Zoom: {{ artworkScale.toFixed(2) }}x
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.05"
        :value="artworkScale"
        @input="
          emit(
            'update:artworkScale',
            Number(($event.target as HTMLInputElement).value)
          )
        "
      />
    </label>

    <button type="button" @click="emit('reset')">
      Reset Artwork
    </button>
  </div>
</template>